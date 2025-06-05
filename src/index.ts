#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { GetAuthorSchema, getAuthor } from './tools/get-author.js';
import { GetWorkSchema, getWork } from './tools/get-work.js';
import { SearchAuthorsSchema, searchAuthors } from './tools/search-authors.js';
import { SearchInstitutionsSchema, searchInstitutions } from './tools/search-institutions.js';
import { SearchSourcesSchema, searchSources } from './tools/search-sources.js';
import { SearchWorksSchema, searchWorks } from './tools/search-works.js';

const server = new Server(
	{
		name: 'mcp-openalex',
		version: '0.1.0',
	},
	{
		capabilities: {
			tools: {},
		},
	},
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: 'search_works',
				description: 'Search for scholarly works/publications in OpenAlex',
				inputSchema: zodToJsonSchema(SearchWorksSchema),
			},
			{
				name: 'get_work',
				description: 'Get detailed information about a specific work by its OpenAlex ID',
				inputSchema: zodToJsonSchema(GetWorkSchema),
			},
			{
				name: 'search_authors',
				description: 'Search for authors in OpenAlex',
				inputSchema: zodToJsonSchema(SearchAuthorsSchema),
			},
			{
				name: 'get_author',
				description:
					'Get detailed information about a specific author by their OpenAlex ID',
				inputSchema: zodToJsonSchema(GetAuthorSchema),
			},
			{
				name: 'search_institutions',
				description: 'Search for academic institutions in OpenAlex',
				inputSchema: zodToJsonSchema(SearchInstitutionsSchema),
			},
			{
				name: 'search_sources',
				description: 'Search for sources (journals, conferences, repositories) in OpenAlex',
				inputSchema: zodToJsonSchema(SearchSourcesSchema),
			},
		],
	};
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;

	switch (name) {
		case 'search_works':
			return await searchWorks(args);
		case 'get_work':
			return await getWork(args);
		case 'search_authors':
			return await searchAuthors(args);
		case 'get_author':
			return await getAuthor(args);
		case 'search_institutions':
			return await searchInstitutions(args);
		case 'search_sources':
			return await searchSources(args);
		default:
			throw new Error(`Unknown tool: ${name}`);
	}
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);

// Handle shutdown gracefully
process.on('SIGINT', async () => {
	await server.close();
	process.exit(0);
});
