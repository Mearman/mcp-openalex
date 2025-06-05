import { z } from 'zod';

const BASE_URL = 'https://api.openalex.org';

export interface OpenAlexOptions {
	mailto?: string;
}

export class OpenAlexError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
		public response?: unknown,
	) {
		super(message);
		this.name = 'OpenAlexError';
	}
}

export async function fetchFromOpenAlex<T>(
	endpoint: string,
	params: Record<string, string | number | boolean> = {},
	options: OpenAlexOptions = {},
): Promise<T> {
	const url = new URL(`${BASE_URL}${endpoint}`);

	// Add parameters to URL
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			url.searchParams.append(key, String(value));
		}
	}

	// Add mailto for polite pool access
	if (options.mailto) {
		url.searchParams.append('mailto', options.mailto);
	}

	try {
		const response = await fetch(url.toString(), {
			headers: {
				'User-Agent': options.mailto ? `mcp-openalex (${options.mailto})` : 'mcp-openalex',
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new OpenAlexError(
				`OpenAlex API error: ${response.status} ${response.statusText}`,
				response.status,
				errorText,
			);
		}

		const data = await response.json();
		return data as T;
	} catch (error) {
		if (error instanceof OpenAlexError) {
			throw error;
		}
		throw new OpenAlexError(
			`Failed to fetch from OpenAlex: ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
	}
}

// Common response types
export const PaginationSchema = z.object({
	count: z.number(),
	db_response_time_ms: z.number(),
	page: z.number().optional(),
	per_page: z.number().optional(),
});

export const MetaSchema = z.object({
	count: z.number(),
	db_response_time_ms: z.number(),
	page: z.number().nullable(),
	per_page: z.number(),
	groups_count: z.number().nullable().optional(),
});

// Common filters
export const FilterSchema = z.object({
	search: z.string().optional(),
	filter: z.string().optional(),
	sort: z.string().optional(),
	page: z.number().optional(),
	per_page: z.number().optional(),
	mailto: z.string().email().optional(),
});

export type Filter = z.infer<typeof FilterSchema>;
