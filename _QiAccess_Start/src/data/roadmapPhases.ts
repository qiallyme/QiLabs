export type RoadmapPhase = {
  id: string;
  title: string;
  status: "active" | "next" | "later";
  description: string;
  deliverables: string[];
};

export const roadmapPhases: RoadmapPhase[] = [
  {
    id: "phase-1",
    title: "Phase 1: Stabilize the shell",
    status: "active",
    description: "Make the current SPA build cleanly, align it to the seven roots, and freeze legacy surfaces.",
    deliverables: [
      "Seven-root routes",
      "Capture and quick capture prototypes",
      "System modules under one root",
    ],
  },
  {
    id: "phase-2",
    title: "Phase 2: Prove ingestion",
    status: "next",
    description: "Turn capture from a cockpit demo into a daily-use path through Paperless, QiNexus inboxes, and timeline notes.",
    deliverables: [
      "Paperless consume flow",
      "QiNexus inbox mapping",
      "Timeline note persistence target",
    ],
  },
  {
    id: "phase-3",
    title: "Phase 3: Layer memory and insights",
    status: "later",
    description: "Only after ingestion works should memory, summarization, and insight surfaces become more than placeholders.",
    deliverables: [
      "Memory timeline",
      "Notebook-style source summaries",
      "Pattern detection and reports",
    ],
  },
];
