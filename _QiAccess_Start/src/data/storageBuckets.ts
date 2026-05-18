export type StorageBucket = {
  id: string;
  label: string;
  path: string;
  purpose: string;
  status: "active" | "planned";
  visibility: "private" | "shared";
};

export const storageBuckets: StorageBucket[] = [
  {
    id: "qinexus-inbox",
    label: "QiNexus Inbox",
    path: "00_inbox",
    purpose: "Fast drop zone for capture, intake, and items that still need sorting.",
    status: "active",
    visibility: "private",
  },
  {
    id: "people",
    label: "People",
    path: "20_people",
    purpose: "Relationship, contact, and household context.",
    status: "active",
    visibility: "private",
  },
  {
    id: "business",
    label: "Business",
    path: "30_business",
    purpose: "Operational and commercial material.",
    status: "active",
    visibility: "private",
  },
  {
    id: "projects",
    label: "Projects",
    path: "40_projects",
    purpose: "Project working files, plans, and shipping artifacts.",
    status: "active",
    visibility: "private",
  },
  {
    id: "finance",
    label: "Finance",
    path: "50_finance",
    purpose: "Finance and legal-adjacent references that need careful access boundaries.",
    status: "active",
    visibility: "private",
  },
  {
    id: "tech",
    label: "Tech",
    path: "60_tech",
    purpose: "Technical notes, tools, code references, and stack material.",
    status: "active",
    visibility: "private",
  },
  {
    id: "assets",
    label: "Assets",
    path: "70_assets",
    purpose: "Media, design, and reusable assets.",
    status: "active",
    visibility: "shared",
  },
  {
    id: "data",
    label: "Data",
    path: "80_data",
    purpose: "Structured exports, datasets, and system-generated files.",
    status: "active",
    visibility: "private",
  },
  {
    id: "archive",
    label: "Archive",
    path: "90_archive",
    purpose: "Retired or colder material kept for reference.",
    status: "active",
    visibility: "private",
  },
];
