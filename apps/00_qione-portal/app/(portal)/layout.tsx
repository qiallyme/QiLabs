import React from 'react';
import Sidebar from '@/ui/components/Sidebar';
import Topbar from '@/ui/components/Topbar';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white flex items-stretch">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen flex flex-col relative">
                <Topbar />
                <div className="px-10 pt-28 pb-12 w-full max-w-7xl mx-auto flex-1">
                    {children}
                </div>

                <footer className="px-10 py-8 border-t border-slate-200 bg-white/50 flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] w-full">
                    <div>© 2026 QiLabs. Developed by QiOne AI.</div>
                    <div className="flex items-center space-x-6">
                        <span className="text-blue-600">v1.1 Stable</span>
                        <span className="text-emerald-500 ring-1 ring-emerald-500/20 px-2 py-0.5 rounded-full bg-emerald-50">Operational</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}
