import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type AppShellProps = {
  outletContext?: unknown;
};

export function AppShell({ outletContext }: AppShellProps) {
  return (
    <div className="min-h-screen bg-surface-2">
      <div className="mx-auto flex max-w-[1680px] flex-col lg:flex-row">
        <div className="hidden lg:block lg:w-[296px] lg:flex-shrink-0">
          <div className="lg:sticky lg:top-0 lg:h-screen">
            <Sidebar />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-3 pb-6 pt-3 page-enter sm:px-4 sm:pb-8 sm:pt-4 lg:px-6 lg:pb-10 lg:pt-6">
            <Outlet context={outletContext} />
          </main>
        </div>
      </div>
    </div>
  );
}
