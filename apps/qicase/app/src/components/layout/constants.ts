import { 
  LayoutDashboard, 
  ListOrdered, 
  Files, 
  Scale, 
  Clock, 
  FileText, 
  GitBranch, 
  Globe, 
  Library, 
  Settings,
  Table
} from "lucide-react";

export const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: ListOrdered, label: "Case Phases", to: "/phases" },
  { icon: Table, label: "Table Data", to: "/table-data" },
  { icon: GitBranch, label: "Timeline", to: "/timeline" },
  { icon: Library, label: "Legal Library", to: "/library" },
  { icon: Globe, label: "External Resources", to: "/resources" },
  { icon: Settings, label: "Configuration", to: "/settings" },
];

