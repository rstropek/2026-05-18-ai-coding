import { Agent, type FunctionTool, type Tool } from "@openai/agents";
import { createFileTools } from "../tools/fileTools.js";
import { createTerminalTools } from "../tools/terminalTool.js";
import { codingAgentInstructions } from "./systemPrompt.js";

const ansiGray = "\u001B[90m";
const ansiReset = "\u001B[0m";

export function createCodingAgent(workspaceRoot: string): Agent {
  return new Agent({
    name: "Mini Coding Agent",
    model: "gpt-5.4",
    instructions: codingAgentInstructions,
    modelSettings: {
      parallelToolCalls: false,
    },
    tools: withToolCallLogging([
      ...createFileTools(workspaceRoot),
      ...createTerminalTools(workspaceRoot),
    ]),
  });
}

function withToolCallLogging(tools: Tool[]): Tool[] {
  return tools.map((existingTool) => {
    if (existingTool.type !== "function") {
      return existingTool;
    }

    const typedTool = existingTool as FunctionTool;
    const originalInvoke = typedTool.invoke.bind(typedTool);

    return {
      ...typedTool,
      invoke: async (runContext, input, details) => {
        console.log(`${ansiGray}[tool] ${typedTool.name} ${input}${ansiReset}`);
        return await originalInvoke(runContext, input, details);
      },
    };
  });
}
