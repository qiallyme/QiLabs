export type ResourceType =
  | "app"
  | "server"
  | "service"
  | "repo"
  | "doc"
  | "database"
  | "automation"
  | "ai-model"
  | "project";

export type ResourceZone = "public" | "tailnet" | "local" | "admin" | "private";

export type ResourceStatus = "online" | "offline" | "unknown";

export type ResourceExposure = "public" | "private" | "private-only" | "docs-only";

export type ResourceVerificationState =
  | "verified"
  | "pending-verification"
  | "broken"
  | "placeholder"
  | "docs-only";

export type ResourcePortalRole = "front-door" | "browser-run" | "bridge" | "reference";

export type Resource = {
  id: string;
  name: string;
  slug: string;
  type: ResourceType;
  zone: ResourceZone;
  exposure?: ResourceExposure;
  description: string;
  url?: string;
  localUrl?: string;
  tailnetUrl?: string;
  publicUrl?: string;
  repoUrl?: string;
  docsUrl?: string;
  status?: ResourceStatus;
  verificationState?: ResourceVerificationState;
  portalRole?: ResourcePortalRole;
  tags: string[];
  dependsOn?: string[];
  launches?: string[];
  notes?: string;
};

export type ResourcePatch = Partial<
  Pick<
    Resource,
    | "description"
    | "docsUrl"
    | "exposure"
    | "localUrl"
    | "notes"
    | "portalRole"
    | "publicUrl"
    | "repoUrl"
    | "status"
    | "tailnetUrl"
    | "tags"
    | "url"
    | "verificationState"
    | "zone"
  >
>;
