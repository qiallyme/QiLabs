import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  ActivityIcon,
  ArrowRightIcon,
  BookMarkedIcon,
  BookOpenIcon,
  BoxesIcon,
  LayoutDashboardIcon,
  NetworkIcon,
  NotebookTabsIcon,
  PencilLineIcon,
  SquareTerminalIcon,
} from "../icons/qi-icons";
import { getAutoExpandedIds, getNavTree, isPathActive, type NavIcon, type NavTreeItem } from "../../lib/navigation";

type TreeMenuProps = {
  mode?: "desktop" | "mobile";
  onNavigate?: () => void;
};

const iconMap: Record<NavIcon, typeof LayoutDashboardIcon> = {
  home: LayoutDashboardIcon,
  capture: PencilLineIcon,
  knowledge: NotebookTabsIcon,
  memory: NetworkIcon,
  insights: ActivityIcon,
  system: SquareTerminalIcon,
  family: BoxesIcon,
  legal: BookOpenIcon,
  finance: BookMarkedIcon,
  server: SquareTerminalIcon,
};

function TreeRow({
  item,
  level,
  mobile,
  onNavigate,
  openIds,
  setOpenIds,
}: {
  item: NavTreeItem;
  level: number;
  mobile: boolean;
  onNavigate?: () => void;
  openIds: string[];
  setOpenIds: Dispatch<SetStateAction<string[]>>;
}) {
  const location = useLocation();
  const hasChildren = Boolean(item.children?.length);
  const isOpen = openIds.includes(item.id);
  const isActive = isPathActive(location.pathname, item.to);
  const childActive = item.children?.some((child) => isPathActive(location.pathname, child.to)) ?? false;
  const Icon = iconMap[item.icon];
  const paddingLeft = `${12 + level * 14}px`;

  function toggleSection() {
    setOpenIds((current) => (current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]));
  }

  return (
    <div className="grid gap-1">
      <div className="flex items-center gap-2">
        <NavLink
          className={({ isActive: exactActive }) =>
            [
              "tree-link flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-3 text-sm transition",
              exactActive || childActive || isActive ? "tree-link-active" : "tree-link-idle",
              mobile ? "shadow-card" : "",
            ].join(" ")
          }
          end={item.to === "/"}
          onClick={onNavigate}
          style={{ paddingLeft }}
          to={item.to}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {hasChildren ? (
            <span className="rounded-full border border-border bg-surface-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-subtle">
              Tree
            </span>
          ) : null}
        </NavLink>

        {hasChildren ? (
          <button
            aria-label={isOpen ? `Collapse ${item.label}` : `Expand ${item.label}`}
            className="tree-toggle flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface-2 text-muted transition hover:border-brand-400 hover:text-heading"
            onClick={toggleSection}
            type="button"
          >
            <ArrowRightIcon className={`h-4 w-4 transition ${isOpen ? "rotate-90" : ""}`} />
          </button>
        ) : null}
      </div>

      {hasChildren && isOpen ? (
        <div className="ml-4 border-l border-border/80 pl-2">
          <div className="grid gap-1.5 py-1">
            {item.children?.map((child) => (
              <TreeRow
                item={child}
                key={child.id}
                level={level + 1}
                mobile={mobile}
                onNavigate={onNavigate}
                openIds={openIds}
                setOpenIds={setOpenIds}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TreeMenu({ mode = "desktop", onNavigate }: TreeMenuProps) {
  const location = useLocation();
  const [openIds, setOpenIds] = useState<string[]>(() => getAutoExpandedIds(location.pathname));

  useEffect(() => {
    const autoExpanded = getAutoExpandedIds(location.pathname);
    setOpenIds((current) => Array.from(new Set([...current, ...autoExpanded])));
  }, [location.pathname]);

  return (
    <nav className={mode === "mobile" ? "grid gap-2" : "grid gap-2"}>
      {getNavTree().map((item) => (
        <TreeRow
          item={item}
          key={item.id}
          level={0}
          mobile={mode === "mobile"}
          onNavigate={onNavigate}
          openIds={openIds}
          setOpenIds={setOpenIds}
        />
      ))}
    </nav>
  );
}
