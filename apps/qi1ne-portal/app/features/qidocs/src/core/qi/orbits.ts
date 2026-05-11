export interface QiOrbit {
  id: string;
  realmId: "QiOne" | string;
  code: string; // e.g. "01"
  label: string;
}

export const qiOneOrbits: QiOrbit[] = [
  { id: "Self-Health", realmId: "QiOne", code: "01", label: "Self & Health" },
  { id: "Work-Career", realmId: "QiOne", code: "02", label: "Work & Career" },
  {
    id: "Home-Environment",
    realmId: "QiOne",
    code: "03",
    label: "Home & Environment",
  },
  {
    id: "Relationships-Community",
    realmId: "QiOne",
    code: "04",
    label: "Relationships & Community",
  },
  {
    id: "Spiritual-Metaphysical",
    realmId: "QiOne",
    code: "05",
    label: "Spiritual & Metaphysical",
  },
  {
    id: "Finances-Security",
    realmId: "QiOne",
    code: "06",
    label: "Finances & Security",
  },
  {
    id: "Learning-Ideas",
    realmId: "QiOne",
    code: "07",
    label: "Learning & Ideas",
  },
  {
    id: "Projects-Goals",
    realmId: "QiOne",
    code: "08",
    label: "Projects & Goals",
  },
  {
    id: "Unknown-Processing",
    realmId: "QiOne",
    code: "09",
    label: "Unknown / Processing",
  },
];

