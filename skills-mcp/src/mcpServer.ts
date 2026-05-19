import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerLunchPlanTools } from "./lunchPlanTools.js";

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "lunch-plan-mcp-server",
    version: "1.0.0"
  });

  registerLunchPlanTools(server);
  return server;
}
