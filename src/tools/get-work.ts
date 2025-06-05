import { z } from 'zod';
import { fetchFromOpenAlex } from '../utils/openalex-client.js';
import { WorkSchema } from '../types.js';

export const GetWorkSchema = z.object({
	id: z.string().describe('OpenAlex work ID (e.g., "W2741809807" or full URL)'),
	mailto: z.string().email().optional().describe('Email for polite pool access'),
});

export async function getWork(args: unknown) {
	const params = GetWorkSchema.parse(args);

	try {
		// Extract ID from full URL if provided
		let workId = params.id;
		if (workId.startsWith('https://openalex.org/')) {
			workId = workId.split('/').pop() || workId;
		}

		const work = await fetchFromOpenAlex<z.infer<typeof WorkSchema>>(
			`/works/${workId}`,
			{},
			{ mailto: params.mailto },
		);

		const validatedWork = WorkSchema.parse(work);

		// Format the detailed work information
		const authors = validatedWork.authorships.map((authorship) => ({
			name: authorship.author.display_name,
			position: authorship.author_position,
			institutions: authorship.institutions.map((inst) => inst.display_name).join(', '),
			orcid: authorship.author.orcid,
		}));

		const primaryLocation = validatedWork.primary_location;
		const openAccess = validatedWork.open_access;

		const formattedWork = {
			id: validatedWork.id,
			title: validatedWork.display_name,
			publication_year: validatedWork.publication_year,
			publication_date: validatedWork.publication_date,
			type: validatedWork.type,
			language: validatedWork.language,
			doi: validatedWork.doi,
			authors,
			venue: primaryLocation?.source?.display_name || 'Unknown',
			volume: validatedWork.biblio.volume,
			issue: validatedWork.biblio.issue,
			pages: validatedWork.biblio.first_page
				? `${validatedWork.biblio.first_page}-${validatedWork.biblio.last_page || ''}`
				: null,
			open_access: {
				is_oa: openAccess.is_oa,
				status: openAccess.oa_status,
				url: openAccess.oa_url,
			},
			primary_topic: validatedWork.primary_topic
				? {
						name: validatedWork.primary_topic.display_name,
						score: validatedWork.primary_topic.score,
					}
				: null,
			keywords: validatedWork.keywords.map((k) => k.display_name),
			cited_by_count: validatedWork.cited_by_count,
			references_count: validatedWork.referenced_works_count,
			is_retracted: validatedWork.is_retracted,
			landing_page_url: primaryLocation?.landing_page_url,
			pdf_url: primaryLocation?.pdf_url,
		};

		let responseText = `# ${formattedWork.title}\n\n`;
		responseText += `**Type:** ${formattedWork.type}\n`;
		responseText += `**Year:** ${formattedWork.publication_year || 'N/A'}\n`;
		responseText += `**Date:** ${formattedWork.publication_date || 'N/A'}\n`;
		responseText += `**Language:** ${formattedWork.language || 'N/A'}\n`;
		responseText += `**DOI:** ${formattedWork.doi || 'N/A'}\n\n`;

		responseText += `## Authors\n`;
		authors.forEach((author, i) => {
			responseText += `${i + 1}. ${author.name} (${author.position})`;
			if (author.institutions) responseText += ` - ${author.institutions}`;
			if (author.orcid) responseText += ` [ORCID: ${author.orcid}]`;
			responseText += '\n';
		});

		responseText += `\n## Publication Details\n`;
		responseText += `**Venue:** ${formattedWork.venue}\n`;
		if (formattedWork.volume) responseText += `**Volume:** ${formattedWork.volume}\n`;
		if (formattedWork.issue) responseText += `**Issue:** ${formattedWork.issue}\n`;
		if (formattedWork.pages) responseText += `**Pages:** ${formattedWork.pages}\n`;

		responseText += `\n## Open Access\n`;
		responseText += `**Is OA:** ${formattedWork.open_access.is_oa ? 'Yes' : 'No'}\n`;
		responseText += `**OA Status:** ${formattedWork.open_access.status}\n`;
		if (formattedWork.open_access.url)
			responseText += `**OA URL:** ${formattedWork.open_access.url}\n`;

		if (formattedWork.primary_topic) {
			responseText += `\n## Primary Topic\n`;
			responseText += `${formattedWork.primary_topic.name} (score: ${formattedWork.primary_topic.score.toFixed(2)})\n`;
		}

		if (formattedWork.keywords.length > 0) {
			responseText += `\n## Keywords\n`;
			responseText += formattedWork.keywords.join(', ') + '\n';
		}

		responseText += `\n## Metrics\n`;
		responseText += `**Citations:** ${formattedWork.cited_by_count}\n`;
		responseText += `**References:** ${formattedWork.references_count}\n`;
		if (formattedWork.is_retracted) responseText += `**⚠️ This work has been retracted**\n`;

		if (formattedWork.landing_page_url) {
			responseText += `\n## Links\n`;
			responseText += `**Landing page:** ${formattedWork.landing_page_url}\n`;
			if (formattedWork.pdf_url) responseText += `**PDF:** ${formattedWork.pdf_url}\n`;
		}

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
					text: `Error fetching work: ${error instanceof Error ? error.message : 'Unknown error'}`,
				},
			],
			isError: true,
		};
	}
}
