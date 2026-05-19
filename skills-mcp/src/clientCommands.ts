import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export async function runStdioClient(toolName: string, rawArguments: string | undefined): Promise<void> {
  const scriptPath = resolve(dirname(fileURLToPath(import.meta.url)), "index.js");
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [scriptPath, "stdio"],
    stderr: "inherit"
  });

  await callTool(transport, "lunch-plan-cli-stdio-client", toolName, rawArguments);
}

export async function runHttpClient(
  endpoint: string,
  toolName: string,
  rawArguments: string | undefined
): Promise<void> {
  const transport = new StreamableHTTPClientTransport(new URL(endpoint));
  await callTool(transport, "lunch-plan-cli-http-client", toolName, rawArguments);
}

function parseToolArguments(rawArguments: string | undefined): Record<string, unknown> {
  if (!rawArguments) {
    return { responseFormat: "json" };
  }

  const parsed: unknown = JSON.parse(rawArguments);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Tool-Argumente muessen ein JSON-Objekt sein, z. B. '{\"responseFormat\":\"json\"}'.");
  }

  return parsed as Record<string, unknown>;
}

async function callTool(
  transport: StdioClientTransport | StreamableHTTPClientTransport,
  clientName: string,
  toolName: string,
  rawArguments: string | undefined
): Promise<void> {
  const toolArguments = parseToolArguments(rawArguments);
  const client = new Client({
    name: clientName,
    version: "1.0.0"
  });

  try {
    await client.connect(transport);
    const tools = await client.listTools();
    if (!tools.tools.some((tool) => tool.name === toolName)) {
      throw new Error(
        `Tool '${toolName}' ist nicht verfuegbar. Verfuegbare Tools: ${tools.tools.map((tool) => tool.name).join(", ")}`
      );
    }

    const result = await client.callTool({
      name: toolName,
      arguments: toolArguments
    });

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await client.close();
  }
}
