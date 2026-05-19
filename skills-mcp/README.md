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

Use the `http` command to start the same MCP tools with the Streamable HTTP transport via Express:

```bash
lunch-plan-mcp-server http
```

Local development equivalent:

```bash
node dist/index.js http --host localhost --port 3000 --path /mcp
```

The HTTP command uses the MCP SDK's Express integration, including JSON parsing and automatic localhost DNS-rebinding protection. If you bind to all interfaces, restrict accepted Host headers with `--allowed-host`:

```bash
lunch-plan-mcp-server http --host 0.0.0.0 --allowed-host myapp.local localhost
```

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

Use `http-client` to call a running Streamable HTTP server:

```bash
lunch-plan-mcp-server http-client [endpoint] [toolName] [jsonArguments]
```

If omitted, `endpoint` defaults to `http://localhost:3000/mcp`, `toolName` defaults to `getTodaysMenu`, and `jsonArguments` defaults to `{"responseFormat":"json"}`.

Examples:

```bash
lunch-plan-mcp-server http
lunch-plan-mcp-server http-client
lunch-plan-mcp-server http-client http://localhost:3000/mcp getAllergenInfo '{"dishId":"2026-05-19-main-1","responseFormat":"json"}'
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
LUNCH_PLAN_PATH=/path/to/lunch-plan.json lunch-plan-mcp-server http
```

## Validation

```bash
npm test
```
