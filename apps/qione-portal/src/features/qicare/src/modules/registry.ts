import QiHome from "./qihome";
import QiChronicle from "./qichronicle";
export type ModuleKey = "qihome" | "qione_admin" | "qichronicle";

export type ModuleDef = {
    key: ModuleKey;
    name: string;
    basePath: string; // /m/qihome
    Component: React.ComponentType;
};

export const MODULES: Record<ModuleKey, ModuleDef> = {
    qihome: { key: "qihome", name: "QiHome", basePath: "/m/qihome", Component: QiHome },
    qione_admin: {
        key: "qione_admin",
        name: "QiOne Admin",
        basePath: "/t/:tenantId/settings",
        Component: () => null // stub for now
    },
    qichronicle: {
        key: "qichronicle",
        name: "QiChronicle",
        basePath: "/m/qichronicle",
        Component: QiChronicle
    },
};
