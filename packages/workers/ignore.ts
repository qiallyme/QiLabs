/**
 * QiOS Ignore Patterns (Absolute Rules)
 * These files/folders:
 * - May be viewed (for context)
 * - May NOT be routed
 * - May NOT get semantic profiles
 * - May NOT be renamed, moved, or touched
 * - Are Dark Matter → read-only, no write ops
 */

export const IGNORE_PATTERNS = [
  ".obsidian/**",
  ".obsidian",
  ".obsidian-cache/**",
  ".obsidian/plugins/**",
  ".DS_Store",
  "**/.DS_Store",
  "Thumbs.db",
  "**/Thumbs.db",
  "node_modules/**",
  ".git/**",
  ".cache/**",
  "dist/**",
  "build/**",
  "**/*.tmp",
  "**/*.lock",
];

/**
 * Check if a file path matches any ignore pattern
 * Uses simple glob matching (supports ** for recursive)
 */
export function isIgnored(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, "/"); // Normalize Windows paths

  for (const pattern of IGNORE_PATTERNS) {
    if (matchesPattern(normalized, pattern)) {
      return true;
    }
  }

  return false;
}

function matchesPattern(path: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*\*/g, "§§§") // Temporary placeholder for **
    .replace(/\*/g, "[^/]*") // * matches anything except /
    .replace(/§§§/g, ".*"); // ** matches anything including /

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(path) || path.includes(pattern.replace(/\*\*/g, ""));
}

