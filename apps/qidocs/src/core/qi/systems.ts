export interface QiSystem {
  id: string;
  code: string; // e.g. "01"
  label: string;
  description?: string;
  isGinaMemory?: boolean; // true for Memory-* systems
}

export const qiSystems: QiSystem[] = [
  // User systems
  { id: "Journal", code: "01", label: "Journal" },
  { id: "Tasks", code: "02", label: "Tasks" },
  { id: "Docs", code: "03", label: "Docs" },
  { id: "Events", code: "04", label: "Events" },
  { id: "Timeline", code: "05", label: "Timeline" },
  { id: "Knowledge", code: "06", label: "Knowledge" },
  { id: "Media", code: "07", label: "Media" },
  { id: "Exhibits", code: "08", label: "Exhibits" },
  { id: "Threads", code: "09", label: "Threads" },
  
  // Gina memory systems
  { id: "Memory-Fact", code: "10", label: "Memory-Fact", isGinaMemory: true, description: "Distilled stable facts" },
  { id: "Memory-Event", code: "11", label: "Memory-Event", isGinaMemory: true, description: "Summarized episodes" },
  { id: "Memory-Insight", code: "12", label: "Memory-Insight", isGinaMemory: true, description: "Patterns and reflections" },
  { id: "Memory-Plan", code: "13", label: "Memory-Plan", isGinaMemory: true, description: "Multi-step plans and strategies" },
  { id: "Memory-Link", code: "14", label: "Memory-Link", isGinaMemory: true, description: "Cross-links between nodes" },
  { id: "Memory-Config", code: "15", label: "Memory-Config", isGinaMemory: true, description: "Internal configs and flags" },
];

