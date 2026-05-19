#!/usr/bin/env node
import { Command } from "commander";
import { runHttpClient, runStdioClient } from "./clientCommands.js";
import { runHttpServer, runStdioServer } from "./serverTransports.js";

const defaultHttpEndpoint = "http://localhost:3000/mcp";

async function main(): Promise<void> {
  const program = new Command();

  program
    .name("lunch-plan-mcp-server")
    .description("MCP server and test client for canteen lunch plans.")
    .version("1.0.0")
    .showHelpAfterError();

  program
    .command("stdio", { isDefault: true })
    .description("Startet den MCP Server mit STDIO.")
    .action(async () => {
      await runStdioServer();
    });

  program
    .command("http")
    .description("Startet den MCP Server als Streamable HTTP Server mit Express.")
    .option("-H, --host <host>", "Host/IP, auf der Express lauscht.", "localhost")
    .option("-p, --port <port>", "Port, auf dem Express lauscht.", parsePort, 3000)
    .option("--path <path>", "HTTP-Pfad fuer den MCP Endpunkt.", "/mcp")
    .action(async (options: { host: string; port: number; path: string }) => {
      await runHttpServer({
        host: options.host,
        port: options.port,
        path: normalizeHttpPath(options.path)
      });
    });

  program
    .command("stdio-client")
    .description("Ruft den STDIO MCP Server mit dem MCP Client SDK auf.")
    .argument("[toolName]", "Name des MCP Tools.", "getTodaysMenu")
    .argument("[jsonArguments]", "Tool-Argumente als JSON-Objekt.", "{\"responseFormat\":\"json\"}")
    .action(async (toolName: string, jsonArguments: string) => {
      await runStdioClient(toolName, jsonArguments);
    });

  program
    .command("http-client")
    .description("Ruft einen Streamable HTTP MCP Server mit dem MCP Client SDK auf.")
    .argument("[endpoint]", "HTTP MCP Endpoint.", defaultHttpEndpoint)
    .argument("[toolName]", "Name des MCP Tools.", "getTodaysMenu")
    .argument("[jsonArguments]", "Tool-Argumente als JSON-Objekt.", "{\"responseFormat\":\"json\"}")
    .action(async (endpoint: string, toolName: string, jsonArguments: string) => {
      await runHttpClient(endpoint, toolName, jsonArguments);
    });

  await program.parseAsync(process.argv);
}

function parsePort(value: string): number {
  const port = Number.parseInt(value, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Port muss eine ganze Zahl zwischen 1 und 65535 sein.");
  }

  return port;
}

function normalizeHttpPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`lunch-plan-mcp-server Fehler: ${message}`);
  process.exitCode = 1;
});
