import { defineConfig, type DefaultTheme } from "vitepress";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const docsRoot = fileURLToPath(new URL("../../docs", import.meta.url));
const hiddenDirPrefixes = [".", "_"];
const rootVisibleFiles = ["blueprint_master_map-mindmap.md"];

type SidebarItem = DefaultTheme.SidebarItem;

export default defineConfig({
  title: "QiAccess Docs",
  description: "QiAccess Start operating documentation",
  base: "/docs/",
  srcDir: "../../docs",
  outDir: "../../.vitepress-dist",
  cleanUrls: true,
  ignoreDeadLinks: true,
  themeConfig: {
    nav: buildNav(),
    sidebar: buildSidebar(),
    search: {
      provider: "local",
    },
  },
});

function buildNav(): DefaultTheme.NavItem[] {
  const nav: DefaultTheme.NavItem[] = [{ text: "Docs Home", link: "/" }];

  for (const dirName of listVisibleDirectories(docsRoot)) {
    const dirPath = join(docsRoot, dirName);
    if (!hasDirectoryContent(dirPath)) {
      continue;
    }

    const link = getDirectoryLink(dirPath);
    if (!link) {
      continue;
    }

    nav.push({
      text: getDirectoryLabel(dirPath),
      link,
    });
  }

  return nav;
}

function buildSidebar(): SidebarItem[] {
  const items: SidebarItem[] = [];

  for (const dirName of listVisibleDirectories(docsRoot)) {
    const section = buildDirectorySection(join(docsRoot, dirName));
    if (section) {
      items.push(section);
    }
  }

  const rootDocs = rootVisibleFiles
    .map((fileName) => join(docsRoot, fileName))
    .filter((filePath) => existsSync(filePath))
    .map((filePath) => buildFileItem(filePath));

  if (rootDocs.length > 0) {
    items.push({
      text: "Root Docs",
      items: rootDocs,
    });
  }

  return items;
}

function buildDirectorySection(dirPath: string): SidebarItem | null {
  const childItems: SidebarItem[] = [];

  for (const childDirName of listVisibleDirectories(dirPath)) {
    const childSection = buildDirectorySection(join(dirPath, childDirName));
    if (childSection) {
      childItems.push(childSection);
    }
  }

  for (const fileName of listVisibleMarkdownFiles(dirPath)) {
    if (isIndexFile(fileName) || fileName.startsWith("_")) {
      continue;
    }

    childItems.push(buildFileItem(join(dirPath, fileName)));
  }

  const link = getDirectoryLink(dirPath);
  if (!link && childItems.length === 0) {
    return null;
  }

  const item: SidebarItem = {
    text: getDirectoryLabel(dirPath),
  };

  if (link) {
    item.link = link;
  }

  if (childItems.length > 0) {
    item.items = childItems;
  }

  return item;
}

function buildFileItem(filePath: string): SidebarItem {
  return {
    text: getFileLabel(filePath),
    link: getFileLink(filePath),
  };
}

function listVisibleDirectories(dirPath: string): string[] {
  return readdirSync(dirPath)
    .filter((name) => {
      if (hiddenDirPrefixes.some((prefix) => name.startsWith(prefix))) {
        return false;
      }

      return statSync(join(dirPath, name)).isDirectory();
    })
    .sort(compareNamedEntries);
}

function listVisibleMarkdownFiles(dirPath: string): string[] {
  return readdirSync(dirPath)
    .filter((name) => {
      if (!name.toLowerCase().endsWith(".md")) {
        return false;
      }

      return statSync(join(dirPath, name)).isFile();
    })
    .sort(compareNamedEntries);
}

function hasDirectoryContent(dirPath: string): boolean {
  if (getDirectoryLink(dirPath)) {
    return true;
  }

  if (listVisibleMarkdownFiles(dirPath).some((name) => !name.startsWith("_"))) {
    return true;
  }

  return listVisibleDirectories(dirPath).some((childName) =>
    hasDirectoryContent(join(dirPath, childName)),
  );
}

function getDirectoryLink(dirPath: string): string | null {
  const indexPath = join(dirPath, "_index.md");
  if (existsSync(indexPath)) {
    return getFileLink(indexPath);
  }

  const readmePath = join(dirPath, "README.md");
  if (existsSync(readmePath)) {
    return getFileLink(readmePath);
  }

  return null;
}

function getDirectoryLabel(dirPath: string): string {
  const dirName = basename(dirPath);
  const indexPath = join(dirPath, "_index.md");
  const readmePath = join(dirPath, "README.md");
  const fallback = formatSegment(dirName);

  if (existsSync(indexPath)) {
    return extractHeadingLabel(indexPath, fallback, true);
  }

  if (existsSync(readmePath)) {
    return extractHeadingLabel(readmePath, fallback, true);
  }

  return fallback;
}

function getFileLabel(filePath: string): string {
  const fileName = basename(filePath);
  const fallback = formatSegment(fileName.replace(/\.md$/i, ""));
  return extractHeadingLabel(filePath, fallback, false);
}

function extractHeadingLabel(filePath: string, fallback: string, compact: boolean): string {
  const content = readFileSync(filePath, "utf8");
  const headingLine = content
    .split(/\r?\n/)
    .find((line) => line.trim().startsWith("#"));

  if (!headingLine) {
    return fallback;
  }

  const rawHeading = headingLine.replace(/^#+\s+/, "").trim();
  if (!compact) {
    return rawHeading;
  }

  return rawHeading.split(":")[0].replace(/^#+\s*/, "").trim() || fallback;
}

function getFileLink(filePath: string): string {
  const relPath = relative(docsRoot, filePath).replace(/\\/g, "/");

  if (relPath === "_index.md") {
    return "/";
  }

  return `/${relPath.replace(/\.md$/i, "")}`;
}

function isIndexFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower === "_index.md" || lower === "readme.md";
}

function compareNamedEntries(left: string, right: string): number {
  const leftParts = splitSortableName(left);
  const rightParts = splitSortableName(right);

  if (leftParts.order !== rightParts.order) {
    return leftParts.order - rightParts.order;
  }

  return leftParts.label.localeCompare(rightParts.label);
}

function splitSortableName(name: string): { order: number; label: string } {
  const base = name.replace(/\.md$/i, "");
  const match = /^(\d+)[_-]?(.*)$/.exec(base);
  if (!match) {
    return { order: Number.MAX_SAFE_INTEGER, label: base.toLowerCase() };
  }

  return {
    order: Number.parseInt(match[1], 10),
    label: match[2].toLowerCase(),
  };
}

function formatSegment(segment: string): string {
  return segment
    .replace(/\.md$/i, "")
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => {
      if (/^\d+$/.test(part)) {
        return part;
      }

      if (part.length <= 3) {
        return part.toUpperCase();
      }

      return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    })
    .join(" ");
}
