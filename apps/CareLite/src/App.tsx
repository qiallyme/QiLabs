import {
  AlertTriangle,
  Droplets,
  Gauge,
  GlassWater,
  HeartPulse,
  MoonStar,
  NotebookPen,
  Pill,
  ShieldAlert,
  Sunrise,
  Toilet,
  Waves,
} from "lucide-react";
import { startTransition, useEffect, useState } from "react";
import { dashboardGroups } from "./data/seed";
import {
  buildItemStatus,
  computeOxygenLiveStatus,
  getLatestOxygenSession,
  progressPercent,
} from "./lib/carelite";
import { loadStore, saveStore } from "./lib/storage";
import { formatClock, formatDateTime, formatDuration, formatRelativeDuration } from "./lib/time";
import type {
  CareLiteEntry,
  CareLiteItem,
  CareLiteStore,
  EntryMetadata,
  ItemStatus,
  OxygenTankSession,
} from "./types";

type NoticeTone = "info" | "success";
type Notice = { tone: NoticeTone; text: string } | null;
type Tab = "today" | "settings";
type ModalState =
  | { type: "confirm"; item: CareLiteItem }
  | { type: "prednisone"; item: CareLiteItem }
  | { type: "powerade"; item: CareLiteItem }
  | { type: "poop"; item: CareLiteItem }
  | { type: "note"; item: CareLiteItem }
  | null;

const iconMap = {
  lungs: HeartPulse,
  gauge: Gauge,
  sunrise: Sunrise,
  moon: MoonStar,
  pill: Pill,
  capsule: Pill,
  "shield-alert": ShieldAlert,
  droplets: Droplets,
  toilet: Toilet,
  "glass-water": GlassWater,
  "notebook-pen": NotebookPen,
} as const;

const poopOptions = ["Normal", "Loose", "Hard", "Tiny", "Constipated"];
const poweradeOptions = [8, 12, 16, 20];

function App() {
  const [store, setStore] = useState<CareLiteStore>(() => loadStore());
  const [tab, setTab] = useState<Tab>("today");
  const [notice, setNotice] = useState<Notice>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    saveStore(store);
  }, [store]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const sortedItems = [...store.items].sort((a, b) => a.sortOrder - b.sortOrder);
  const statuses = sortedItems
    .filter((item) => item.itemType !== "oxygen_tank")
    .map((item) => buildItemStatus(item, store.entries, now));
  const statusById = new Map(statuses.map((status) => [status.item.id, status]));
  const oxygenStatus = computeOxygenLiveStatus(store.oxygenProfiles, store.oxygenSessions, now);
  const latestSession = getLatestOxygenSession(store.oxygenSessions);
  const recentEntries = [...store.entries]
    .filter((entry) => entry.status === "completed")
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 12);

  function announce(text: string, tone: NoticeTone = "success") {
    setNotice({ text, tone });
  }

  function patchStore(updater: (current: CareLiteStore) => CareLiteStore) {
    startTransition(() => setStore((current) => updater(current)));
  }

  function createEntry(
    item: CareLiteItem,
    {
      amount = item.defaultAmount,
      unit = item.defaultUnit,
      note = "",
      metadata = {},
      occurredAt = new Date().toISOString(),
    }: {
      amount?: number | null;
      unit?: string | null;
      note?: string;
      metadata?: EntryMetadata;
      occurredAt?: string;
    } = {},
  ) {
    const entry: CareLiteEntry = {
      id: crypto.randomUUID(),
      itemId: item.id,
      amount,
      unit,
      note,
      metadata,
      status: "completed",
      occurredAt,
      createdAt: new Date().toISOString(),
    };

    patchStore((current) => ({
      ...current,
      entries: [entry, ...current.entries],
    }));
  }

  function voidEntry(entryId: string) {
    patchStore((current) => ({
      ...current,
      entries: current.entries.map((entry) =>
        entry.id === entryId ? { ...entry, status: "voided" } : entry,
      ),
    }));
    announce("Entry voided", "info");
  }

  function handleCardAction(status: ItemStatus) {
    if (status.isTooSoon || status.useLimitReached || status.amountLimitReached) {
      announce("Saved timing rules say wait before logging this again.", "info");
      return;
    }

    const { item } = status;
    if (item.itemType === "body_event" && item.name === "Pee") {
      createEntry(item);
      announce("Pee logged");
      return;
    }
    if (item.itemType === "scheduled_check") {
      createEntry(item);
      announce(`${item.name} checked off`);
      return;
    }
    if (item.itemType === "note") {
      setModal({ type: "note", item });
      return;
    }
    if (item.name === "Prednisone") {
      setModal({ type: "prednisone", item });
      return;
    }
    if (item.name === "Powerade") {
      setModal({ type: "powerade", item });
      return;
    }
    if (item.name === "Poop") {
      setModal({ type: "poop", item });
      return;
    }

    setModal({ type: "confirm", item });
  }

  function startTank() {
    const profile = oxygenStatus.profile;
    if (!profile) {
      announce("Add or activate an oxygen profile first.", "info");
      return;
    }

    const nowIso = new Date().toISOString();
    const session: OxygenTankSession = {
      id: crypto.randomUUID(),
      profileId: profile.id,
      flowLpm: profile.defaultFlowLpm,
      status: "running",
      startedAt: nowIso,
      lastStartedAt: nowIso,
      totalRuntimeSeconds: 0,
      lastPausedAt: null,
      endedAt: null,
      replacedAt: null,
    };

    patchStore((current) => ({
      ...current,
      oxygenSessions: [session, ...current.oxygenSessions],
    }));
    announce("Tank started");
  }

  function pauseTank() {
    if (!latestSession || latestSession.status !== "running") {
      return;
    }

    const secondsSinceStart = Math.max(
      0,
      Math.floor((Date.now() - new Date(latestSession.lastStartedAt).getTime()) / 1000),
    );

    patchStore((current) => ({
      ...current,
      oxygenSessions: current.oxygenSessions.map((session) =>
        session.id === latestSession.id
          ? {
              ...session,
              status: "paused",
              totalRuntimeSeconds: session.totalRuntimeSeconds + secondsSinceStart,
              lastPausedAt: new Date().toISOString(),
            }
          : session,
      ),
    }));
    announce("Tank paused", "info");
  }

  function resumeTank() {
    if (!latestSession || (latestSession.status !== "paused" && latestSession.status !== "depleted")) {
      return;
    }

    patchStore((current) => ({
      ...current,
      oxygenSessions: current.oxygenSessions.map((session) =>
        session.id === latestSession.id
          ? {
              ...session,
              status: "running",
              lastStartedAt: new Date().toISOString(),
            }
          : session,
      ),
    }));
    announce("Tank resumed");
  }

  function replaceTank() {
    const profile = oxygenStatus.profile;
    if (!latestSession || !profile) {
      return;
    }

    const nowIso = new Date().toISOString();
    const replacement: OxygenTankSession = {
      id: crypto.randomUUID(),
      profileId: profile.id,
      flowLpm: profile.defaultFlowLpm,
      status: "running",
      startedAt: nowIso,
      lastStartedAt: nowIso,
      totalRuntimeSeconds: 0,
      lastPausedAt: null,
      endedAt: null,
      replacedAt: null,
    };

    patchStore((current) => ({
      ...current,
      oxygenSessions: [
        replacement,
                ...current.oxygenSessions.map((session) =>
                  session.id === latestSession.id
                    ? {
                        ...session,
                        status: "replaced" as const,
                        endedAt: nowIso,
                        replacedAt: nowIso,
                      }
            : session,
        ),
      ],
    }));
    announce("New tank started");
  }

  function updateItem(itemId: string, patch: Partial<CareLiteItem>) {
    patchStore((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    }));
  }

  function updateProfile(patch: Partial<CareLiteStore["oxygenProfiles"][number]>) {
    patchStore((current) => ({
      ...current,
      oxygenProfiles: current.oxygenProfiles.map((profile, index) =>
        index === 0 ? { ...profile, ...patch } : profile,
      ),
    }));
  }

  const progress = progressPercent(
    oxygenStatus.runtimeUsedSeconds,
    oxygenStatus.totalRuntimeSeconds,
  );

  return (
    <div className="shell">
      <div className="backdrop backdrop-one" />
      <div className="backdrop backdrop-two" />

      <main className="app">
        <header className="hero">
          <div>
            <p className="eyebrow">Daily care cockpit</p>
            <h1>CareLite</h1>
            <p className="hero-copy">
              Big buttons, quick timing checks, and one obvious place to see what happened today.
            </p>
          </div>

          <div className="hero-actions">
            <button
              className={tab === "today" ? "tab is-active" : "tab"}
              type="button"
              onClick={() => setTab("today")}
            >
              Today
            </button>
            <button
              className={tab === "settings" ? "tab is-active" : "tab"}
              type="button"
              onClick={() => setTab("settings")}
            >
              Settings
            </button>
          </div>
        </header>

        {notice ? <div className={`notice notice-${notice.tone}`}>{notice.text}</div> : null}

        {tab === "today" ? (
          <section className="content-grid">
            <div className="dashboard-column">
              <section className={`oxygen-panel tone-${oxygenStatus.tone}`}>
                <div className="oxygen-header">
                  <div>
                    <p className="section-label">Oxygen</p>
                    <h2>Tank monitor</h2>
                  </div>
                  <Waves className="oxygen-icon" />
                </div>
                <p className="oxygen-status">{oxygenStatus.statusLabel}</p>
                <p className="oxygen-detail">
                  {oxygenStatus.remainingSeconds === null
                    ? "No tank estimate yet"
                    : `Estimated ${formatDuration(oxygenStatus.remainingSeconds)} left`}
                </p>
                <div className="oxygen-meter" aria-hidden="true">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="oxygen-meta">
                  <span>
                    Flow {oxygenStatus.flowLpm ?? oxygenStatus.profile?.defaultFlowLpm ?? 0} L/min
                  </span>
                  <span>{oxygenStatus.profile?.usableLiters ?? 0} usable liters</span>
                </div>
                <div className="oxygen-actions">
                  {!oxygenStatus.session ? (
                    <button type="button" className="primary-button" onClick={startTank}>
                      Start tank
                    </button>
                  ) : oxygenStatus.needsReplacement ? (
                    <>
                      <button type="button" className="primary-button" onClick={replaceTank}>
                        Yes, new tank
                      </button>
                      <button type="button" className="secondary-button" onClick={pauseTank}>
                        Keep paused
                      </button>
                    </>
                  ) : latestSession?.status === "running" ? (
                    <button type="button" className="primary-button" onClick={pauseTank}>
                      Pause tank
                    </button>
                  ) : (
                    <>
                      <button type="button" className="primary-button" onClick={resumeTank}>
                        Resume tank
                      </button>
                      <button type="button" className="secondary-button" onClick={replaceTank}>
                        New tank
                      </button>
                    </>
                  )}
                </div>
                <p className="safety-copy">
                  Estimated tank time left. Verify the actual tank size and supplier label.
                </p>
              </section>

              {dashboardGroups.map((group) => (
                <section key={group.id} className="group">
                  <div className="group-header">
                    <h3>{group.title}</h3>
                  </div>
                  <div className="card-grid">
                    {group.itemIds
                      .filter((itemId) => itemId !== "o2-tank")
                      .map((itemId) => {
                        const status = statusById.get(itemId);
                        if (!status) {
                          return null;
                        }

                        const Icon = iconMap[status.item.icon as keyof typeof iconMap] ?? AlertTriangle;
                        const secondaryLine = status.nextAllowedAt
                          ? `Next: ${formatClock(status.nextAllowedAt)}`
                          : status.item.itemType === "intake"
                            ? `Today: ${status.amountToday} ${status.item.defaultUnit ?? ""}`.trim()
                            : `24h: ${status.usesLast24h}`;

                        return (
                          <article key={status.item.id} className={`care-card tone-${status.tone}`}>
                            <div className="card-top">
                              <div className="icon-badge">
                                <Icon />
                              </div>
                              <div>
                                <p className="card-name">{status.item.name}</p>
                                <p className="card-headline">{status.headline}</p>
                              </div>
                            </div>

                            <div className="card-metrics">
                              <div>
                                <span className="metric-label">Last</span>
                                <strong>{formatClock(status.lastOccurredAt)}</strong>
                              </div>
                              <div>
                                <span className="metric-label">
                                  {status.nextAllowedAt ? "Wait" : "Totals"}
                                </span>
                                <strong>
                                  {status.nextAllowedAt
                                    ? formatRelativeDuration(status.nextAllowedAt, now.getTime())
                                    : secondaryLine.replace(/^Today:\s*/, "")}
                                </strong>
                              </div>
                            </div>

                            <p className="card-detail">{secondaryLine}</p>

                            <button
                              type="button"
                              className="primary-button"
                              onClick={() => handleCardAction(status)}
                              disabled={status.isTooSoon || status.useLimitReached || status.amountLimitReached}
                            >
                              {status.actionLabel}
                            </button>
                          </article>
                        );
                      })}
                  </div>
                </section>
              ))}
            </div>

            <aside className="feed-panel">
              <div className="feed-panel-header">
                <div>
                  <p className="section-label">Recent activity</p>
                  <h3>Today feed</h3>
                </div>
              </div>

              <div className="feed-list">
                {recentEntries.length ? (
                  recentEntries.map((entry) => {
                    const item = store.items.find((candidate) => candidate.id === entry.itemId);
                    if (!item) {
                      return null;
                    }

                    const summary =
                      entry.note ||
                      [entry.amount, entry.unit].filter(Boolean).join(" ") ||
                      "Completed";

                    return (
                      <article key={entry.id} className="feed-row">
                        <div>
                          <p className="feed-time">{formatDateTime(entry.occurredAt)}</p>
                          <p className="feed-title">{item.name}</p>
                          <p className="feed-summary">{summary}</p>
                        </div>
                        <button
                          type="button"
                          className="void-button"
                          onClick={() => voidEntry(entry.id)}
                        >
                          Void
                        </button>
                      </article>
                    );
                  })
                ) : (
                  <div className="empty-state">
                    <p>No activity yet.</p>
                    <span>Tap a card and the day starts filling itself in.</span>
                  </div>
                )}
              </div>
            </aside>
          </section>
        ) : (
          <section className="settings-layout">
            <div className="settings-card">
              <div className="settings-header">
                <div>
                  <p className="section-label">Lean admin</p>
                  <h2>Saved rules</h2>
                </div>
                <p className="settings-copy">
                  Adjust timing and totals here without dragging MomsCare admin complexity into the daily screen.
                </p>
              </div>

              <div className="settings-list">
                {sortedItems
                  .filter((item) => item.itemType !== "oxygen_tank")
                  .map((item) => (
                    <section key={item.id} className="settings-item">
                      <div className="settings-item-header">
                        <h3>{item.name}</h3>
                        <span>{item.defaultAmount ?? "No default"} {item.defaultUnit ?? ""}</span>
                      </div>
                      <div className="settings-grid">
                        <label>
                          Default amount
                          <input
                            type="number"
                            value={item.defaultAmount ?? 0}
                            onChange={(event) =>
                              updateItem(item.id, {
                                defaultAmount: Number(event.target.value) || 0,
                              })
                            }
                          />
                        </label>
                        <label>
                          Interval minutes
                          <input
                            type="number"
                            value={item.minIntervalMinutes ?? 0}
                            onChange={(event) =>
                              updateItem(item.id, {
                                minIntervalMinutes: Number(event.target.value) || null,
                              })
                            }
                          />
                        </label>
                        <label>
                          Max uses per 24h
                          <input
                            type="number"
                            value={item.maxUsesPer24h ?? 0}
                            onChange={(event) =>
                              updateItem(item.id, {
                                maxUsesPer24h: Number(event.target.value) || null,
                              })
                            }
                          />
                        </label>
                        <label>
                          Max amount per 24h
                          <input
                            type="number"
                            value={item.maxAmountPer24h ?? 0}
                            onChange={(event) =>
                              updateItem(item.id, {
                                maxAmountPer24h: Number(event.target.value) || null,
                              })
                            }
                          />
                        </label>
                      </div>
                    </section>
                  ))}
              </div>
            </div>

            <div className="settings-card">
              <div className="settings-header">
                <div>
                  <p className="section-label">Oxygen profile</p>
                  <h2>Tank estimate</h2>
                </div>
              </div>

              <div className="settings-grid">
                <label>
                  Tank name
                  <input
                    type="text"
                    value={store.oxygenProfiles[0]?.name ?? ""}
                    onChange={(event) => updateProfile({ name: event.target.value })}
                  />
                </label>
                <label>
                  Tank type
                  <input
                    type="text"
                    value={store.oxygenProfiles[0]?.tankType ?? ""}
                    onChange={(event) => updateProfile({ tankType: event.target.value })}
                  />
                </label>
                <label>
                  Usable liters
                  <input
                    type="number"
                    value={store.oxygenProfiles[0]?.usableLiters ?? 0}
                    onChange={(event) => updateProfile({ usableLiters: Number(event.target.value) || 0 })}
                  />
                </label>
                <label>
                  Default flow L/min
                  <input
                    type="number"
                    value={store.oxygenProfiles[0]?.defaultFlowLpm ?? 0}
                    onChange={(event) => updateProfile({ defaultFlowLpm: Number(event.target.value) || 0 })}
                  />
                </label>
                <label>
                  Warning minutes remaining
                  <input
                    type="number"
                    value={store.oxygenProfiles[0]?.warningMinutesRemaining ?? 0}
                    onChange={(event) =>
                      updateProfile({ warningMinutesRemaining: Number(event.target.value) || 0 })
                    }
                  />
                </label>
              </div>
              <p className="safety-copy">
                Placeholder estimate. Verify actual tank type and capacity with the supplier label before trusting the countdown.
              </p>
            </div>
          </section>
        )}
      </main>

      {modal ? (
        <ModalFrame title={modal.item.name} onClose={() => setModal(null)}>
          {modal.type === "confirm" ? (
            <ConfirmModal
              item={modal.item}
              onCancel={() => setModal(null)}
              onConfirm={() => {
                createEntry(modal.item);
                setModal(null);
                announce(`${modal.item.name} logged`);
              }}
            />
          ) : null}
          {modal.type === "prednisone" ? (
            <PrednisoneModal
              item={modal.item}
              onCancel={() => setModal(null)}
              onConfirm={(amount) => {
                createEntry(modal.item, { amount, unit: "tablet" });
                setModal(null);
                announce(`Prednisone logged: ${amount} tablet`);
              }}
            />
          ) : null}
          {modal.type === "powerade" ? (
            <PoweradeModal
              item={modal.item}
              onCancel={() => setModal(null)}
              onConfirm={(amount) => {
                createEntry(modal.item, { amount, unit: "oz" });
                setModal(null);
                announce(`Powerade logged: ${amount} oz`);
              }}
            />
          ) : null}
          {modal.type === "poop" ? (
            <PoopModal
              item={modal.item}
              onCancel={() => setModal(null)}
              onConfirm={(stoolType, note) => {
                createEntry(modal.item, {
                  metadata: { stool_type: stoolType.toLowerCase() },
                  note,
                });
                setModal(null);
                announce(`Poop logged: ${stoolType}`);
              }}
            />
          ) : null}
          {modal.type === "note" ? (
            <QuickNoteModal
              onCancel={() => setModal(null)}
              onConfirm={(note) => {
                createEntry(modal.item, { note, amount: null, unit: null });
                setModal(null);
                announce("Quick note saved");
              }}
            />
          ) : null}
        </ModalFrame>
      ) : null}
    </div>
  );
}

function ModalFrame({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({
  item,
  onCancel,
  onConfirm,
}: {
  item: CareLiteItem;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="modal-stack">
      <p className="modal-copy">
        Log {item.name} at {formatClock(new Date().toISOString())}. Confirm actual limits with prescription and care instructions.
      </p>
      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="primary-button" onClick={onConfirm}>
          Confirm log
        </button>
      </div>
    </div>
  );
}

function PrednisoneModal({
  item,
  onCancel,
  onConfirm,
}: {
  item: CareLiteItem;
  onCancel: () => void;
  onConfirm: (amount: number) => void;
}) {
  const [amount, setAmount] = useState(item.defaultAmount ?? 1);
  return (
    <div className="modal-stack">
      <label className="modal-field">
        Tablets taken
        <input
          type="number"
          min={1}
          step={1}
          value={amount}
          onChange={(event) => setAmount(Math.max(1, Number(event.target.value) || 1))}
        />
      </label>
      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="primary-button" onClick={() => onConfirm(amount)}>
          Save
        </button>
      </div>
    </div>
  );
}

function PoweradeModal({
  item,
  onCancel,
  onConfirm,
}: {
  item: CareLiteItem;
  onCancel: () => void;
  onConfirm: (amount: number) => void;
}) {
  const [amount, setAmount] = useState(item.defaultAmount ?? 12);
  return (
    <div className="modal-stack">
      <div className="choice-row">
        {poweradeOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={amount === option ? "choice-chip is-active" : "choice-chip"}
            onClick={() => setAmount(option)}
          >
            {option} oz
          </button>
        ))}
      </div>
      <label className="modal-field">
        Custom ounces
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(event) => setAmount(Math.max(1, Number(event.target.value) || 1))}
        />
      </label>
      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="primary-button" onClick={() => onConfirm(amount)}>
          Save intake
        </button>
      </div>
    </div>
  );
}

function PoopModal({
  item: _item,
  onCancel,
  onConfirm,
}: {
  item: CareLiteItem;
  onCancel: () => void;
  onConfirm: (stoolType: string, note: string) => void;
}) {
  const [selected, setSelected] = useState("Normal");
  const [note, setNote] = useState("");
  return (
    <div className="modal-stack">
      <div className="choice-row">
        {poopOptions.map((option) => (
          <button
            key={option}
            type="button"
            className={selected === option ? "choice-chip is-active" : "choice-chip"}
            onClick={() => setSelected(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <label className="modal-field">
        Optional note
        <textarea
          rows={4}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Anything worth remembering?"
        />
      </label>
      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => onConfirm(selected, note.trim())}
        >
          Save log
        </button>
      </div>
    </div>
  );
}

function QuickNoteModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState("");
  return (
    <div className="modal-stack">
      <label className="modal-field">
        Quick note
        <textarea
          rows={5}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Tap, tap, type one sentence, save."
        />
      </label>
      <div className="modal-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={() => onConfirm(note.trim())}
          disabled={!note.trim()}
        >
          Save note
        </button>
      </div>
    </div>
  );
}

export default App;
