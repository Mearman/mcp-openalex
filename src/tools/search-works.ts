import { z } from 'zod';
import { MetaSchema, WorkSchema } from '../types.js';
import { fetchFromOpenAlex } from '../utils/openalex-client.js';

export const SearchWorksSchema = z.object({
	search: z.string().optional().describe('Search query for works'),
	filter: z.string().optional().describe('Filter string (e.g., "publication_year:2023")'),
	sort: z.string().optional().describe('Sort field (e.g., "cited_by_count:desc")'),
	page: z.number().optional().default(1).describe('Page number (1-based)'),
	per_page: z.number().optional().default(25).describe('Results per page (max 200)'),
	mailto: z.string().email().optional().describe('Email for polite pool access'),
});

const WorksResponseSchema = z.object({
	meta: MetaSchema,
	results: z.array(WorkSchema),
	group_by: z.array(z.unknown()).optional(),
});

export async function searchWorks(args: unknown) {
	const params = SearchWorksSchema.parse(args);

	try {
		const response = await fetchFromOpenAlex<z.infer<typeof WorksResponseSchema>>(
			'/works',
			params,
			{
				mailto: params.mailto,
			},
		);

		const validatedResponse = WorksResponseSchema.parse(response);

		// Format results for better readability
		const formattedResults = validatedResponse.results.map((work) => ({
			id: work.id,
			title: work.display_name,
			authors: work.authorships.slice(0, 3).map((a) => a.author.display_name),
			totalAuthors: work.authorships.length,
			year: work.publication_year,
			venue: work.primary_location?.source?.display_name || 'Unknown',
			type: work.type,
			open_access: work.open_access.is_oa,
			cited_by_count: work.cited_by_count,
			doi: work.doi,
		}));

		return {
			content: [
				{
					type: 'text',
					text: `Found ${validatedResponse.meta.count} works (showing ${formattedResults.length} results):\n\n${formattedResults
						.map(
							(work, i) =>
								`${i + 1}. ${work.title}\n   Authors: ${work.authors.join(', ')}${
									work.authors.length < work.totalAuthors ? ', ...' : ''
								}\n   Year: ${work.year || 'N/A'}, Venue: ${work.venue}\n   Type: ${work.type}, Open Access: ${
									work.open_access ? 'Yes' : 'No'
								}\n   Citations: ${work.cited_by_count}${work.doi ? `\n   DOI: ${work.doi}` : ''}\n   ID: ${work.id}`,
						)
						.join('\n\n')}`,
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: 'text',
					text: `Error searching works: ${error instanceof Error ? error.message : 'Unknown error'}`,
				},
			],
			isError: true,
		};
	}
}
