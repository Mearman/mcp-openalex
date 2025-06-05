import { z } from 'zod';
import { InstitutionSchema, MetaSchema } from '../types.js';
import { fetchFromOpenAlex } from '../utils/openalex-client.js';

export const SearchInstitutionsSchema = z.object({
	search: z.string().optional().describe('Search query for institutions'),
	filter: z.string().optional().describe('Filter string (e.g., "country_code:US")'),
	sort: z.string().optional().describe('Sort field (e.g., "works_count:desc")'),
	page: z.number().optional().default(1).describe('Page number (1-based)'),
	per_page: z.number().optional().default(25).describe('Results per page (max 200)'),
	mailto: z.string().email().optional().describe('Email for polite pool access'),
});

const InstitutionsResponseSchema = z.object({
	meta: MetaSchema,
	results: z.array(InstitutionSchema),
	group_by: z.array(z.unknown()).optional(),
});

export async function searchInstitutions(args: unknown) {
	const params = SearchInstitutionsSchema.parse(args);

	try {
		const response = await fetchFromOpenAlex<z.infer<typeof InstitutionsResponseSchema>>(
			'/institutions',
			params,
			{
				mailto: params.mailto,
			},
		);

		const validatedResponse = InstitutionsResponseSchema.parse(response);

		// Format results for better readability
		const formattedResults = validatedResponse.results.map((institution) => ({
			id: institution.id,
			name: institution.display_name,
			type: institution.type,
			country: institution.country_code,
			city: institution.geo?.city,
			works_count: institution.works_count,
			cited_by_count: institution.cited_by_count,
			h_index: institution.summary_stats.h_index,
			homepage: institution.homepage_url,
			ror: institution.ror,
		}));

		return {
			content: [
				{
					type: 'text',
					text: `Found ${validatedResponse.meta.count} institutions (showing ${
						formattedResults.length
					} results):\n\n${formattedResults
						.map(
							(inst, i) =>
								`${i + 1}. ${inst.name}\n   Type: ${inst.type || 'Unknown'}, Country: ${inst.country || 'Unknown'}${
									inst.city ? `, City: ${inst.city}` : ''
								}\n   Works: ${inst.works_count}, Citations: ${inst.cited_by_count}, h-index: ${inst.h_index}${
									inst.homepage ? `\n   Homepage: ${inst.homepage}` : ''
								}${inst.ror ? `\n   ROR: ${inst.ror}` : ''}\n   ID: ${inst.id}`,
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
					text: `Error searching institutions: ${error instanceof Error ? error.message : 'Unknown error'}`,
				},
			],
			isError: true,
		};
	}
}
