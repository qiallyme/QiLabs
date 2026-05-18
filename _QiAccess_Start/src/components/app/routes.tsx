import { useState } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { ResourceEditorDrawer } from "../cards/ResourceEditorDrawer";
import { useFeedback } from "../feedback/FeedbackProvider";
import { AppShell } from "../layout/AppShell";
import { ServerPage } from "../../features/02_server/ServerPage";
import { useRegistry } from "../../features/resources/registry-store";
import type { Resource } from "../../types/resource";

export type EditorOutletContext = {
  onEdit: (resource: Resource) => void;
};

function ShellWithEditor() {
  const { getResource, updateResource } = useRegistry();
  const { notify } = useFeedback();
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingResource = editingId ? getResource(editingId) ?? null : null;

  function handleEdit(resource: Resource) {
    setEditingId(resource.id);
  }

  function handleSave(
    resourceId: string,
    values: Pick<Resource, "description" | "docsUrl" | "notes" | "repoUrl" | "status" | "tags">,
  ) {
    updateResource(resourceId, values);
    notify("Entry saved", "Local registry details were updated in the browser.");
    setEditingId(null);
  }

  const outletContext: EditorOutletContext = {
    onEdit: handleEdit,
  };

  return (
    <>
      <AppShell outletContext={outletContext} />
      <ResourceEditorDrawer onClose={() => setEditingId(null)} onSave={handleSave} resource={editingResource} />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <ShellWithEditor />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import("../../features/01_start/StartPage")).StartPage,
        }),
      },
      {
        path: "start",
        element: <Navigate replace to="/" />,
      },
      {
        path: "server",
        element: <ServerPage />,
      },
      {
        path: "server/:resourceId",
        element: <ServerPage />,
      },
      {
        path: "capture",
        lazy: async () => ({
          Component: (await import("../../features/03_capture/CapturePage")).CapturePage,
        }),
      },
      {
        path: "capture/quick",
        lazy: async () => ({
          Component: (await import("../../features/03_capture/quick_notes/QuickCapturePage")).QuickCapturePage,
        }),
      },
      {
        path: "capture/dev-session",
        lazy: async () => ({
          Component: (await import("../../features/03_capture/dev_session/DevSessionCapturePage")).DevSessionCapturePage,
        }),
      },
      {
        path: "quick",
        lazy: async () => ({
          Component: (await import("../../features/03_capture/quick_notes/QuickCapturePage")).QuickCapturePage,
        }),
      },
      {
        path: "docs",
        lazy: async () => ({
          Component: (await import("../../features/04_knowledge/KnowledgePage")).KnowledgePage,
        }),
      },
      {
        path: "knowledge",
        lazy: async () => ({
          Component: (await import("../../features/04_knowledge/KnowledgePage")).KnowledgePage,
        }),
      },
      {
        path: "memory",
        lazy: async () => ({
          Component: (await import("../../features/05_memory/MemoryPage")).MemoryPage,
        }),
      },
      {
        path: "insights",
        lazy: async () => ({
          Component: (await import("../../features/06_insights/InsightsPage")).InsightsPage,
        }),
      },
      {
        path: "system",
        lazy: async () => ({
          Component: (await import("../../features/07_system/SystemLayout")).SystemLayout,
        }),
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import("../../features/07_system/SystemOverviewPage")).SystemOverviewPage,
            }),
          },
          {
            path: "access",
            lazy: async () => ({
              Component: (await import("../../features/07_system/SystemAccessPage")).SystemAccessPage,
            }),
          },
          {
            path: "server",
            lazy: async () => ({
              Component: (await import("../../features/07_system/SystemServerPage")).SystemServerPage,
            }),
          },
          {
            path: "storage",
            lazy: async () => ({
              Component: (await import("../../features/07_system/SystemStoragePage")).SystemStoragePage,
            }),
          },
          {
            path: "integrations",
            lazy: async () => ({
              Component: (await import("../../features/07_system/SystemIntegrationsPage")).SystemIntegrationsPage,
            }),
          },
          {
            path: "settings",
            lazy: async () => ({
              Component: (await import("../../features/07_system/SystemSettingsPage")).SystemSettingsPage,
            }),
          },
          {
            path: "diagnostics",
            lazy: async () => ({
              Component: (await import("../../features/07_system/SystemDiagnosticsPage")).SystemDiagnosticsPage,
            }),
          },
          {
            path: "blueprint",
            lazy: async () => ({
              Component: (await import("../../features/07_system/SystemBlueprintPage")).SystemBlueprintPage,
            }),
          },
          {
            path: "roadmap",
            lazy: async () => ({
              Component: (await import("../../features/07_system/SystemRoadmapPage")).SystemRoadmapPage,
            }),
          },
          {
            path: "security",
            lazy: async () => ({
              Component: (await import("../../features/07_system/SystemSecurityPage")).SystemSecurityPage,
            }),
          },
        ],
      },
    ],
  },
]);
