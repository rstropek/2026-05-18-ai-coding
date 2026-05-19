# Lunch Plan MCP Server

Demo MCP server for canteen lunch plans from `lunch-plan.json`.

## Setup

```bash
npm install
npm run build
```

The package exposes the CLI command `lunch-plan-mcp-server` after build. During local development you can also run the compiled entry point directly:

```bash
node dist/index.js --help
```

## Start the MCP server

Use the `stdio` command to start the MCP server with the STDIO transport:

```bash
lunch-plan-mcp-server stdio
```

Local development equivalent:

```bash
node dist/index.js stdio
```

If no command is provided, `stdio` is the default command.

## Test with the built-in MCP client

Use `stdio-client` to start the STDIO server as a child process and call it with the MCP Client SDK:

```bash
lunch-plan-mcp-server stdio-client [toolName] [jsonArguments]
```

If omitted, `toolName` defaults to `getTodaysMenu` and `jsonArguments` defaults to `{"responseFormat":"json"}`.

Examples:

```bash
lunch-plan-mcp-server stdio-client
lunch-plan-mcp-server stdio-client getTodaysMenu '{"responseFormat":"json"}'
lunch-plan-mcp-server stdio-client getWeeklyOverview '{"responseFormat":"markdown"}'
lunch-plan-mcp-server stdio-client getAllergenInfo '{"dishId":"2026-05-19-main-1","responseFormat":"json"}'
```

Local development equivalent:

```bash
node dist/index.js stdio-client getTodaysMenu '{"responseFormat":"json"}'
```

## Available MCP tools

| Tool | Description |
| --- | --- |
| `getTodaysMenu` | Returns today's menu from `lunch-plan.json`. |
| `getWeeklyOverview` | Returns a compact overview of the stored week. |
| `getAllergenInfo` | Returns expanded allergen information for a dish ID. |

All tools accept `responseFormat` with either `markdown` or `json`. `getAllergenInfo` also requires `dishId`.

## Configuration

By default, the server reads `lunch-plan.json` from the package directory. Set `LUNCH_PLAN_PATH` to use a different file:

```bash
LUNCH_PLAN_PATH=/path/to/lunch-plan.json lunch-plan-mcp-server stdio
```

## Validation

```bash
npm test
```
