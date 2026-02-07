const HOST_URL = "https://api.harvestapp.com/v2";
const USER_AGENT = "Harvest MCP Server/1.0";

export interface HarvestProject {
	id: number;
	name: string;
	client: {
		id: number;
		name: string;
	};
	is_active: boolean;
}

export interface HarvestTask {
	id: number;
	name: string;
	is_active: boolean;
}

export interface HarvestTaskAssignment {
	id: number;
	is_active: boolean;
	task: HarvestTask;
	project: HarvestProject;
}

export interface HarvestTimeEntry {
	id: number;
	user_id: number;
	project_id: number;
	task_id: number;
	spent_date: string;
	hours: number;
	notes: string;
	rounded_hours: number;
	is_running: boolean;
	project: {
		id: number;
		name: string;
	};
	client: {
		id: number;
		name: string;
	};
}

export interface HarvestUser {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	is_active: boolean;
}

export interface ReportEntry {
	project_id: number;
	project_name: string;
	client_id: number;
	client_name: string;
	total_hours: number;
	billable_hours: number;
}

export interface TimeEntryInput {
	project_id: number;
	task_id?: number;
	spent_date: string;
	hours: number;
	notes: string;
}

export class HarvestApi {
	private accessToken: string;
	private accountId: string;
	private userId?: number;

	constructor(accessToken: string, accountId: string) {
		this.accessToken = accessToken;
		this.accountId = accountId;
	}

	private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const headers = {
			"Authorization": `Bearer ${this.accessToken}`,
			"Harvest-Account-Id": this.accountId,
			"User-Agent": USER_AGENT,
			"Content-Type": "application/json",
			...options.headers,
		};

		const response = await fetch(`${HOST_URL}${endpoint}`, {
			...options,
			headers,
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Harvest API error (${response.status}): ${errorText}`);
		}

		return response.json() as Promise<T>;
	}

	async getCurrentUser(): Promise<HarvestUser> {
		const user = await this.makeRequest<HarvestUser>("/users/me");
		this.userId = user.id;
		return user;
	}

	async getProjects(): Promise<HarvestProject[]> {
		const response = await this.makeRequest<{ projects: HarvestProject[] }>("/projects?is_active=true");
		return response.projects;
	}

	async getTaskAssignments(projectId: number): Promise<HarvestTaskAssignment[]> {
		const response = await this.makeRequest<{ task_assignments: HarvestTaskAssignment[] }>(
			`/projects/${projectId}/task_assignments?is_active=true`
		);
		return response.task_assignments;
	}

	async addTimeEntry(timeEntry: TimeEntryInput): Promise<HarvestTimeEntry> {
		if (!this.userId) {
			await this.getCurrentUser();
		}

		// If no task_id provided, get the first active task for the project
		let taskId = timeEntry.task_id;
		if (!taskId) {
			const taskAssignments = await this.getTaskAssignments(timeEntry.project_id);
			if (taskAssignments.length === 0) {
				throw new Error(`No active tasks found for project ${timeEntry.project_id}`);
			}
			taskId = taskAssignments[0].task.id;
		}

		const timeEntryData = {
			user_id: this.userId,
			project_id: timeEntry.project_id,
			task_id: taskId,
			spent_date: timeEntry.spent_date,
			hours: timeEntry.hours,
			notes: timeEntry.notes,
		};

		return this.makeRequest<HarvestTimeEntry>("/time_entries", {
			method: "POST",
			body: JSON.stringify(timeEntryData),
		});
	}

	async getTimeEntries(options: {
		updatedSince?: string;
		userId?: number;
		from?: string;
		to?: string;
	} = {}): Promise<HarvestTimeEntry[]> {
		const params = new URLSearchParams();
		
		if (options.updatedSince) params.set("updated_since", options.updatedSince);
		if (options.userId) params.set("user_id", options.userId.toString());
		if (options.from) params.set("from", options.from);
		if (options.to) params.set("to", options.to);

		const queryString = params.toString();
		const endpoint = `/time_entries${queryString ? `?${queryString}` : ""}`;
		
		const response = await this.makeRequest<{ time_entries: HarvestTimeEntry[] }>(endpoint);
		return response.time_entries || [];
	}

	async getLatestTimeEntries(updatedSince: string): Promise<ReportEntry[]> {
		if (!this.userId) {
			await this.getCurrentUser();
		}

		const timeEntries = await this.getTimeEntries({
			updatedSince,
			userId: this.userId,
		});

		return timeEntries.map(entry => ({
			project_id: entry.project.id,
			project_name: entry.project.name,
			client_id: entry.client.id,
			client_name: entry.client.name,
			total_hours: entry.rounded_hours,
			billable_hours: entry.rounded_hours,
		}));
	}

	async getTimeReports(fromDate: string, toDate: string): Promise<ReportEntry[]> {
		const params = new URLSearchParams({
			from: fromDate,
			to: toDate,
		});

		const response = await this.makeRequest<{ results: ReportEntry[] }>(
			`/reports/time/projects?${params.toString()}`
		);

		return response.results || [];
	}

	async startTimer(projectId: number, taskId?: number, notes: string = ""): Promise<HarvestTimeEntry> {
		if (!this.userId) {
			await this.getCurrentUser();
		}

		// If no task_id provided, get the first active task for the project
		let finalTaskId = taskId;
		if (!finalTaskId) {
			const taskAssignments = await this.getTaskAssignments(projectId);
			if (taskAssignments.length === 0) {
				throw new Error(`No active tasks found for project ${projectId}`);
			}
			finalTaskId = taskAssignments[0].task.id;
		}

		const today = new Date().toISOString().split('T')[0];
		const timeEntryData = {
			user_id: this.userId,
			project_id: projectId,
			task_id: finalTaskId,
			spent_date: today,
			notes,
		};

		return this.makeRequest<HarvestTimeEntry>("/time_entries", {
			method: "POST",
			body: JSON.stringify(timeEntryData),
		});
	}

	async stopTimer(timeEntryId: number): Promise<HarvestTimeEntry> {
		return this.makeRequest<HarvestTimeEntry>(`/time_entries/${timeEntryId}/stop`, {
			method: "PATCH",
		});
	}

	async getRunningTimeEntry(): Promise<HarvestTimeEntry | null> {
		const today = new Date().toISOString().split('T')[0];
		const timeEntries = await this.getTimeEntries({
			from: today,
			to: today,
		});

		const runningEntry = timeEntries.find(entry => entry.is_running);
		return runningEntry || null;
	}
}