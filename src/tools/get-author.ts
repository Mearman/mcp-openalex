import { z } from 'zod';
import { fetchFromOpenAlex } from '../utils/openalex-client.js';
import { AuthorSchema } from '../types.js';

export const GetAuthorSchema = z.object({
	id: z.string().describe('OpenAlex author ID (e.g., "A2698986125" or full URL)'),
	mailto: z.string().email().optional().describe('Email for polite pool access'),
});

export async function getAuthor(args: unknown) {
	const params = GetAuthorSchema.parse(args);

	try {
		// Extract ID from full URL if provided
		let authorId = params.id;
		if (authorId.startsWith('https://openalex.org/')) {
			authorId = authorId.split('/').pop() || authorId;
		}

		const author = await fetchFromOpenAlex<z.infer<typeof AuthorSchema>>(
			`/authors/${authorId}`,
			{},
			{ mailto: params.mailto },
		);

		const validatedAuthor = AuthorSchema.parse(author);

		// Format the detailed author information
		let responseText = `# ${validatedAuthor.display_name}\n\n`;

		if (validatedAuthor.display_name_alternatives.length > 0) {
			responseText += `**Alternative names:** ${validatedAuthor.display_name_alternatives.join(', ')}\n`;
		}
		if (validatedAuthor.orcid) {
			responseText += `**ORCID:** ${validatedAuthor.orcid}\n`;
		}
		responseText += `**OpenAlex ID:** ${validatedAuthor.id}\n\n`;

		responseText += `## Career Metrics\n`;
		responseText += `- **Total Works:** ${validatedAuthor.works_count}\n`;
		responseText += `- **Total Citations:** ${validatedAuthor.cited_by_count}\n`;
		responseText += `- **h-index:** ${validatedAuthor.summary_stats.h_index}\n`;
		responseText += `- **i10-index:** ${validatedAuthor.summary_stats.i10_index}\n`;
		responseText += `- **2-year mean citedness:** ${validatedAuthor.summary_stats['2yr_mean_citedness'].toFixed(2)}\n\n`;

		if (validatedAuthor.last_known_institutions.length > 0) {
			responseText += `## Current Affiliations\n`;
			validatedAuthor.last_known_institutions.forEach((inst) => {
				responseText += `- ${inst.display_name}`;
				if (inst.country_code) responseText += ` (${inst.country_code})`;
				if (inst.type) responseText += ` - ${inst.type}`;
				responseText += '\n';
			});
			responseText += '\n';
		}

		if (validatedAuthor.affiliations.length > 0) {
			responseText += `## Affiliation History\n`;
			validatedAuthor.affiliations.slice(0, 5).forEach((affiliation) => {
				const years = affiliation.years.sort((a, b) => b - a);
				const yearRange =
					years.length > 1 ? `${years[years.length - 1]}-${years[0]}` : years[0];
				responseText += `- ${affiliation.institution.display_name} (${yearRange})`;
				if (affiliation.institution.country_code)
					responseText += ` - ${affiliation.institution.country_code}`;
				responseText += '\n';
			});
			if (validatedAuthor.affiliations.length > 5) {
				responseText += `  ...and ${validatedAuthor.affiliations.length - 5} more\n`;
			}
			responseText += '\n';
		}

		if (validatedAuthor.topics.length > 0) {
			responseText += `## Research Topics\n`;
			validatedAuthor.topics.slice(0, 10).forEach((topic) => {
				responseText += `- ${topic.display_name} (${topic.count} works)\n`;
				responseText += `  - Field: ${topic.field.display_name}\n`;
				responseText += `  - Domain: ${topic.domain.display_name}\n`;
			});
			if (validatedAuthor.topics.length > 10) {
				responseText += `  ...and ${validatedAuthor.topics.length - 10} more topics\n`;
			}
			responseText += '\n';
		}

		// Recent publication activity
		const recentYears = validatedAuthor.counts_by_year.slice(0, 5);
		if (recentYears.length > 0) {
			responseText += `## Recent Activity\n`;
			responseText += `| Year | Works | Citations |\n`;
			responseText += `|------|-------|----------|\n`;
			recentYears.forEach((year) => {
				responseText += `| ${year.year} | ${year.works_count} | ${year.cited_by_count} |\n`;
			});
			responseText += '\n';
		}

		// External IDs
		responseText += `## External IDs\n`;
		if (validatedAuthor.ids.orcid) responseText += `- ORCID: ${validatedAuthor.ids.orcid}\n`;
		if (validatedAuthor.ids.scopus) responseText += `- Scopus: ${validatedAuthor.ids.scopus}\n`;
		if (validatedAuthor.ids.twitter)
			responseText += `- Twitter: ${validatedAuthor.ids.twitter}\n`;
		if (validatedAuthor.ids.wikipedia)
			responseText += `- Wikipedia: ${validatedAuthor.ids.wikipedia}\n`;

		responseText += `\n## Links\n`;
		responseText += `- Works API: ${validatedAuthor.works_api_url}\n`;
		responseText += `- Updated: ${validatedAuthor.updated_date}\n`;

		return {
			content: [
				{
					type: 'text',
					text: responseText,
				},
			],
		};
	} catch (error) {
		return {
			content: [
				{
					type: 'text',
					text: `Error fetching author: ${error instanceof Error ? error.message : 'Unknown error'}`,
				},
			],
			isError: true,
		};
	}
}
