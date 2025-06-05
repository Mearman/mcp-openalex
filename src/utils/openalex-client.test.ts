import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchFromOpenAlex, OpenAlexError } from './openalex-client.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('fetchFromOpenAlex', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch data successfully', async () => {
		const mockData = { results: [], meta: { count: 0 } };
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});

		const result = await fetchFromOpenAlex('/works', { search: 'test' });
		expect(result).toEqual(mockData);
		expect(global.fetch).toHaveBeenCalledWith(
			'https://api.openalex.org/works?search=test',
			expect.objectContaining({
				headers: expect.objectContaining({
					'User-Agent': 'mcp-openalex',
				}),
			}),
		);
	});

	it('should include mailto in URL and User-Agent when provided', async () => {
		const mockData = { results: [] };
		(global.fetch as any).mockResolvedValueOnce({
			ok: true,
			json: async () => mockData,
		});

		await fetchFromOpenAlex('/authors', {}, { mailto: 'test@example.com' });
		
		expect(global.fetch).toHaveBeenCalledWith(
			'https://api.openalex.org/authors?mailto=test%40example.com',
			expect.objectContaining({
				headers: expect.objectContaining({
					'User-Agent': 'mcp-openalex (test@example.com)',
				}),
			}),
		);
	});

	it('should throw OpenAlexError on HTTP error', async () => {
		(global.fetch as any).mockResolvedValueOnce({
			ok: false,
			status: 404,
			statusText: 'Not Found',
			text: async () => 'Resource not found',
		});

		await expect(fetchFromOpenAlex('/works/invalid')).rejects.toThrow(OpenAlexError);
	});

	it('should handle network errors', async () => {
		(global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

		await expect(fetchFromOpenAlex('/works')).rejects.toThrow(OpenAlexError);
	});
});