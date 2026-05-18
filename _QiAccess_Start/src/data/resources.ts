import type { Resource } from "../types/resource";
import { launcherApps } from "./launcherApps";
import { serviceLinks } from "./serviceLinks";

export const seedResources: Resource[] = [...launcherApps, ...serviceLinks];
