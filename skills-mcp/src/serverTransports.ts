import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express, { type Express } from "express";
import type { Server } from "node:http";
import { createMcpServer } from "./mcpServer.js";

export interface HttpServerOptions {
  host: string;
  port: number;
  path: string;
}

export async function runStdioServer(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

export async function runHttpServer(options: HttpServerOptions): Promise<void> {
  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Expose-Headers", "*");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  app.post(options.path, async (req, res) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });

    res.on("close", () => {
      void transport.close();
      void server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Fehler beim Verarbeiten der MCP HTTP-Anfrage:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error"
          },
          id: null
        });
      }
    }
  });

  app.get(options.path, (_req, res) => {
    res.status(405).set("Allow", "POST").json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed."
      },
      id: null
    });
  });

  app.delete(options.path, (_req, res) => {
    res.status(405).set("Allow", "POST").json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed."
      },
      id: null
    });
  });

  const httpServer = await listen(app, options);
  const address = options.host === "0.0.0.0" ? "localhost" : options.host;
  console.error(`lunch-plan-mcp-server HTTP Streamable Server: http://${address}:${options.port}${options.path}`);

  await waitForShutdown(httpServer);
}

function listen(app: Express, options: HttpServerOptions): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = app.listen(options.port, options.host);
    server.once("error", reject);
    server.once("listening", () => resolve(server));
  });
}

function waitForShutdown(server: Server): Promise<void> {
  return new Promise((resolve) => {
    const shutdown = (): void => {
      server.close(() => resolve());
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  });
}
