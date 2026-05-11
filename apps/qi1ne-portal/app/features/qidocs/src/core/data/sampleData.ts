import { QiNode } from "../qi/schema";

export const sampleNodes: QiNode[] = [
  {
    qid: "1.02.01.001",
    title: "Morning reflection on work priorities",
    realm: "QiOne",
    orbit: "Work-Career",
    system: "Journal",
    summary: "Quick morning journal entry about work priorities",
    body: "Today I need to focus on...",
    time: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    credits: {
      author: "QiOne",
      created_by: "user",
    },
  },
  {
    qid: "1.06.02.001",
    title: "Review monthly budget",
    realm: "QiOne",
    orbit: "Finances-Security",
    system: "Tasks",
    status: "Active",
    summary: "Task to review monthly budget",
    time: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    credits: {
      author: "QiOne",
      created_by: "user",
    },
  },
];

