import React from 'react';
import { Inbox, Filter, Search } from 'lucide-react';

export const InboxPage: React.FC = () => {
    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Inbox className="text-cyan-500" /> Inbox
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Review and curate new documents waiting in the vault.</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-4 py-2 glass rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-white/5 transition-all">
                        <Filter size={16} /> Filter
                    </button>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search inbox..."
                            className="pl-10 pr-4 py-2 glass rounded-xl text-sm focus:ring-2 ring-cyan-500/50 outline-none w-64"
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {/* Inbox Items List Stub */}
                <div className="glass p-12 rounded-3xl border-dashed flex flex-col items-center justify-center text-center opacity-50">
                    <Inbox size={48} className="text-gray-600 mb-4" />
                    <p className="text-gray-400 font-medium">Your inbox is clear. All documents have been curated.</p>
                </div>
            </div>
        </div>
    );
};
