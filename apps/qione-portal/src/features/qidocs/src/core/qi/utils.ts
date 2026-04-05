/**
 * Utility functions for Qi code lookups and validation
 */

import { QiRealmId, isValidRealmId as validateRealmId } from "./realms";
import { qiOneOrbits, QiOrbit } from "./orbits";
import { qiSystems, QiSystem } from "./systems";

export type SystemCode = 
  | "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09"  // User systems
  | "10" | "11" | "12" | "13" | "14" | "15";  // Gina memory systems

// Re-export for convenience
export { validateRealmId as isValidRealmId };

/**
 * Get orbit code by orbit ID for a given realm
 */
export function getOrbitCode(realm: QiRealmId, orbitId: string): string | null {
  if (realm === "QiOne") {
    const orbit = qiOneOrbits.find((o) => o.id === orbitId);
    return orbit?.code ?? null;
  }
  // For other realms, orbit codes are dynamic and stored elsewhere
  // This is a placeholder - implement based on your storage strategy
  return null;
}

/**
 * Get system code by system ID
 */
export function getSystemCode(systemId: string): SystemCode | null {
  const system = qiSystems.find((s) => s.id === systemId);
  return (system?.code as SystemCode) ?? null;
}

/**
 * Get system by code
 */
export function getSystemByCode(code: SystemCode): QiSystem | null {
  return qiSystems.find((s) => s.code === code) ?? null;
}

/**
 * Get orbit by ID for QiOne
 */
export function getQiOneOrbit(orbitId: string): QiOrbit | null {
  return qiOneOrbits.find((o) => o.id === orbitId) ?? null;
}

/**
 * Validate system code
 */
export function isValidSystemCode(code: string): code is SystemCode {
  return [
    "01", "02", "03", "04", "05", "06", "07", "08", "09",  // User systems
    "10", "11", "12", "13", "14", "15"  // Gina memory systems
  ].includes(code);
}

/**
 * Validate orbit code format (2 digits)
 */
export function isValidOrbitCode(code: string): boolean {
  return /^\d{2}$/.test(code);
}

