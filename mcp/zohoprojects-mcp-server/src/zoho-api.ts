const USER_AGENT = "Zoho Projects MCP Server/1.0";

// Portal interfaces
export interface ZohoPortal {
	id: string;
	portal_name: string;
	portal_url?: string;
	org_name?: string;
	is_default_portal?: boolean;
	timezone?: string;
	owner: {
		email: string;
		full_name: string;
		first_name: string;
		last_name: string;
		zpuid?: string;
		id?: number;
	};
	profile?: {
		name?: string;
		id?: string;
	};
}

// Project interfaces
export interface ZohoProject {
	id: string;
	id_string?: string;
	key?: string;
	name: string;
	status: {
		id?: string;
		name?: string;
		color?: string;
		color_hexcode?: string;
		is_closed_type?: boolean;
	} | string; // Can be object or string depending on API version
	start_date?: string;
	end_date?: string;
	owner_id?: string;
	owner?: {
		zuid?: number;
		zpuid?: string;
		name?: string;
		email?: string;
		first_name?: string;
		last_name?: string;
		full_name?: string;
	};
	role?: string;
	is_public?: boolean;
	is_public_project?: boolean;
	created_date?: string;
	created_time?: string;
	updated_date?: string;
	modified_time?: string;
	task_count?: {
		open?: number;
		closed?: number;
	};
	milestone_count?: {
		open?: number;
		closed?: number;
	};
	description?: string;
	project_type?: string;
}

// Task interfaces
export interface ZohoTask {
	id: string;
	id_string: string;
	name: string;
	key?: string;
	start_date?: string;
	end_date?: string;
	start_date_long?: number;
	end_date_long?: number;
	duration?: string;
	work?: string;
	status?: {
		name?: string;
		id?: string;
		type?: string;
	};
	priority?: string;
	percent_complete?: string;
	subtasks?: any[];
	created_time?: string;
	created_time_long?: number;
	last_updated_time?: string;
	last_updated_time_long?: number;
	tasklist?: {
		id?: string;
		name?: string;
	};
	owners?: Array<{
		id?: string;
		name?: string;
		email?: string;
	}>;
}

// Time log interfaces
export interface ZohoTimeLog {
	id: string;
	id_string: string;
	notes: string;
	hours_display: string;
	total_minutes: number;
	bill_status: string;
	owner_name?: string;
	owner_id?: string;
	created_time?: string;
	created_time_long?: number;
	log_date?: string;
	log_date_long?: number;
	task?: {
		id?: string;
		name?: string;
	};
	project?: {
		id?: string;
		name?: string;
	};
}

export interface TimeLogInput {
	date: string; // YYYY-MM-DD format (e.g., "2025-01-18")
	bill_status: "Billable" | "Non Billable";
	hours: string; // Decimal hours (e.g., "2", "2.5") or HH:MM format (e.g., "02:30") - will be converted to decimal
	notes: string;
	log_name?: string; // Optional log name - defaults to "Time Log - {date}" if not provided
	owner_id?: string; // owner_zpuid if you want to log time for a specific user
	approver?: string; // approver_zpuid - required by API
}

export interface ZohoUser {
	id: string;
	zpuid: string;
	name: string;
	email: string;
	role?: string;
	is_active?: boolean;
}

export class ZohoProjectsApi {
	private accessToken: string;
	private portalId: string;
	private hostUrl: string;
	private userEmail?: string;
	private userZpuid?: string;
	private cachedPortals?: ZohoPortal[];

	constructor(accessToken: string, portalId: string, apiDomain?: string, userEmail?: string, userZpuid?: string) {
		this.accessToken = accessToken;
		this.portalId = portalId;
		this.userEmail = userEmail;
		this.userZpuid = userZpuid;
		// Use provided apiDomain or default to Canadian data center
		// Ensure the API domain includes the /api/v3 path
		if (apiDomain) {
			this.hostUrl = apiDomain.endsWith('/api/v3') ? apiDomain : `${apiDomain}/api/v3`;
		} else {
			this.hostUrl = "https://projectsapi.zohocloud.ca/api/v3";
		}
		console.error(`[ZohoAPI] Initialized with hostUrl: ${this.hostUrl}, portalId: ${this.portalId}`);
	}

	// Helper to get a portal ID - uses provided ID, falls back to default, or fetches first portal
	private async getPortalId(portalId?: string): Promise<string> {
		if (portalId) return portalId;
		if (this.portalId) return this.portalId;

		// If no portal ID is set, fetch portals and use the first one
		console.error('[ZohoAPI] No portalId set, fetching portals...');
		if (!this.cachedPortals) {
			this.cachedPortals = await this.getPortals();
		}
		if (this.cachedPortals.length === 0) {
			throw new Error("No portals available for this user");
		}
		this.portalId = this.cachedPortals[0].id;
		console.error(`[ZohoAPI] Using first portal: ${this.cachedPortals[0].portal_name} (${this.portalId})`);
		return this.portalId;
	}

	private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const headers = {
			"Authorization": `Zoho-oauthtoken ${this.accessToken}`,
			"Content-Type": "application/json",
			...options.headers,
		};

		const url = `${this.hostUrl}${endpoint}`;
		console.error(`[ZohoAPI] ${options.method || 'GET'} ${url}`);
		if (options.body) {
			console.error(`[ZohoAPI] Request body:`, options.body.toString().substring(0, 500));
		}

		const response = await fetch(url, {
			...options,
			headers,
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`[ZohoAPI] Error ${response.status} for ${url}`);
			console.error(`[ZohoAPI] Error response:`, errorText);
			if (options.body) {
				console.error(`[ZohoAPI] Request body was:`, options.body);
			}
			throw new Error(`Zoho API error (${response.status}): ${errorText}`);
		}

		const text = await response.text();
		console.error(`[ZohoAPI] Success for ${url}`);
		console.error(`[ZohoAPI] Raw response body:`, text.substring(0, 1000)); // Log first 1000 chars

		const data = JSON.parse(text) as T;
		return data;
	}

	// Get all portals accessible to the user
	async getPortals(): Promise<ZohoPortal[]> {
		// The API returns an array directly, not wrapped in { portals: [...] }
		const response = await this.makeRequest<ZohoPortal[]>("/portals");
		console.error(`[ZohoAPI] getPortals returned ${response?.length || 0} portal(s)`);
		if (response && response.length > 0) {
			response.forEach((portal, idx) => {
				console.error(`[ZohoAPI]   Portal ${idx + 1}: ${portal.portal_name} (ID: ${portal.id})`);
			});
		}
		return response || [];
	}

	// Get all projects in the portal
	async getProjects(status: "active" | "archived" | "template" | "all" = "all", portalId?: string): Promise<ZohoProject[]> {
		const pid = await this.getPortalId(portalId);
		const params = new URLSearchParams();
		if (status !== "all") {
			params.set("status", status);
		}

		const queryString = params.toString();
		const endpoint = `/portal/${pid}/projects${queryString ? `?${queryString}` : ""}`;

		// The API returns an array directly, not wrapped in { projects: [...] }
		const projects = await this.makeRequest<ZohoProject[]>(endpoint);
		console.error(`[ZohoAPI] getProjects(status=${status}) returned ${projects.length} project(s) for portal ${pid}`);

		// Filter to only return essential fields to reduce token usage
		const simplifiedProjects = projects.map(project => {
			const statusDisplay = typeof project.status === 'object' ? project.status.name : project.status;
			return {
				id: project.id,
				id_string: project.id_string,
				name: project.name,
				status: statusDisplay,
				start_date: project.start_date,
				end_date: project.end_date,
				owner: project.owner ? {
					name: project.owner.name || project.owner.full_name,
					email: project.owner.email,
					zpuid: project.owner.zpuid,
				} : undefined,
				description: project.description,
			};
		});

		if (simplifiedProjects.length > 0) {
			simplifiedProjects.forEach((project, idx) => {
				console.error(`[ZohoAPI]   Project ${idx + 1}: ${project.name} (ID: ${project.id}, Status: ${project.status})`);
			});
		}
		return simplifiedProjects as ZohoProject[];
	}

	// Get tasks for a specific project
	async getTasks(projectId: string, portalId?: string): Promise<ZohoTask[]> {
		const pid = await this.getPortalId(portalId);
		// The API response might be wrapped or unwrapped
		const response = await this.makeRequest<ZohoTask[] | { tasks: ZohoTask[] }>(
			`/portal/${pid}/projects/${projectId}/tasks`
		);

		// Handle both wrapped and unwrapped responses
		const tasks = Array.isArray(response) ? response : (response as { tasks: ZohoTask[] }).tasks || [];

		// Filter to only return essential fields to reduce token usage
		const simplifiedTasks = tasks.map(task => ({
			id: task.id,
			id_string: task.id_string,
			name: task.name,
			key: task.key,
			start_date: task.start_date,
			end_date: task.end_date,
			status: task.status,
			priority: task.priority,
			percent_complete: task.percent_complete,
			tasklist: task.tasklist,
			owners: task.owners,
		}));

		return simplifiedTasks as ZohoTask[];
	}

	// Add a time log to a task
	async addTimeLog(projectId: string, taskId: string, timeLog: TimeLogInput, portalId?: string): Promise<ZohoTimeLog> {
		const pid = await this.getPortalId(portalId);

		// Validate date format (must be YYYY-MM-DD)
		if (!/^\d{4}-\d{2}-\d{2}$/.test(timeLog.date)) {
			throw new Error(`Invalid date format: "${timeLog.date}". Expected YYYY-MM-DD format (e.g., "2025-01-18")`);
		}

		// Convert HH:MM to decimal hours if provided in that format
		let hours = timeLog.hours;
		if (/^\d{1,2}:\d{2}$/.test(timeLog.hours)) {
			// Convert "02:30" to "2.5"
			const [h, m] = timeLog.hours.split(':').map(Number);
			hours = (h + m / 60).toString();
			console.error(`[ZohoAPI] Converting hours: ${timeLog.hours} -> ${hours}`);
		}

		// Use provided owner_id (zpuid) if available, fall back to instance userZpuid
		// If not provided, Zoho API should default to the authenticated user
		const ownerZpuid = timeLog.owner_id || this.userZpuid;

		if (ownerZpuid) {
			console.error(`[ZohoAPI] Adding time log - date: ${timeLog.date}, hours: ${hours}, owner: ${ownerZpuid}`);
		} else {
			console.error(`[ZohoAPI] Adding time log - date: ${timeLog.date}, hours: ${hours}, owner: <authenticated user>`);
		}

		// Generate default log name if not provided
		const logName = timeLog.log_name || `Time Log - ${timeLog.date}`;

		// Match the exact format from the web UI
		const requestBody: any = {
			date: timeLog.date,
			bill_status: timeLog.bill_status,
			hours: hours,
			notes: `<div>${timeLog.notes}</div>`,
			log_name: logName,
			for_timer: false,
			frompage: "list",
			module: {
				type: "task",
				id: taskId,
			},
		};

		// Only include owner_zpuid if we have it
		if (ownerZpuid) {
			requestBody.owner_zpuid = ownerZpuid;
		}

		// Add approver if provided (required by API)
		if (timeLog.approver) {
			requestBody.approver = timeLog.approver;
		}

		// The API returns an array directly, not wrapped in { timelogs: [...] }
		const response = await this.makeRequest<ZohoTimeLog[]>(
			`/portal/${pid}/projects/${projectId}/log`,
			{
				method: "POST",
				body: JSON.stringify(requestBody),
			}
		);

		// API returns array, get first item
		return response[0];
	}

	// Add a general time log (not associated with a specific task)
	async addGeneralTimeLog(projectId: string, timeLog: TimeLogInput, portalId?: string): Promise<ZohoTimeLog> {
		const pid = await this.getPortalId(portalId);

		// Validate date format (must be YYYY-MM-DD)
		if (!/^\d{4}-\d{2}-\d{2}$/.test(timeLog.date)) {
			throw new Error(`Invalid date format: "${timeLog.date}". Expected YYYY-MM-DD format (e.g., "2025-01-18")`);
		}

		// Convert HH:MM to decimal hours if provided in that format
		let hours = timeLog.hours;
		if (/^\d{1,2}:\d{2}$/.test(timeLog.hours)) {
			// Convert "02:30" to "2.5"
			const [h, m] = timeLog.hours.split(':').map(Number);
			hours = (h + m / 60).toString();
			console.error(`[ZohoAPI] Converting hours: ${timeLog.hours} -> ${hours}`);
		}

		// Use provided owner_id (zpuid) if available, fall back to instance userZpuid
		// If not provided, Zoho API should default to the authenticated user
		const ownerZpuid = timeLog.owner_id || this.userZpuid;

		if (ownerZpuid) {
			console.error(`[ZohoAPI] Adding general time log - date: ${timeLog.date}, hours: ${hours}, owner: ${ownerZpuid}`);
		} else {
			console.error(`[ZohoAPI] Adding general time log - date: ${timeLog.date}, hours: ${hours}, owner: <authenticated user>`);
		}

		// Generate default log name if not provided
		const logName = timeLog.log_name || `Time Log - ${timeLog.date}`;

		// Match the exact format from the web UI
		const requestBody: any = {
			date: timeLog.date,
			bill_status: timeLog.bill_status,
			hours: hours,
			notes: `<div>${timeLog.notes}</div>`,
			log_name: logName,
			for_timer: false,
			frompage: "list",
			module: {
				type: "general",
			},
		};

		// Only include owner_zpuid if we have it
		if (ownerZpuid) {
			requestBody.owner_zpuid = ownerZpuid;
		}

		// Add approver if provided (required by API)
		if (timeLog.approver) {
			requestBody.approver = timeLog.approver;
		}

		// The API returns an array directly, not wrapped in { timelogs: [...] }
		const response = await this.makeRequest<ZohoTimeLog[]>(
			`/portal/${pid}/projects/${projectId}/log`,
			{
				method: "POST",
				body: JSON.stringify(requestBody),
			}
		);

		return response[0];
	}

	// Get time logs for a project
	async getTimeLogs(projectId: string, options: {
		fromDate?: string; // YYYY-MM-DD
		toDate?: string;   // YYYY-MM-DD
		userId?: string;
		portalId?: string;
	} = {}): Promise<ZohoTimeLog[]> {
		const pid = await this.getPortalId(options.portalId);
		const params = new URLSearchParams();

		if (options.fromDate) params.set("date_from", options.fromDate);
		if (options.toDate) params.set("date_to", options.toDate);
		if (options.userId) params.set("users_list", options.userId);

		const queryString = params.toString();
		// V3 API uses /timelogs not /logs
		const endpoint = `/portal/${pid}/projects/${projectId}/timelogs${queryString ? `?${queryString}` : ""}`;

		// The API returns an array directly, not wrapped in { timelogs: [...] }
		const timelogs = await this.makeRequest<ZohoTimeLog[]>(endpoint);
		return timelogs || [];
	}

	// Get current user information (from portal context)
	async getCurrentUser(portalId?: string): Promise<ZohoUser> {
		const pid = await this.getPortalId(portalId);

		// Fetch current authenticated user using the /users/me endpoint
		// This works for non-admin users and doesn't require email
		const response = await this.makeRequest<{
			id: string; // This is the zpuid for Zoho Projects
			zuid: string; // This is the ZUID for Zoho Accounts
			full_name: string;
			email: string;
			role?: any;
			is_active?: boolean;
		}>(
			`/portal/${pid}/users/me`
		);

		// Map the response to ZohoUser interface
		const userData: ZohoUser = {
			id: response.id,
			zpuid: response.id, // The 'id' field is the zpuid
			name: response.full_name,
			email: response.email,
			role: response.role?.name,
			is_active: response.is_active,
		};

		console.error(`[ZohoAPI] getCurrentUser found: ${userData.name} (zpuid: ${userData.zpuid})`);
		return userData;
	}

	// Start a timer for a task
	async startTimer(projectId: string, taskId: string, notes: string = "", portalId?: string): Promise<ZohoTimeLog> {
		const pid = await this.getPortalId(portalId);
		const today = new Date().toISOString().split('T')[0];

		// The API returns an array directly, not wrapped in { timelogs: [...] }
		const response = await this.makeRequest<ZohoTimeLog[]>(
			`/portal/${pid}/projects/${projectId}/tasks/${taskId}/logs/timer`,
			{
				method: "POST",
				body: JSON.stringify({
					date: today,
					notes,
				}),
			}
		);

		return response[0];
	}

	// Stop a running timer
	async stopTimer(projectId: string, logId: string, portalId?: string): Promise<ZohoTimeLog> {
		const pid = await this.getPortalId(portalId);
		// The API returns an array directly, not wrapped in { timelogs: [...] }
		const response = await this.makeRequest<ZohoTimeLog[]>(
			`/portal/${pid}/projects/${projectId}/logs/${logId}/stop`,
			{
				method: "POST",
			}
		);

		return response[0];
	}

	// Get running timer (if any)
	async getRunningTimer(portalId?: string): Promise<ZohoTimeLog | null> {
		try {
			const pid = await this.getPortalId(portalId);
			// The API returns an array directly, not wrapped in { timelogs: [...] }
			const timelogs = await this.makeRequest<ZohoTimeLog[]>(
				`/portal/${pid}/logs/timer`
			);

			return timelogs?.[0] || null;
		} catch (error) {
			// If no timer is running, API might return an error
			return null;
		}
	}
}
