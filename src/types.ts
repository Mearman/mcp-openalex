import { z } from 'zod';

// Work types
export const WorkSchema = z.object({
	id: z.string(),
	doi: z.string().nullable(),
	title: z.string().nullable(),
	display_name: z.string(),
	publication_year: z.number().nullable(),
	publication_date: z.string().nullable(),
	ids: z.object({
		openalex: z.string(),
		doi: z.string().optional(),
		pmid: z.string().optional(),
		pmcid: z.string().optional(),
	}),
	language: z.string().nullable(),
	primary_location: z
		.object({
			source: z
				.object({
					id: z.string(),
					display_name: z.string(),
					issn_l: z.string().nullable(),
					issn: z.array(z.string()).nullable(),
					is_oa: z.boolean(),
					is_in_doaj: z.boolean(),
				})
				.nullable(),
			landing_page_url: z.string().nullable(),
			pdf_url: z.string().nullable(),
			license: z.string().nullable(),
			version: z.string().nullable(),
			is_oa: z.boolean(),
			is_accepted: z.boolean(),
			is_published: z.boolean(),
		})
		.nullable(),
	type: z.string(),
	type_crossref: z.string().nullable(),
	open_access: z.object({
		is_oa: z.boolean(),
		oa_status: z.string(),
		oa_url: z.string().nullable(),
		any_repository_has_fulltext: z.boolean(),
	}),
	authorships: z.array(
		z.object({
			author_position: z.string(),
			author: z.object({
				id: z.string(),
				display_name: z.string(),
				orcid: z.string().nullable(),
			}),
			institutions: z.array(
				z.object({
					id: z.string(),
					display_name: z.string(),
					ror: z.string().nullable(),
					country_code: z.string().nullable(),
					type: z.string().nullable(),
				}),
			),
			countries: z.array(z.string()),
			is_corresponding: z.boolean(),
			raw_author_name: z.string(),
			raw_affiliation_strings: z.array(z.string()),
		}),
	),
	biblio: z.object({
		volume: z.string().nullable(),
		issue: z.string().nullable(),
		first_page: z.string().nullable(),
		last_page: z.string().nullable(),
	}),
	is_retracted: z.boolean(),
	is_paratext: z.boolean(),
	primary_topic: z
		.object({
			id: z.string(),
			display_name: z.string(),
			score: z.number(),
		})
		.nullable(),
	topics: z.array(
		z.object({
			id: z.string(),
			display_name: z.string(),
			score: z.number(),
		}),
	),
	keywords: z.array(
		z.object({
			id: z.string(),
			display_name: z.string(),
			score: z.number(),
		}),
	),
	concepts: z.array(
		z.object({
			id: z.string(),
			wikidata: z.string(),
			display_name: z.string(),
			level: z.number(),
			score: z.number(),
		}),
	),
	mesh: z.array(z.unknown()),
	locations_count: z.number(),
	locations: z.array(z.unknown()),
	best_oa_location: z.unknown().nullable(),
	sustainable_development_goals: z.array(z.unknown()),
	grants: z.array(z.unknown()),
	datasets: z.array(z.unknown()),
	versions: z.array(z.unknown()),
	referenced_works_count: z.number(),
	referenced_works: z.array(z.string()),
	related_works: z.array(z.string()),
	cited_by_count: z.number(),
	cited_by_api_url: z.string(),
	counts_by_year: z.array(
		z.object({
			year: z.number(),
			cited_by_count: z.number(),
		}),
	),
	updated_date: z.string(),
	created_date: z.string(),
});

// Author types
export const AuthorSchema = z.object({
	id: z.string(),
	orcid: z.string().nullable(),
	display_name: z.string(),
	display_name_alternatives: z.array(z.string()),
	works_count: z.number(),
	cited_by_count: z.number(),
	summary_stats: z.object({
		'2yr_mean_citedness': z.number(),
		h_index: z.number(),
		i10_index: z.number(),
	}),
	ids: z.object({
		openalex: z.string(),
		orcid: z.string().nullable(),
		scopus: z.string().nullable(),
		twitter: z.string().nullable(),
		wikipedia: z.string().nullable(),
	}),
	affiliations: z.array(
		z.object({
			institution: z.object({
				id: z.string(),
				display_name: z.string(),
				ror: z.string().nullable(),
				country_code: z.string().nullable(),
				type: z.string().nullable(),
			}),
			years: z.array(z.number()),
		}),
	),
	last_known_institutions: z.array(
		z.object({
			id: z.string(),
			display_name: z.string(),
			ror: z.string().nullable(),
			country_code: z.string().nullable(),
			type: z.string().nullable(),
		}),
	),
	topics: z.array(
		z.object({
			id: z.string(),
			display_name: z.string(),
			count: z.number(),
			subfield: z.object({
				id: z.string(),
				display_name: z.string(),
			}),
			field: z.object({
				id: z.string(),
				display_name: z.string(),
			}),
			domain: z.object({
				id: z.string(),
				display_name: z.string(),
			}),
		}),
	),
	x_concepts: z.array(
		z.object({
			id: z.string(),
			wikidata: z.string(),
			display_name: z.string(),
			level: z.number(),
			score: z.number(),
		}),
	),
	counts_by_year: z.array(
		z.object({
			year: z.number(),
			works_count: z.number(),
			cited_by_count: z.number(),
		}),
	),
	works_api_url: z.string(),
	updated_date: z.string(),
	created_date: z.string(),
});

// Institution types
export const InstitutionSchema = z.object({
	id: z.string(),
	ror: z.string().nullable(),
	display_name: z.string(),
	display_name_alternatives: z.array(z.string()).optional(),
	display_name_acronyms: z.array(z.string()).optional(),
	country_code: z.string().nullable(),
	type: z.string().nullable(),
	homepage_url: z.string().nullable(),
	image_url: z.string().nullable(),
	image_thumbnail_url: z.string().nullable(),
	works_count: z.number(),
	cited_by_count: z.number(),
	summary_stats: z.object({
		'2yr_mean_citedness': z.number(),
		h_index: z.number(),
		i10_index: z.number(),
	}),
	ids: z.object({
		openalex: z.string(),
		ror: z.string().nullable(),
		grid: z.string().nullable(),
		wikipedia: z.string().nullable(),
		wikidata: z.string().nullable(),
		mag: z.string().nullable(),
	}),
	geo: z
		.object({
			city: z.string().nullable(),
			geonames_city_id: z.string().nullable(),
			region: z.string().nullable(),
			country_code: z.string().nullable(),
			country: z.string().nullable(),
			latitude: z.number().nullable(),
			longitude: z.number().nullable(),
		})
		.nullable(),
	international: z
		.object({
			display_name: z.record(z.string()),
		})
		.nullable(),
	associated_institutions: z.array(
		z.object({
			id: z.string(),
			ror: z.string().nullable(),
			display_name: z.string(),
			country_code: z.string().nullable(),
			type: z.string().nullable(),
			relationship: z.string(),
		}),
	),
	counts_by_year: z.array(
		z.object({
			year: z.number(),
			works_count: z.number(),
			cited_by_count: z.number(),
		}),
	),
	roles: z.array(
		z.object({
			role: z.string(),
			id: z.string(),
			works_count: z.number(),
		}),
	),
	topics: z.array(
		z.object({
			id: z.string(),
			display_name: z.string(),
			count: z.number(),
			subfield: z.object({
				id: z.string(),
				display_name: z.string(),
			}),
			field: z.object({
				id: z.string(),
				display_name: z.string(),
			}),
			domain: z.object({
				id: z.string(),
				display_name: z.string(),
			}),
		}),
	),
	x_concepts: z.array(
		z.object({
			id: z.string(),
			wikidata: z.string(),
			display_name: z.string(),
			level: z.number(),
			score: z.number(),
		}),
	),
	works_api_url: z.string(),
	updated_date: z.string(),
	created_date: z.string(),
});

// Source types
export const SourceSchema = z.object({
	id: z.string(),
	issn_l: z.string().nullable(),
	issn: z.array(z.string()).nullable(),
	display_name: z.string(),
	host_organization: z.string().nullable(),
	host_organization_name: z.string().nullable(),
	host_organization_lineage: z.array(z.string()),
	works_count: z.number(),
	cited_by_count: z.number(),
	summary_stats: z.object({
		'2yr_mean_citedness': z.number(),
		h_index: z.number(),
		i10_index: z.number(),
	}),
	is_oa: z.boolean(),
	is_in_doaj: z.boolean(),
	is_indexed_in_doaj: z.boolean().optional(),
	ids: z.object({
		openalex: z.string(),
		issn_l: z.string().nullable(),
		issn: z.array(z.string()).nullable(),
		mag: z.string().nullable(),
		wikidata: z.string().nullable(),
		fatcat: z.string().nullable(),
	}),
	homepage_url: z.string().nullable(),
	apc_prices: z.array(z.unknown()).nullable(),
	apc_usd: z.number().nullable(),
	country_code: z.string().nullable(),
	societies: z.array(z.unknown()),
	alternate_titles: z.array(z.string()),
	abbreviated_title: z.string().nullable(),
	type: z.string().nullable(),
	topics: z.array(
		z.object({
			id: z.string(),
			display_name: z.string(),
			count: z.number(),
			subfield: z.object({
				id: z.string(),
				display_name: z.string(),
			}),
			field: z.object({
				id: z.string(),
				display_name: z.string(),
			}),
			domain: z.object({
				id: z.string(),
				display_name: z.string(),
			}),
		}),
	),
	x_concepts: z.array(
		z.object({
			id: z.string(),
			wikidata: z.string(),
			display_name: z.string(),
			level: z.number(),
			score: z.number(),
		}),
	),
	counts_by_year: z.array(
		z.object({
			year: z.number(),
			works_count: z.number(),
			cited_by_count: z.number(),
		}),
	),
	works_api_url: z.string(),
	updated_date: z.string(),
	created_date: z.string(),
});

export type Work = z.infer<typeof WorkSchema>;
export type Author = z.infer<typeof AuthorSchema>;
export type Institution = z.infer<typeof InstitutionSchema>;
export type Source = z.infer<typeof SourceSchema>;

// Export MetaSchema from openalex-client
export { MetaSchema } from './utils/openalex-client.js';
