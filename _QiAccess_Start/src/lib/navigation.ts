export type NavIcon =
  | "home"
  | "capture"
  | "knowledge"
  | "memory"
  | "insights"
  | "system"
  | "family"
  | "legal"
  | "finance"
  | "server";

export type NavTreeItem = {
  id: string;
  label: string;
  to: string;
  icon: NavIcon;
  detail: string;
  children?: NavTreeItem[];
};

const serverRoutes = [
  { resourceId: "cockpit", label: "Cockpit", to: "/server/cockpit" },
  { resourceId: "portainer", label: "Portainer", to: "/server/portainer" },
  { resourceId: "open-webui", label: "Open WebUI", to: "/server/open-webui" },
  { resourceId: "paperless", label: "Paperless", to: "/server/paperless" },
  { resourceId: "nocodb", label: "NocoDB", to: "/server/nocodb" },
  { resourceId: "wiki-js", label: "Wiki.js", to: "/server/wiki-js" },
] as const;

const systemChildren: NavTreeItem[] = [
  { id: "system-access", label: "Access", to: "/system/access", icon: "system", detail: "Public edge, protection, and entry points." },
  { id: "system-server", label: "Server", to: "/system/server", icon: "server", detail: "Private services and host-level control." },
  { id: "system-storage", label: "Storage", to: "/system/storage", icon: "finance", detail: "Drive, QiNexus, and intake targets." },
  {
    id: "system-integrations",
    label: "Integrations",
    to: "/system/integrations",
    icon: "knowledge",
    detail: "Connected platforms and runtime-adjacent tools.",
  },
  { id: "system-settings", label: "Settings", to: "/system/settings", icon: "system", detail: "Local registry controls and surface policy." },
  {
    id: "system-diagnostics",
    label: "Diagnostics",
    to: "/system/diagnostics",
    icon: "insights",
    detail: "Relationship map and current registry truth.",
  },
  { id: "system-blueprint", label: "Blueprint", to: "/system/blueprint", icon: "knowledge", detail: "Seven-root doctrine and active portal structure." },
  { id: "system-roadmap", label: "Roadmap", to: "/system/roadmap", icon: "insights", detail: "Portal phases and rollout sequencing." },
  { id: "system-security", label: "Security", to: "/system/security", icon: "system", detail: "Boundary rules for public and private surfaces." },
] as const;

export const navTree: NavTreeItem[] = [
  {
    id: "home",
    label: "Home",
    to: "/",
    icon: "home",
    detail: "Unified launcher for the active portal.",
  },
  {
    id: "capture",
    label: "Capture",
    to: "/capture",
    icon: "capture",
    detail: "Fast local-first intake without fake ingestion claims.",
  },
  {
    id: "knowledge",
    label: "Knowledge",
    to: "/knowledge",
    icon: "knowledge",
    detail: "Wiki.js handoff with honest route status.",
  },
  {
    id: "system",
    label: "System",
    to: "/system",
    icon: "system",
    detail: "Private infrastructure, local controls, and operator truth.",
  },
];

const hiddenRouteMeta: NavTreeItem[] = [
  ...systemChildren,
  {
    id: "memory",
    label: "Memory",
    to: "/memory",
    icon: "memory",
    detail: "Status and purpose only for memory work.",
  },
  {
    id: "insights",
    label: "Insights",
    to: "/insights",
    icon: "insights",
    detail: "Status and purpose only for insight work.",
  },
];

const resourceRoutes: Record<string, string> = {
  qiaccess: "/",
  qiserver: "/server",
  cockpit: "/server/cockpit",
  portainer: "/server/portainer",
  "open-webui": "/server/open-webui",
  paperless: "/server/paperless",
  nocodb: "/server/nocodb",
  "wiki-js": "/server/wiki-js",
  gethomepage: "/server",
  familyos: "/",
  qinote: "/knowledge",
  cloudflare: "/system/access",
  github: "/system/integrations",
  "google-drive": "/system/storage",
  qinexus: "/system/storage",
};

function flattenNavItems(items: readonly NavTreeItem[]): NavTreeItem[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenNavItems(item.children) : [])]);
}

const flatNavItems = flattenNavItems(navTree);
const hiddenNavItems = flattenNavItems(hiddenRouteMeta);

export function getServerRoutes() {
  return serverRoutes;
}

export function getNavTree() {
  return navTree;
}

export function isPathActive(pathname: string, to: string) {
  if (to === "/") {
    return pathname === "/";
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}

export function getAutoExpandedIds(pathname: string) {
  return navTree
    .filter((item) => item.children?.some((child) => isPathActive(pathname, child.to)) || isPathActive(pathname, item.to))
    .map((item) => item.id);
}

export function resolvePageMeta(pathname: string) {
  const bestMatch = [...flatNavItems, ...hiddenNavItems]
    .filter((item: NavTreeItem) => isPathActive(pathname, item.to))
    .sort((left: NavTreeItem, right: NavTreeItem) => right.to.length - left.to.length)[0];

  if (bestMatch) {
    return {
      title: bestMatch.label,
      detail: bestMatch.detail,
    };
  }

  return {
    title: "QiAccess Start",
    detail: "Unified launcher for the active portal.",
  };
}

export function resolveResourceRoute(resourceId: string) {
  return resourceRoutes[resourceId] ?? `/?selected=${resourceId}`;
}
