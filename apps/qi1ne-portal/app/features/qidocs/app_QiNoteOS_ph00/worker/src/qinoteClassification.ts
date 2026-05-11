/**
 * QiNote Classification Helpers
 * 
 * Classifies user input to determine realm, orbit, system, and type
 * Used by Gina chat endpoint to create notes intelligently
 */

// ============================================================================
// Realm Classification
// ============================================================================

export type RealmId = "QiOne" | "QiClients" | "QiProjects" | "QiArchive" | "QiSystem" | "QiExternal";

export function classifyRealm(text: string, explicitRealm?: string): RealmId {
  // If user explicitly specifies realm, use it
  if (explicitRealm) {
    const normalized = explicitRealm.trim();
    if (["QiOne", "QiClients", "QiProjects", "QiArchive", "QiSystem", "QiExternal"].includes(normalized)) {
      return normalized as RealmId;
    }
  }

  const lower = text.toLowerCase();

  // QiClients indicators
  const clientKeywords = [
    "client", "ticket", "immigration", "crm", "case", "invoice", 
    "tax return", "legal", "customer", "contact", "account"
  ];
  if (clientKeywords.some(kw => lower.includes(kw))) {
    return "QiClients";
  }

  // QiProjects indicators
  const projectKeywords = [
    "lumara", "innovahire", "project", "app", "repo", "repository",
    "deployment", "sprint", "code", "build", "development", "feature"
  ];
  if (projectKeywords.some(kw => lower.includes(kw))) {
    return "QiProjects";
  }

  // QiSystem indicators
  const systemKeywords = [
    "schema", "config", "system", "protocol", "specification", "architecture"
  ];
  if (systemKeywords.some(kw => lower.includes(kw))) {
    return "QiSystem";
  }

  // Explicit QiOne mentions
  if (lower.includes("personal") || lower.includes("my personal") || lower.includes("qione")) {
    return "QiOne";
  }

  // Default to QiOne for personal notes
  return "QiOne";
}

// ============================================================================
// System/Type Classification
// ============================================================================

export type SystemType = "Docs" | "Journal" | "Tasks" | "Knowledge" | "Memory-Fact" | "Memory-Event" | "Memory-Insight";

export function classifySystem(text: string, explicitType?: string): SystemType {
  // If user explicitly specifies type, map it
  if (explicitType) {
    const normalized = explicitType.trim().toLowerCase();
    const typeMap: Record<string, SystemType> = {
      "note": "Docs",
      "doc": "Docs",
      "document": "Docs",
      "journal": "Journal",
      "task": "Tasks",
      "todo": "Tasks",
      "system": "Docs", // System notes go to Docs
      "sop": "Docs", // SOPs are docs
      "process": "Docs",
      "protocol": "Docs",
      "knowledge": "Knowledge",
      "fact": "Memory-Fact",
      "event": "Memory-Event",
      "insight": "Memory-Insight",
    };
    if (typeMap[normalized]) {
      return typeMap[normalized];
    }
  }

  const lower = text.toLowerCase();

  // System/Process indicators
  const systemKeywords = ["sop", "process", "system", "protocol", "procedure", "workflow"];
  if (systemKeywords.some(kw => lower.includes(kw))) {
    return "Docs"; // System notes are stored as Docs
  }

  // Task indicators
  const taskKeywords = ["todo", "task", "remind", "do", "complete", "finish"];
  if (taskKeywords.some(kw => lower.includes(kw))) {
    return "Tasks";
  }

  // Journal indicators
  const journalKeywords = ["journal", "entry", "log", "diary", "reflection"];
  if (journalKeywords.some(kw => lower.includes(kw))) {
    return "Journal";
  }

  // Knowledge indicators
  const knowledgeKeywords = ["learn", "research", "study", "knowledge", "reference"];
  if (knowledgeKeywords.some(kw => lower.includes(kw))) {
    return "Knowledge";
  }

  // Default to Docs for regular notes
  return "Docs";
}

// ============================================================================
// Orbit Classification (for QiOne)
// ============================================================================

export function classifyOrbit(text: string, realm: RealmId): string {
  // For now, default to "01" (Self-Health) for QiOne
  // Can be enhanced later with more sophisticated classification
  if (realm === "QiOne") {
    return "01"; // Self-Health (default)
  }

  // For other realms, use "01" as default
  // In production, you might want to maintain orbit mappings per realm
  return "01";
}

// ============================================================================
// Combined Classification
// ============================================================================

export interface ClassificationResult {
  realm: RealmId;
  orbit: string;
  system: SystemType;
  type: "note" | "system"; // Simplified type for MVP
}

export function classifyNote(
  text: string,
  options?: {
    explicitRealm?: string;
    explicitType?: string;
    contextRealm?: string;
  }
): ClassificationResult {
  const realm = options?.contextRealm 
    ? classifyRealm(text, options.contextRealm)
    : classifyRealm(text, options?.explicitRealm);
  
  const system = classifySystem(text, options?.explicitType);
  const orbit = classifyOrbit(text, realm);

  // Determine simplified type
  const type: "note" | "system" = 
    system === "Docs" && text.toLowerCase().includes("system") ? "system" : "note";

  return {
    realm,
    orbit,
    system,
    type,
  };
}

