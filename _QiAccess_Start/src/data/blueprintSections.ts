export type BlueprintSection = {
  id: string;
  title: string;
  description: string;
  primaryQuestion: string;
};

export const blueprintSections: BlueprintSection[] = [
  {
    id: "home",
    title: "Home",
    description: "Orientation, active context, and the shortest path into the system.",
    primaryQuestion: "What matters right now?",
  },
  {
    id: "start",
    title: "Start",
    description: "Launch tools, services, and project surfaces without hunting for links.",
    primaryQuestion: "What do I need to open?",
  },
  {
    id: "capture",
    title: "Capture",
    description: "Fast intake for thoughts, files, reminders, and items that should enter a real pipeline.",
    primaryQuestion: "What do I need to save before I lose it?",
  },
  {
    id: "knowledge",
    title: "Knowledge",
    description: "Custom in-app docs, repo notes, manuals, and reference material.",
    primaryQuestion: "Where do I go to understand this?",
  },
  {
    id: "memory",
    title: "Memory",
    description: "Timeline, decisions, graph context, and retrieval-ready history.",
    primaryQuestion: "What do we already know?",
  },
  {
    id: "insights",
    title: "Insights",
    description: "Summaries, patterns, reports, and future analysis layers.",
    primaryQuestion: "What does this mean?",
  },
  {
    id: "system",
    title: "System",
    description: "Private infrastructure, settings, storage, diagnostics, and doctrine.",
    primaryQuestion: "What keeps the whole thing working?",
  },
];
