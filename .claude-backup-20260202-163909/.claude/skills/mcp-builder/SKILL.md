# MCP Builder Skill

Guide for building Model Context Protocol (MCP) servers for Claude Code.

## What is MCP?

MCP (Model Context Protocol) allows Claude to interact with external tools and services. You can build custom MCPs to:

- Connect to databases
- Integrate with APIs
- Access local files/systems
- Provide custom tools

## Basic MCP Server Structure

```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'my-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'my_tool',
        description: 'Description of what this tool does',
        inputSchema: {
          type: 'object',
          properties: {
            param1: {
              type: 'string',
              description: 'First parameter',
            },
            param2: {
              type: 'number',
              description: 'Second parameter',
            },
          },
          required: ['param1'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'my_tool') {
    const result = await myToolImplementation(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

## Package.json

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "my-mcp-server": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

## TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

## Example: Database MCP

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Tool definition
{
  name: 'query_database',
  description: 'Execute a read-only SQL query',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'SQL SELECT query to execute',
      },
    },
    required: ['query'],
  },
}

// Implementation
async function queryDatabase(args: { query: string }) {
  // Security: Only allow SELECT queries
  if (!args.query.trim().toLowerCase().startsWith('select')) {
    throw new Error('Only SELECT queries are allowed');
  }

  const result = await pool.query(args.query);
  return {
    rows: result.rows,
    rowCount: result.rowCount,
  };
}
```

## Example: API Integration MCP

```typescript
// Tool definition
{
  name: 'fetch_weather',
  description: 'Get current weather for a city',
  inputSchema: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'City name',
      },
    },
    required: ['city'],
  },
}

// Implementation
async function fetchWeather(args: { city: string }) {
  const response = await fetch(
    `https://api.weather.com/v1/current?city=${encodeURIComponent(args.city)}&key=${process.env.WEATHER_API_KEY}`
  );

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  return response.json();
}
```

## Configure in Claude Code

Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgres://...",
        "API_KEY": "..."
      }
    }
  }
}
```

Or with npx:

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "my-mcp-server"]
    }
  }
}
```

## Best Practices

| Practice | Description |
|----------|-------------|
| **Validate inputs** | Always validate and sanitize user inputs |
| **Handle errors** | Return clear error messages |
| **Limit scope** | Only expose necessary functionality |
| **Document tools** | Write clear descriptions for each tool |
| **Security first** | Never expose sensitive operations |
| **Timeout handling** | Set timeouts for external calls |

## Testing

```typescript
// test/index.test.ts
import { describe, it, expect } from 'vitest';

describe('MCP Server', () => {
  it('should list tools', async () => {
    const tools = await server.listTools();
    expect(tools).toContainEqual(
      expect.objectContaining({ name: 'my_tool' })
    );
  });

  it('should execute tool', async () => {
    const result = await server.callTool('my_tool', { param1: 'test' });
    expect(result.content[0].text).toBeDefined();
  });
});
```

## Official MCPs

| MCP | Purpose |
|-----|---------|
| `@anthropic-ai/claude-mcp-memory` | Persistent memory |
| `@anthropic-ai/mcp-server-playwright` | Browser automation |
| `@modelcontextprotocol/server-github` | GitHub integration |
| `@modelcontextprotocol/server-filesystem` | File system access |
