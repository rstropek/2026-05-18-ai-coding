import { spawn } from "node:child_process";
import { type Tool, tool } from "@openai/agents";
import { z } from "zod";

const defaultTimeoutMs = 30_000;
const maxOutputBytes = 200_000;

const runInTerminalSchema = z.object({
  command: z
    .string()
    .min(1)
    .describe("Shell command to run inside the current workspace."),
  timeoutSeconds: z
    .number()
    .int()
    .min(1)
    .max(300)
    .optional()
    .describe("Optional timeout in seconds. Defaults to 30 seconds."),
});

export function createTerminalTools(workspaceRoot: string): Tool[] {
  return [
    tool({
      name: "runInTerminal",
      description:
        "Run a shell command in the current workspace and return stdout/stderr. Use this for builds, tests, and other local development commands.",
      parameters: runInTerminalSchema,
      execute: async ({ command, timeoutSeconds }) => {
        try {
          const result = await runCommand({
            command,
            cwd: workspaceRoot,
            timeoutMs: (timeoutSeconds ?? defaultTimeoutMs / 1000) * 1000,
          });

          return formatCommandResult({ command, ...result });
        } catch (error) {
          return formatCommandResult({
            command,
            stdout: "",
            stderr: `runInTerminal failed before command completion: ${formatUnknownError(error)}`,
            exitCode: undefined,
            timedOut: false,
            truncated: false,
          });
        }
      },
    }),
  ];
}

function formatCommandResult({
  command,
  stdout,
  stderr,
  exitCode,
  timedOut,
  truncated,
}: {
  command: string;
  stdout: string;
  stderr: string;
  exitCode?: number;
  timedOut: boolean;
  truncated: boolean;
}): string {
  return [
    `$ ${command}`,
    `exitCode: ${exitCode ?? "unknown"}`,
    `timedOut: ${timedOut ? "yes" : "no"}`,
    `truncated: ${truncated ? "yes" : "no"}`,
    "stdout:",
    stdout || "<empty>",
    "stderr:",
    stderr || "<empty>",
  ].join("\n");
}

type CommandResult = {
  stdout: string;
  stderr: string;
  exitCode?: number;
  timedOut: boolean;
  truncated: boolean;
};

async function runCommand({
  command,
  cwd,
  timeoutMs,
}: {
  command: string;
  cwd: string;
  timeoutMs: number;
}): Promise<CommandResult> {
  const shell = process.platform === "win32" ? "cmd.exe" : "/bin/sh";
  const args =
    process.platform === "win32"
      ? ["/d", "/s", "/c", command]
      : ["-c", command];

  return await new Promise<CommandResult>((resolve) => {
    let stdout = "";
    let stderr = "";
    let outputBytes = 0;
    let truncated = false;
    let timedOut = false;
    let settled = false;

    const child = spawn(shell, args, {
      cwd,
      env: process.env,
      windowsHide: true,
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
      setTimeout(() => {
        if (!settled) {
          child.kill("SIGKILL");
        }
      }, 1_000).unref();
    }, timeoutMs);

    timeout.unref();

    child.stdout.on("data", (chunk: Buffer) => {
      stdout = appendOutput(stdout, chunk, {
        outputBytes,
        onBytes: (bytes) => {
          outputBytes = bytes;
        },
        onTruncated: () => {
          truncated = true;
        },
      });
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr = appendOutput(stderr, chunk, {
        outputBytes,
        onBytes: (bytes) => {
          outputBytes = bytes;
        },
        onTruncated: () => {
          truncated = true;
        },
      });
    });

    child.on("error", (error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolve({
        stdout,
        stderr: stderr || formatUnknownError(error),
        exitCode: undefined,
        timedOut,
        truncated,
      });
    });

    child.on("close", (code, signal) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      resolve({
        stdout,
        stderr:
          signal && !stderr
            ? `Command terminated by signal ${signal}.`
            : stderr,
        exitCode: code ?? undefined,
        timedOut,
        truncated,
      });
    });
  });
}

function appendOutput(
  current: string,
  chunk: Buffer,
  callbacks: {
    outputBytes: number;
    onBytes: (bytes: number) => void;
    onTruncated: () => void;
  },
): string {
  if (callbacks.outputBytes >= maxOutputBytes) {
    callbacks.onTruncated();
    return current;
  }

  const remainingBytes = maxOutputBytes - callbacks.outputBytes;
  const visibleChunk = chunk.subarray(0, remainingBytes);
  callbacks.onBytes(callbacks.outputBytes + chunk.byteLength);

  if (chunk.byteLength > remainingBytes) {
    callbacks.onTruncated();
  }

  return current + visibleChunk.toString("utf8");
}

function formatUnknownError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
