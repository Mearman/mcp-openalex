# MCP OpenAlex

[![npm version](https://img.shields.io/npm/v/mcp-openalex.svg)](https://www.npmjs.com/package/mcp-openalex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An MCP (Model Context Protocol) server that provides access to the OpenAlex API for scholarly publications and research data.

## Features

- 🔍 Search scholarly works, authors, institutions, and sources
- 📚 Access detailed metadata for academic publications
- 👥 Explore author profiles and publication histories
- 🏛️ Browse institutional research outputs
- 📰 Discover academic journals and sources
- 🔓 No API key required (optional polite pool access with email)
- 🚀 Built with TypeScript for type safety

## Available Tools

### Works (Publications)
- **search_works**: Search for scholarly publications with filters
- **get_work**: Get detailed information about a specific work

### Authors
- **search_authors**: Search for researchers and authors
- **get_author**: Get detailed author profiles including metrics and affiliations

### Institutions
- **search_institutions**: Search for universities and research organizations

### Sources (Journals)
- **search_sources**: Search for journals, conferences, and repositories

## Installation

### Using npx (recommended)

```bash
npx mcp-openalex
```

### Global Installation

```bash
npm install -g mcp-openalex
```

### Local Development

```bash
git clone https://github.com/Mearman/mcp-openalex.git
cd mcp-openalex
yarn install
yarn build
```

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openalex": {
      "command": "npx",
      "args": ["mcp-openalex"],
      "env": {}
    }
  }
}
```

For local development:

```json
{
  "mcpServers": {
    "openalex": {
      "command": "node",
      "args": ["/path/to/mcp-openalex/dist/index.js"],
      "env": {}
    }
  }
}
```

## Usage Examples

### Search for Works

```
search_works
- search: "machine learning"
- filter: "publication_year:2023"
- sort: "cited_by_count:desc"
- per_page: 10
```

### Get Work Details

```
get_work
- id: "W2741809807"
```

### Search for Authors

```
search_authors
- search: "Geoffrey Hinton"
- filter: "works_count:>100"
```

### Get Author Profile

```
get_author
- id: "A2698986125"
```

### Search Institutions

```
search_institutions
- search: "MIT"
- filter: "country_code:US"
```

### Search Sources

```
search_sources
- search: "Nature"
- filter: "is_oa:true"
```

## Tool Parameters

### Common Parameters
- `mailto`: (optional) Email address for polite pool access and higher rate limits
- `page`: Page number for pagination (default: 1)
- `per_page`: Results per page, max 200 (default: 25)

### Search Parameters
- `search`: Free-text search query
- `filter`: OpenAlex filter expressions (e.g., "publication_year:2023")
- `sort`: Sort field and direction (e.g., "cited_by_count:desc")

## Rate Limits

- Standard: 100,000 requests per day, 10 requests per second
- Polite pool (with email): Higher limits available
- Returns HTTP 429 when rate limited

## OpenAlex API

This MCP server interfaces with the [OpenAlex API](https://docs.openalex.org/), a free and open database of scholarly metadata. No authentication is required, but providing an email address enables "polite pool" access with better rate limits.

## Development

```bash
# Install dependencies
yarn install

# Run in development mode
yarn dev

# Build for production
yarn build

# Run tests
yarn test

# Lint and format
yarn lint
yarn format
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Mearman

## Acknowledgments

Built using the [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) and powered by [OpenAlex](https://openalex.org/).