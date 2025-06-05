import { z } from 'zod';
import { fetchFromOpenAlex } from '../utils/openalex-client.js';
import { AuthorSchema, MetaSchema } from '../types.js';

export const SearchAuthorsSchema = z.object({
	search: z.string().optional().describe('Search query for authors'),
	filter: z.string().optional().describe('Filter string (e.g., "works_count:>100")'),
	sort: z.string().optional().describe('Sort field (e.g., "cited_by_count:desc")'),
	page: z.number().optional().default(1).describe('Page number (1-based)'),
	per_page: z.number().optional().default(25).describe('Results per page (max 200)'),
	mailto: z.string().email().optional().describe('Email for polite pool access'),
});

const AuthorsResponseSchema = z.object({
	meta: MetaSchema,
	results: z.array(AuthorSchema),
	group_by: z.array(z.unknown()).optional(),
});

export async function searchAuthors(args: unknown) {
	const params = SearchAuthorsSchema.parse(args);

	try {
		const response = await fetchFromOpenAlex<z.infer<typeof AuthorsResponseSchema>>(
			'/authors',
			params,
			{
				mailto: params.mailto,
			},
		);

		const validatedResponse = AuthorsResponseSchema.parse(response);

		// Format results for better readability
		const formattedResults = validatedResponse.results.map((author) => ({
			id: author.id,
			name: author.display_name,
			orcid: author.orcid,
			works_count: author.works_count,
			cited_by_count: author.cited_by_count,
			h_index: author.summary_stats.h_index,
			last_known_institutions: author.last_known_institutions.map(
				(inst) => inst.display_name,
			),
			topics: author.topics.slice(0, 3).map((t) => t.display_name),
		}));

		return {
			content: [
				{
					type: 'text',
					text: `Found ${validatedResponse.meta.count} authors (showing ${formattedResults.length} results):\n\n${formattedResults
						.map(
							(author, i) =>
								`${i + 1}. ${author.name}${author.orcid ? ` [ORCID: ${author.orcid}]` : ''}\n   Works: ${
									author.works_count
								}, Citations: ${author.cited_by_count}, h-index: ${author.h_index}\n   Institutions: ${
									author.last_known_institutions.join(', ') || 'Unknown'
								}\n   Topics: ${author.topics.join(', ') || 'N/A'}\n   ID: ${author.id}`,
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
					text: `Error searching authors: ${error instanceof Error ? error.message : 'Unknown error'}`,
				},
			],
			isError: true,
		};
	}
}
