import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { run } from "@openai/agents";
import { createCodingAgent } from "../agent/codingAgent.js";
import { createConversationSession } from "../conversation/sessionFactory.js";

const maxTurnsPerRun = 30;

export async function runCli(args: string[]): Promise<void> {
  assertApiKey();

  const workspaceRoot = process.cwd();
  const agent = createCodingAgent(workspaceRoot);
  const session = createConversationSession(workspaceRoot);
  const prompt = args.join(" ").trim();

  if (prompt) {
    const succeeded = await runSingleTurn(agent, session, prompt);
    if (!succeeded) {
      process.exitCode = 1;
    }
    return;
  }

  await runRepl(agent, session);
}

async function runRepl(
  agent: ReturnType<typeof createCodingAgent>,
  session: ReturnType<typeof createConversationSession>,
): Promise<void> {
  const repl = createInterface({ input, output });

  console.log("Mini Coding Agent. Commands: /clear, /exit");

  try {
    while (true) {
      const prompt = (await repl.question("> ")).trim();
      if (!prompt) {
        continue;
      }

      if (prompt === "/exit" || prompt === "/quit") {
        return;
      }

      if (prompt === "/clear") {
        await session.clearSession();
        console.log("Conversation cleared.");
        continue;
      }

      await runSingleTurn(agent, session, prompt);
    }
  } finally {
    repl.close();
  }
}

async function runSingleTurn(
  agent: ReturnType<typeof createCodingAgent>,
  session: ReturnType<typeof createConversationSession>,
  prompt: string,
): Promise<boolean> {
  try {
    const result = await run(agent, prompt, {
      session,
      maxTurns: maxTurnsPerRun,
    });
    console.log(formatOutput(result.finalOutput));
    return true;
  } catch (error) {
    console.error(`Agent run failed: ${formatError(error)}`);
    return false;
  }
}

function formatOutput(outputValue: unknown): string {
  if (typeof outputValue === "string") {
    return outputValue;
  }

  return JSON.stringify(outputValue, null, 2);
}

function assertApiKey(): void {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it to .env or export it before running the app.",
    );
  }
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
