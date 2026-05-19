export type ItemType =
  | "treatment"
  | "oxygen_tank"
  | "scheduled_check"
  | "med"
  | "body_event"
  | "intake"
  | "note";

export type ItemCategory =
  | "breathing"
  | "oxygen"
  | "daily_meds"
  | "steroid"
  | "pain"
  | "bathroom"
  | "hydration"
  | "general";

export type SchedulePeriod = "AM" | "PM";

export type EntryStatus = "completed" | "voided";

export type OxygenSessionStatus = "running" | "paused" | "depleted" | "replaced";

export type CareLiteItem = {
  id: string;
  name: string;
  itemType: ItemType;
  category: ItemCategory;
  icon: string;
  defaultAmount: number | null;
  defaultUnit: string | null;
  minIntervalMinutes: number | null;
  maxUsesPer24h: number | null;
  maxAmountPer24h: number | null;
  isScheduled: boolean;
  schedulePeriod: SchedulePeriod | null;
  requiresConfirmation: boolean;
  sortOrder: number;
  notes: string;
};

export type EntryMetadata = Record<string, string | number | boolean | null>;

export type CareLiteEntry = {
  id: string;
  itemId: string;
  amount: number | null;
  unit: string | null;
  note: string;
  metadata: EntryMetadata;
  status: EntryStatus;
  occurredAt: string;
  createdAt: string;
};

export type OxygenTankProfile = {
  id: string;
  name: string;
  tankType: string;
  startingPressurePsi: number;
  usableLiters: number;
  defaultFlowLpm: number;
  warningMinutesRemaining: number;
  notes: string;
  isActive: boolean;
};

export type OxygenTankSession = {
  id: string;
  profileId: string;
  flowLpm: number;
  status: OxygenSessionStatus;
  startedAt: string;
  lastStartedAt: string;
  totalRuntimeSeconds: number;
  lastPausedAt: string | null;
  endedAt: string | null;
  replacedAt: string | null;
};

export type CareLiteStore = {
  items: CareLiteItem[];
  entries: CareLiteEntry[];
  oxygenProfiles: OxygenTankProfile[];
  oxygenSessions: OxygenTankSession[];
};

export type DashboardGroup = {
  id: string;
  title: string;
  itemIds: string[];
};

export type ItemStatusTone = "green" | "yellow" | "red" | "gray" | "blue";

export type ItemStatus = {
  item: CareLiteItem;
  lastOccurredAt: string | null;
  nextAllowedAt: string | null;
  usesLast24h: number;
  amountLast24h: number;
  usesToday: number;
  amountToday: number;
  isDoneToday: boolean;
  isTooSoon: boolean;
  useLimitReached: boolean;
  amountLimitReached: boolean;
  tone: ItemStatusTone;
  headline: string;
  actionLabel: string;
};

export type OxygenLiveStatus = {
  profile: OxygenTankProfile | null;
  session: OxygenTankSession | null;
  tone: ItemStatusTone;
  statusLabel: string;
  ctaLabel: string;
  remainingSeconds: number | null;
  runtimeUsedSeconds: number;
  totalRuntimeSeconds: number | null;
  flowLpm: number | null;
  needsReplacement: boolean;
};
