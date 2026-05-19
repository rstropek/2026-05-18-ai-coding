import { promises as fs } from "node:fs";
import { dirname, relative } from "node:path";
import { type Tool, tool } from "@openai/agents";
import { z } from "zod";
import { resolveWorkspacePath } from "./pathSecurity.js";

const textFilePathSchema = z.object({
  path: z
    .string()
    .min(1)
    .describe("Relative path to a file inside the current workspace."),
});

const writeFileSchema = textFilePathSchema.extend({
  content: z.string().describe("Complete file content to write."),
});

export function createFileTools(workspaceRoot: string): Tool[] {
  return [
    tool({
      name: "read_file",
      description:
        "Read a UTF-8 text file by relative path. Parent directory access is blocked.",
      parameters: textFilePathSchema,
      execute: async ({ path }) => {
        const target = resolveWorkspacePath(workspaceRoot, path);
        const stat = await fs.stat(target);
        if (!stat.isFile()) {
          throw new Error(`${path} is not a file.`);
        }

        return await fs.readFile(target, "utf8");
      },
    }),
    tool({
      name: "write_file",
      description:
        "Write a complete UTF-8 text file by relative path. This replaces the full file. Parent directory access is blocked.",
      parameters: writeFileSchema,
      execute: async ({ path, content }) => {
        const target = resolveWorkspacePath(workspaceRoot, path);
        await fs.mkdir(dirname(target), { recursive: true });
        await fs.writeFile(target, content, "utf8");
        return `Wrote ${path}.`;
      },
    }),
    tool({
      name: "list_files",
      description:
        "List files recursively in the current workspace. node_modules, .git, dist, and conversation are omitted.",
      parameters: z.object({}),
      execute: async () => {
        const files = await listFiles(workspaceRoot);
        return files.join("\n");
      },
    }),
  ];
}

async function listFiles(root: string): Promise<string[]> {
  const ignoredDirectories = new Set([
    ".git",
    "node_modules",
    "dist",
    "conversation",
  ]);
  const result: string[] = [];

  async function visit(directory: string): Promise<void> {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
        continue;
      }

      const absolutePath = `${directory}/${entry.name}`;
      if (entry.isDirectory()) {
        await visit(absolutePath);
        continue;
      }

      if (entry.isFile()) {
        result.push(relative(root, absolutePath));
      }
    }
  }

  await visit(root);
  return result;
}
