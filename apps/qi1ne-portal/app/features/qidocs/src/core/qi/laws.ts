/**
 * Laws of Qi - Core constants and validation
 * Based on 00_Laws_of_Qi.md
 */

export const QI_REALMS = [
  "QiOne",
  "QiClients",
  "QiProjects",
  "QiArchive",
  "QiSystem",
  "QiExternal",
] as const;

export type QiRealm = typeof QI_REALMS[number];

export const QI_ONE_ORBITS = [
  "Self-Health",
  "Work-Career",
  "Home-Environment",
  "Relationships-Community",
  "Spiritual-Metaphysical",
  "Finances-Security",
  "Learning-Ideas",
  "Projects-Goals",
  "Unknown-Processing",
] as const;

export type QiOneOrbit = typeof QI_ONE_ORBITS[number];

