// apps/qilauncher/components/layout/AppLayout.tsx
import type { ReactNode } from 'react';

interface AppLayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  chat: ReactNode;
}

export function AppLayout({ sidebar, main, chat }: AppLayoutProps) {
  return (
    <div className="h-screen w-screen flex overflow-hidden selection:bg-cyan-500 selection:text-white bg-slate-900">
      {/* Sidebar (desktop) */}
      {sidebar}

      {/* Main content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {main}
      </main>

      {/* Chat sidebar (desktop) */}
      {chat}
    </div>
  );
}

