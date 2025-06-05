import { z } from 'zod';
import { fetchFromOpenAlex } from '../utils/openalex-client.js';
import { SourceSchema, MetaSchema } from '../types.js';

export const SearchSourcesSchema = z.object({
	search: z.string().optional().describe('Search query for sources/journals'),
	filter: z.string().optional().describe('Filter string (e.g., "is_oa:true")'),
	sort: z.string().optional().describe('Sort field (e.g., "works_count:desc")'),
	page: z.number().optional().default(1).describe('Page number (1-based)'),
	per_page: z.number().optional().default(25).describe('Results per page (max 200)'),
	mailto: z.string().email().optional().describe('Email for polite pool access'),
});

const SourcesResponseSchema = z.object({
	meta: MetaSchema,
	results: z.array(SourceSchema),
	group_by: z.array(z.unknown()).optional(),
});

export async function searchSources(args: unknown) {
	const params = SearchSourcesSchema.parse(args);

	try {
		const response = await fetchFromOpenAlex<z.infer<typeof SourcesResponseSchema>>(
			'/sources',
			params,
			{
				mailto: params.mailto,
			},
		);

		const validatedResponse = SourcesResponseSchema.parse(response);

		// Format results for better readability
		const formattedResults = validatedResponse.results.map((source) => ({
			id: source.id,
			name: source.display_name,
			type: source.type,
			publisher: source.host_organization_name,
			issn_l: source.issn_l,
			is_oa: source.is_oa,
			is_in_doaj: source.is_in_doaj,
			works_count: source.works_count,
			cited_by_count: source.cited_by_count,
			h_index: source.summary_stats.h_index,
			apc_usd: source.apc_usd,
			country: source.country_code,
			homepage: source.homepage_url,
		}));

		return {
			content: [
				{
					type: 'text',
					text: `Found ${validatedResponse.meta.count} sources (showing ${formattedResults.length} results):\n\n${formattedResults
						.map(
							(source, i) =>
								`${i + 1}. ${source.name}\n   Type: ${source.type || 'Unknown'}${
									source.publisher ? `, Publisher: ${source.publisher}` : ''
								}\n   ISSN-L: ${source.issn_l || 'N/A'}, Country: ${source.country || 'Unknown'}\n   Open Access: ${
									source.is_oa ? 'Yes' : 'No'
								}, In DOAJ: ${source.is_in_doaj ? 'Yes' : 'No'}${
									source.apc_usd ? `, APC: $${source.apc_usd}` : ''
								}\n   Works: ${source.works_count}, Citations: ${source.cited_by_count}, h-index: ${source.h_index}${
									source.homepage ? `\n   Homepage: ${source.homepage}` : ''
								}\n   ID: ${source.id}`,
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
					text: `Error searching sources: ${error instanceof Error ? error.message : 'Unknown error'}`,
				},
			],
			isError: true,
		};
	}
}
