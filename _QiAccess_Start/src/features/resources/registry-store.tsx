import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedResources } from "../../data/resources";
import type { Resource, ResourcePatch } from "../../types/resource";

const STORAGE_KEY = "qiaccess.registry.patches.v1";

type RegistryContextValue = {
  resources: Resource[];
  getResource: (resourceId: string) => Resource | undefined;
  updateResource: (resourceId: string, patch: ResourcePatch) => void;
  resetRegistry: () => void;
  exportRegistry: () => string;
};

const RegistryContext = createContext<RegistryContextValue | null>(null);

function readPatches() {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, ResourcePatch>;
  } catch {
    return {};
  }
}

export function RegistryProvider({ children }: { children: ReactNode }) {
  const [patches, setPatches] = useState<Record<string, ResourcePatch>>(() => readPatches());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(patches));
  }, [patches]);

  const resources = useMemo(
    () =>
      seedResources.map((resource) => ({
        ...resource,
        ...patches[resource.id],
      })),
    [patches],
  );

  const resourceMap = useMemo(() => new Map(resources.map((resource) => [resource.id, resource])), [resources]);

  const value = useMemo<RegistryContextValue>(
    () => ({
      resources,
      getResource: (resourceId) => resourceMap.get(resourceId),
      updateResource: (resourceId, patch) => {
        setPatches((current) => ({
          ...current,
          [resourceId]: {
            ...current[resourceId],
            ...patch,
          },
        }));
      },
      resetRegistry: () => {
        setPatches({});
      },
      exportRegistry: () => JSON.stringify(resources, null, 2),
    }),
    [resourceMap, resources],
  );

  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>;
}

export function useRegistry() {
  const context = useContext(RegistryContext);

  if (!context) {
    throw new Error("useRegistry must be used inside RegistryProvider.");
  }

  return context;
}
