import type {
  CareLiteEntry,
  CareLiteItem,
  ItemStatus,
  ItemStatusTone,
  OxygenLiveStatus,
  OxygenTankProfile,
  OxygenTankSession,
} from "../types";
import { startOfToday } from "./time";

function completedEntriesForItem(entries: CareLiteEntry[], itemId: string) {
  return entries
    .filter((entry) => entry.itemId === itemId && entry.status === "completed")
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export function buildItemStatus(
  item: CareLiteItem,
  entries: CareLiteEntry[],
  now: Date,
): ItemStatus {
  const relevantEntries = completedEntriesForItem(entries, item.id);
  const lastOccurredAt = relevantEntries[0]?.occurredAt ?? null;
  const nowMs = now.getTime();
  const last24hThreshold = nowMs - 24 * 60 * 60 * 1000;
  const todayThreshold = startOfToday(now).getTime();

  const last24hEntries = relevantEntries.filter(
    (entry) => new Date(entry.occurredAt).getTime() >= last24hThreshold,
  );
  const todayEntries = relevantEntries.filter(
    (entry) => new Date(entry.occurredAt).getTime() >= todayThreshold,
  );

  const usesLast24h = last24hEntries.length;
  const amountLast24h = last24hEntries.reduce((sum, entry) => sum + (entry.amount ?? 0), 0);
  const usesToday = todayEntries.length;
  const amountToday = todayEntries.reduce((sum, entry) => sum + (entry.amount ?? 0), 0);
  const isDoneToday = item.isScheduled && usesToday >= 1;

  let nextAllowedAt: string | null = null;
  let isTooSoon = false;

  if (lastOccurredAt && item.minIntervalMinutes) {
    const nextAllowed = new Date(
      new Date(lastOccurredAt).getTime() + item.minIntervalMinutes * 60000,
    );
    nextAllowedAt = nextAllowed.toISOString();
    isTooSoon = now < nextAllowed;
  }

  const useLimitReached = item.maxUsesPer24h !== null && usesLast24h >= item.maxUsesPer24h;
  const amountLimitReached =
    item.maxAmountPer24h !== null && amountLast24h >= item.maxAmountPer24h;

  let tone: ItemStatusTone = "gray";
  let headline = "Ready when needed";
  let actionLabel = "Log now";

  if (item.itemType === "note") {
    tone = "blue";
    headline = usesToday > 0 ? `${usesToday} notes today` : "Fast capture";
    actionLabel = "Add note";
  } else if (isDoneToday) {
    tone = "green";
    headline = "Done today";
    actionLabel = "Mark again";
  } else if (amountLimitReached || useLimitReached) {
    tone = "red";
    headline = "Limit reached based on saved rules";
    actionLabel = "Review feed";
  } else if (isTooSoon) {
    tone = "red";
    headline = "Wait before next dose";
    actionLabel = "Too soon";
  } else if (
    (item.maxUsesPer24h !== null && usesLast24h + 1 >= item.maxUsesPer24h) ||
    (item.maxAmountPer24h !== null &&
      item.defaultAmount !== null &&
      amountLast24h + item.defaultAmount >= item.maxAmountPer24h)
  ) {
    tone = "yellow";
    headline = "Close to saved limit";
    actionLabel = "Log now";
  } else if (item.itemType === "scheduled_check") {
    tone = "blue";
    headline = item.schedulePeriod === "AM" ? "Morning checkoff" : "Evening checkoff";
    actionLabel = "Mark done";
  } else {
    tone = "green";
    headline = "Available based on saved timing rules";
  }

  return {
    item,
    lastOccurredAt,
    nextAllowedAt,
    usesLast24h,
    amountLast24h,
    usesToday,
    amountToday,
    isDoneToday,
    isTooSoon,
    useLimitReached,
    amountLimitReached,
    tone,
    headline,
    actionLabel,
  };
}

export function getActiveOxygenProfile(profiles: OxygenTankProfile[]) {
  return profiles.find((profile) => profile.isActive) ?? profiles[0] ?? null;
}

export function getLatestOxygenSession(sessions: OxygenTankSession[]) {
  return [...sessions].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  )[0] ?? null;
}

export function computeOxygenLiveStatus(
  profiles: OxygenTankProfile[],
  sessions: OxygenTankSession[],
  now: Date,
): OxygenLiveStatus {
  const profile = getActiveOxygenProfile(profiles);
  const session = getLatestOxygenSession(sessions);

  if (!profile || !session || session.status === "replaced") {
    return {
      profile,
      session: null,
      tone: "gray",
      statusLabel: "No tank running",
      ctaLabel: "Start tank",
      remainingSeconds: null,
      runtimeUsedSeconds: 0,
      totalRuntimeSeconds: null,
      flowLpm: profile?.defaultFlowLpm ?? null,
      needsReplacement: false,
    };
  }

  const estimatedTotalSeconds =
    profile.defaultFlowLpm > 0
      ? Math.floor((profile.usableLiters / session.flowLpm) * 60)
      : null;

  const sinceLastStartSeconds =
    session.status === "running"
      ? Math.max(0, Math.floor((now.getTime() - new Date(session.lastStartedAt).getTime()) / 1000))
      : 0;
  const runtimeUsedSeconds = session.totalRuntimeSeconds + sinceLastStartSeconds;
  const remainingSeconds =
    estimatedTotalSeconds === null ? null : estimatedTotalSeconds - runtimeUsedSeconds;
  const warningSeconds = profile.warningMinutesRemaining * 60;

  if (remainingSeconds !== null && remainingSeconds <= 0) {
    return {
      profile,
      session,
      tone: "red",
      statusLabel: "Estimated empty",
      ctaLabel: "New tank",
      remainingSeconds,
      runtimeUsedSeconds,
      totalRuntimeSeconds: estimatedTotalSeconds,
      flowLpm: session.flowLpm,
      needsReplacement: true,
    };
  }

  if (session.status === "paused") {
    return {
      profile,
      session,
      tone: remainingSeconds !== null && remainingSeconds <= warningSeconds ? "yellow" : "gray",
      statusLabel: "Paused",
      ctaLabel: "Resume tank",
      remainingSeconds,
      runtimeUsedSeconds,
      totalRuntimeSeconds: estimatedTotalSeconds,
      flowLpm: session.flowLpm,
      needsReplacement: false,
    };
  }

  if (remainingSeconds !== null && remainingSeconds <= warningSeconds) {
    return {
      profile,
      session,
      tone: "yellow",
      statusLabel: "Prepare next tank",
      ctaLabel: "Pause tank",
      remainingSeconds,
      runtimeUsedSeconds,
      totalRuntimeSeconds: estimatedTotalSeconds,
      flowLpm: session.flowLpm,
      needsReplacement: false,
    };
  }

  return {
    profile,
    session,
    tone: "blue",
    statusLabel: `Running at ${session.flowLpm} L/min`,
    ctaLabel: "Pause tank",
    remainingSeconds,
    runtimeUsedSeconds,
    totalRuntimeSeconds: estimatedTotalSeconds,
    flowLpm: session.flowLpm,
    needsReplacement: false,
  };
}

export function progressPercent(runtimeUsedSeconds: number, totalRuntimeSeconds: number | null) {
  if (!totalRuntimeSeconds || totalRuntimeSeconds <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, (runtimeUsedSeconds / totalRuntimeSeconds) * 100));
}
