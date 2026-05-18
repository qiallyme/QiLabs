export type SystemModuleId =
  | "access"
  | "server"
  | "storage"
  | "integrations"
  | "settings"
  | "diagnostics"
  | "blueprint"
  | "roadmap"
  | "security";

export type SystemModule = {
  id: SystemModuleId;
  title: string;
  description: string;
  to: string;
  eyebrow: string;
};

export type SystemEntry = {
  title: string;
  description: string;
  resourceId?: string;
  href?: string;
  to?: string;
  privateOnly?: boolean;
  note?: string;
};

export const systemModules: SystemModule[] = [
  { id: "access", title: "Access", description: "Public edge, protection, and trusted entry points.", to: "/system/access", eyebrow: "Front Door" },
  { id: "server", title: "Server", description: "qiserver, machine-level admin, and private runtime controls.", to: "/system/server", eyebrow: "Private Infra" },
  { id: "storage", title: "Storage", description: "QiNexus, Drive, and document intake targets.", to: "/system/storage", eyebrow: "Backbone" },
  { id: "integrations", title: "Integrations", description: "Connected platforms and runtime-adjacent services.", to: "/system/integrations", eyebrow: "Connections" },
  { id: "settings", title: "Settings", description: "Local registry controls and frozen-surface policy.", to: "/system/settings", eyebrow: "Controls" },
  { id: "diagnostics", title: "Diagnostics", description: "Relationship graph and current registry truth.", to: "/system/diagnostics", eyebrow: "Visibility" },
  { id: "blueprint", title: "Blueprint", description: "Seven-root doctrine and current portal structure.", to: "/system/blueprint", eyebrow: "Doctrine" },
  { id: "roadmap", title: "Roadmap", description: "Current portal phases and rollout sequencing.", to: "/system/roadmap", eyebrow: "Phasing" },
  { id: "security", title: "Security", description: "Public versus private boundaries and launch safety.", to: "/system/security", eyebrow: "Boundaries" },
];

export const systemSectionContent: Record<SystemModuleId, { title: string; summary: string; entries: SystemEntry[] }> = {
  access: {
    title: "Access",
    summary: "The front door stays honest: public portal outside, protected routes and private tools inside.",
    entries: [
      {
        title: "QiAccess",
        description: "Public front door for the seven-root shell.",
        resourceId: "qiaccess",
        note: "Verified at the edge: access.qially.com is Cloudflare Access protected. The protected origin was not directly inspectable without auth.",
      },
      { title: "Cloudflare", description: "Edge routing, DNS, and Zero Trust envelope.", resourceId: "cloudflare" },
      { title: "qiserver", description: "Tailnet host behind the front door.", resourceId: "qiserver", privateOnly: true },
      {
        title: "Private Server Launcher",
        description: "Local gethomepage utility for private tailnet/server links.",
        resourceId: "gethomepage",
        privateOnly: true,
      },
      {
        title: "Wiki.js Public Route",
        description: "Public hostname exists but should be treated as degraded until the tunnel is repaired.",
        note: "Use the private 9448 route instead of the public hostname for now.",
      },
    ],
  },
  server: {
    title: "Server",
    summary: "Private-only machine and runtime controls stay visible here without being promoted to public launch paths.",
    entries: [
      { title: "qiserver", description: "Primary host for private services.", resourceId: "qiserver", privateOnly: true },
      { title: "Cockpit", description: "Machine-level administration.", resourceId: "cockpit", privateOnly: true },
      { title: "Portainer", description: "Container orchestration and stack visibility.", resourceId: "portainer", privateOnly: true },
      { title: "SSH", description: "Shell access should stay private only.", privateOnly: true, note: "Connection target not linked until live verification is available." },
      { title: "Raw Databases", description: "Direct database consoles should remain private only.", privateOnly: true, note: "Neo4j and any future admin consoles belong behind System." },
    ],
  },
  storage: {
    title: "Storage",
    summary: "QiNexus and Google Drive are the working storage backbone. Capture should push into inboxes before sorting.",
    entries: [
      { title: "Google Drive", description: "Backbone file store.", resourceId: "google-drive" },
      { title: "QiNexus", description: "Vault and bucket structure for daily use.", resourceId: "qinexus", privateOnly: true },
      {
        title: "Paperless",
        description: "Document intake target for the first real pipeline.",
        resourceId: "paperless",
        privateOnly: true,
        note: "Current expected endpoint on 8000 did not respond during the 2026-05-08 audit.",
      },
    ],
  },
  integrations: {
    title: "Integrations",
    summary: "Preserve working links, but keep runtime-heavy or privileged integrations clearly marked.",
    entries: [
      { title: "GitHub", description: "Code and repo workflow anchor.", resourceId: "github" },
      {
        title: "Paperless",
        description: "Document intake and warehouse.",
        resourceId: "paperless",
        privateOnly: true,
        note: "Not currently reachable on the expected 8000 endpoint.",
      },
      {
        title: "Open WebUI",
        description: "Chat surface over local models.",
        resourceId: "open-webui",
        privateOnly: true,
        note: "Verified live on 9446. The older direct 3000 assumption is no longer accurate.",
      },
      {
        title: "AnythingLLM",
        description: "RAG workspace and retrieval UI.",
        resourceId: "anythingllm",
        privateOnly: true,
        note: "Current runtime URL not verified. The old 3001 assumption now resolves to the Private Server Launcher (gethomepage) instead.",
      },
      { title: "Ollama", description: "Direct AI runtime.", resourceId: "ollama", privateOnly: true },
      { title: "Wiki.js", description: "Operational wiki and knowledge surface.", resourceId: "wiki-js", privateOnly: true },
    ],
  },
  settings: {
    title: "Settings",
    summary: "Settings stay lean: local registry controls, export/reset, and surface disposition notes.",
    entries: [
      { title: "Registry Controls", description: "Export or reset local browser registry patches.", to: "/system/settings" },
      { title: "Legacy Surface Policy", description: "web/, local/, and worker/ stay frozen until deployment is verified.", to: "/system/settings" },
    ],
  },
  diagnostics: {
    title: "Diagnostics",
    summary: "Use the graph and audit context to understand what exists, what is static, and what still needs live verification.",
    entries: [
      { title: "Relationship Graph", description: "Current registry dependency map.", to: "/system/diagnostics" },
      { title: "Current Audit", description: "Baseline inventory before deeper integration work.", to: "/system/diagnostics" },
    ],
  },
  blueprint: {
    title: "Blueprint",
    summary: "The blueprint route keeps the seven-root doctrine visible inside the app without duplicating the full documentation vault.",
    entries: [
      { title: "Seven Roots", description: "Current blueprint section map.", to: "/system/blueprint" },
      { title: "Knowledge Handoff", description: "Portal points to the real docs surface instead of copying it.", to: "/knowledge" },
    ],
  },
  roadmap: {
    title: "Roadmap",
    summary: "Use the in-app roadmap for portal phases and the docs roadmap for broader application planning.",
    entries: [
      { title: "Portal Phases", description: "Current rollout phases for QiAccess Start.", to: "/system/roadmap" },
      { title: "Applications Roadmap", description: "Project portfolio roadmap in the docs tree.", to: "/docs" },
    ],
  },
  security: {
    title: "Security",
    summary: "Security here means honest surface boundaries, access labeling, and no accidental exposure of private routes.",
    entries: [
      { title: "Boundary Rules", description: "Public versus private route posture.", to: "/system/security" },
      { title: "Access Surface", description: "Review the entry-point layer and protection model.", to: "/system/access" },
    ],
  },
};
