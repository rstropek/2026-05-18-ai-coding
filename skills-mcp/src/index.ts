#!/usr/bin/env node
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Command } from "commander";
import { fileURLToPath } from "node:url";
import * as z from "zod/v4";
import {
  formatAllergenInfo,
  formatTodaysMenu,
  formatWeeklyOverview,
  getAllergenInfo,
  getTodaysMenu,
  getWeeklyOverview,
  loadLunchPlan
} from "./menuService.js";
import {
  AllergenOutputSchema,
  DayMenuOutputSchema,
  DishOutputSchema,
  ResponseFormatSchema
} from "./types.js";

const ToolOptionsSchema = z.object({
  responseFormat: ResponseFormatSchema.default("markdown").describe(
    "Ausgabeformat: 'markdown' fuer Menschen oder 'json' fuer strukturierte Verarbeitung."
  )
});

const TodaysMenuOutputSchema = z.object({
  date: z.string(),
  weekday: z.string().nullable(),
  canteen: z.object({
    name: z.string(),
    currency: z.string()
  }),
  timezone: z.string(),
  menu: z.array(DishOutputSchema)
});

const WeeklyOverviewOutputSchema = z.object({
  week: z.object({
    startDate: z.string(),
    endDate: z.string(),
    calendarWeek: z.number(),
    timezone: z.string()
  }),
  canteen: z.object({
    name: z.string(),
    currency: z.string()
  }),
  days: z.array(
    z.object({
      date: z.string(),
      weekday: z.string(),
      itemCount: z.number(),
      dishes: z.array(
        DishOutputSchema.pick({
          id: true,
          name: true,
          category: true,
          price: true,
          vegetarian: true,
          vegan: true
        })
      )
    })
  )
});

const AllergenInfoInputSchema = ToolOptionsSchema.extend({
  dishId: z.string().min(1).describe("Speise-ID, z. B. '2026-05-19-main-1'.")
});

const AllergenInfoOutputSchema = z.object({
  dish: DayMenuOutputSchema.shape.menu.element.pick({
    id: true,
    name: true,
    category: true
  }),
  allergens: z.array(AllergenOutputSchema)
});

function createServer(): McpServer {
  const server = new McpServer({
    name: "lunch-plan-mcp-server",
    version: "1.0.0"
  });

  server.registerTool(
    "getTodaysMenu",
    {
      title: "Get Today's Menu",
      description:
        "Gibt den Speiseplan fuer den heutigen Tag aus lunch-plan.json zurueck. Jede Speise enthaelt eine stabile ID fuer Folgeabfragen.",
      inputSchema: ToolOptionsSchema,
      outputSchema: TodaysMenuOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ responseFormat }) => {
      const plan = await loadLunchPlan();
      const output = getTodaysMenu(plan);

      return {
        content: [{ type: "text", text: formatTodaysMenu(output, responseFormat) }],
        structuredContent: output
      };
    }
  );

  server.registerTool(
    "getWeeklyOverview",
    {
      title: "Get Weekly Overview",
      description:
        "Gibt eine kompakte Uebersicht ueber alle Speiseplaene der in lunch-plan.json hinterlegten aktuellen Woche zurueck.",
      inputSchema: ToolOptionsSchema,
      outputSchema: WeeklyOverviewOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ responseFormat }) => {
      const plan = await loadLunchPlan();
      const output = getWeeklyOverview(plan);

      return {
        content: [{ type: "text", text: formatWeeklyOverview(output, responseFormat) }],
        structuredContent: output
      };
    }
  );

  server.registerTool(
    "getAllergenInfo",
    {
      title: "Get Allergen Info",
      description:
        "Gibt Allergen-Informationen fuer eine Speise-ID zurueck. Nutze getTodaysMenu oder getWeeklyOverview, um gueltige IDs zu finden.",
      inputSchema: AllergenInfoInputSchema,
      outputSchema: AllergenInfoOutputSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async ({ dishId, responseFormat }) => {
      try {
        const plan = await loadLunchPlan();
        const output = getAllergenInfo(plan, dishId);

        return {
          content: [{ type: "text", text: formatAllergenInfo(output, responseFormat) }],
          structuredContent: output
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "Allergen-Informationen konnten nicht geladen werden."
            }
          ]
        };
      }
    }
  );

  return server;
}

async function runStdioServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function runStdioClient(toolName: string, rawArguments: string | undefined): Promise<void> {
  const toolArguments = parseToolArguments(rawArguments);
  const scriptPath = fileURLToPath(import.meta.url);
  const client = new Client({
    name: "lunch-plan-cli-stdio-client",
    version: "1.0.0"
  });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [scriptPath, "stdio"],
    stderr: "inherit"
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
    .command("stdio-client")
    .description("Ruft den STDIO MCP Server mit dem MCP Client SDK auf.")
    .argument("[toolName]", "Name des MCP Tools.", "getTodaysMenu")
    .argument("[jsonArguments]", "Tool-Argumente als JSON-Objekt.", "{\"responseFormat\":\"json\"}")
    .action(async (toolName: string, jsonArguments: string) => {
      await runStdioClient(toolName, jsonArguments);
    });

  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`lunch-plan-mcp-server Fehler: ${message}`);
  process.exitCode = 1;
});
