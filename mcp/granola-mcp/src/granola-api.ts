/**
 * Granola API Client
 * Handles communication with the Granola public API.
 */

const BASE_URL = "https://public-api.granola.ai";

export interface User {
  name: string;
  email: string;
}

export interface CalendarEvent {
  title?: string;
  start_time?: string;
  end_time?: string;
}

export interface Folder {
  id: string;
  name: string;
}

export interface TranscriptEntry {
  speaker?: string;
  text: string;
  timestamp?: string;
}

export interface Note {
  id: string;
  object: string;
  title: string | null;
  owner: User;
  created_at: string;
  calendar_event?: CalendarEvent | null;
  attendees?: User[];
  folder_membership?: Folder[];
  summary_text?: string;
  transcript?: TranscriptEntry[] | null;
}

export interface ListNotesResponse {
  notes: Note[];
  hasMore: boolean;
  cursor?: string;
}

export interface ListNotesParams {
  created_before?: string;
  created_after?: string;
  cursor?: string;
  page_size?: number;
}

export class GranolaApi {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined>
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Granola API error (${response.status}): ${errorText || response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * List notes with optional filters
   */
  async listNotes(params?: ListNotesParams): Promise<ListNotesResponse> {
    return this.request<ListNotesResponse>("/v1/notes", {
      created_before: params?.created_before,
      created_after: params?.created_after,
      cursor: params?.cursor,
      page_size: params?.page_size,
    });
  }

  /**
   * Get a specific note by ID
   */
  async getNote(noteId: string, includeTranscript = false): Promise<Note> {
    const params: Record<string, string | undefined> = {};
    if (includeTranscript) {
      params.include = "transcript";
    }
    return this.request<Note>(`/v1/notes/${noteId}`, params);
  }

  /**
   * Get all notes (handles pagination automatically)
   */
  async getAllNotes(params?: Omit<ListNotesParams, "cursor">): Promise<Note[]> {
    const allNotes: Note[] = [];
    let cursor: string | undefined;

    do {
      const response = await this.listNotes({
        ...params,
        cursor,
        page_size: params?.page_size || 30,
      });

      allNotes.push(...response.notes);
      cursor = response.hasMore ? response.cursor : undefined;
    } while (cursor);

    return allNotes;
  }
}
