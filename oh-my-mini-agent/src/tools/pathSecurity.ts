import { isAbsolute, normalize, relative, resolve, sep } from "node:path";

export function resolveWorkspacePath(
  workspaceRoot: string,
  userPath: string,
): string {
  if (!userPath.trim()) {
    throw new Error("Path must not be empty.");
  }

  if (isAbsolute(userPath)) {
    throw new Error("Use a relative path, not an absolute path.");
  }

  const normalizedUserPath = normalize(userPath);
  if (
    normalizedUserPath === ".." ||
    normalizedUserPath.startsWith(`..${sep}`) ||
    normalizedUserPath.split(/[\\/]/).includes("..")
  ) {
    throw new Error("Parent directory access is not allowed.");
  }

  const root = resolve(workspaceRoot);
  const target = resolve(root, normalizedUserPath);
  const targetRelativeToRoot = relative(root, target);

  if (
    targetRelativeToRoot === ".." ||
    targetRelativeToRoot.startsWith(`..${sep}`) ||
    isAbsolute(targetRelativeToRoot)
  ) {
    throw new Error("Path escapes the workspace root.");
  }

  return target;
}
