import type {
  Resource,
  ResourcePortalRole,
  ResourceStatus,
  ResourceVerificationState,
  ResourceZone,
} from "../../types/resource";

export const zoneOrder: ResourceZone[] = ["local", "tailnet", "admin", "public", "private"];
export const portalRoleOrder: ResourcePortalRole[] = ["bridge", "front-door", "browser-run", "reference"];

export function statusLabel(status: ResourceStatus | undefined) {
  return status ?? "unknown";
}

export function verificationLabel(state: ResourceVerificationState | undefined) {
  switch (state) {
    case "verified":
      return "Verified";
    case "pending-verification":
      return "Pending verification";
    case "broken":
      return "Broken";
    case "placeholder":
      return "Placeholder";
    case "docs-only":
      return "Docs only";
    default:
      return "Pending verification";
  }
}

export function portalRoleLabel(role: ResourcePortalRole | undefined) {
  switch (role) {
    case "front-door":
      return "Front door";
    case "browser-run":
      return "Browser run";
    case "bridge":
      return "Handoff";
    case "reference":
      return "Reference";
    default:
      return "Unclassified";
  }
}

export function portalRoleDescription(role: ResourcePortalRole | undefined) {
  switch (role) {
    case "front-door":
      return "Owned directly by the public web portal.";
    case "browser-run":
      return "Better launched from the private local portal.";
    case "bridge":
      return "Use the public portal to hand off into the private launcher.";
    case "reference":
      return "Keep visible for context, but not as a primary front-door action.";
    default:
      return "Portal role not classified yet.";
  }
}

export function portalRoleRank(resource: Resource) {
  const role = resource.portalRole ?? "reference";
  const index = portalRoleOrder.indexOf(role);
  return index === -1 ? portalRoleOrder.length : index;
}

export function shouldShowInPortalView(resource: Resource, view: "front-door" | "browser-run" | "full") {
  const role = resource.portalRole ?? "reference";

  if (view === "full") {
    return true;
  }

  if (view === "front-door") {
    return role === "front-door" || role === "bridge";
  }

  return role === "browser-run" || role === "bridge";
}

function isProtectedResource(resource: Resource) {
  if (resource.exposure === "public") {
    return false;
  }

  if (resource.exposure === "private" || resource.exposure === "private-only") {
    return true;
  }

  if (resource.zone !== "public") {
    return true;
  }

  const protectedTags = new Set(["admin", "internal", "private", "private-only", "protected", "qiserver"]);
  return resource.tags.some((tag) => protectedTags.has(tag));
}

export function resolveLaunchUrl(resource: Resource) {
  if (resource.exposure === "docs-only" || resource.verificationState === "placeholder") {
    return undefined;
  }

  if (isProtectedResource(resource)) {
    return resource.tailnetUrl ?? resource.localUrl ?? resource.url ?? resource.publicUrl;
  }

  return resource.url ?? resource.publicUrl ?? resource.tailnetUrl ?? resource.localUrl;
}

export function resolveDocsUrl(resource: Resource) {
  if (resource.docsUrl) {
    return resource.docsUrl;
  }

  if (resource.exposure === "docs-only") {
    return resource.url ?? resource.publicUrl;
  }

  return undefined;
}

export function resolveResourceUrl(resource: Resource) {
  return resolveLaunchUrl(resource);
}

export function resolveAllLinks(resource: Resource) {
  return [
    resolveLaunchUrl(resource),
    resolveDocsUrl(resource),
    resource.repoUrl,
  ].filter(Boolean) as string[];
}

export function zoneLabel(zone: ResourceZone) {
  return zone.charAt(0).toUpperCase() + zone.slice(1);
}

export function groupStatus(resources: Resource[]) {
  return {
    online: resources.filter((resource) => resource.status === "online").length,
    offline: resources.filter((resource) => resource.status === "offline").length,
    unknown: resources.filter((resource) => !resource.status || resource.status === "unknown").length,
  };
}

export function ownerLabel(resource: Resource) {
  if (resource.zone === "private") return "Personal";
  if (resource.type === "project") return "Qi Labs Projects";
  return "Qi Labs";
}
