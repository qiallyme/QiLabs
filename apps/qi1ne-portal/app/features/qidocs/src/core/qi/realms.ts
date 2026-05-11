export type QiRealmId =
  | "QiOne"
  | "QiClients"
  | "QiProjects"
  | "QiArchive"
  | "QiSystem"
  | "QiExternal";

export interface QiRealm {
  id: QiRealmId;
  label: string;
  description: string;
}

export const qiRealms: QiRealm[] = [
  {
    id: "QiOne",
    label: "QiOne",
    description: "Your personal universe.",
  },
  {
    id: "QiClients",
    label: "QiClients",
    description: "Client universes and their orbits.",
  },
  {
    id: "QiProjects",
    label: "QiProjects",
    description: "Projects, ventures, and builds.",
  },
  {
    id: "QiArchive",
    label: "QiArchive",
    description: "Cold storage for past QiNodes.",
  },
  {
    id: "QiSystem",
    label: "QiSystem",
    description: "Schemas, configs, internal QiOS.",
  },
  {
    id: "QiExternal",
    label: "QiExternal",
    description: "Imports and external data.",
  },
];

/**
 * Validate if a string is a valid QiRealmId
 */
export function isValidRealmId(realm: string): realm is QiRealmId {
  return qiRealms.some((r) => r.id === realm);
}

