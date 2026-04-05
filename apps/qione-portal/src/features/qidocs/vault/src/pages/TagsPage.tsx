import React from 'react';
import { Tag, Plus, Search, Folder } from 'lucide-react';

export const TagsPage: React.FC = () => {
    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Tag className="text-cyan-500" /> Taxonomy
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage tags and categories for document classification.</p>
                </div>
                <button className="px-6 py-3 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 hover:bg-cyan-400 transition-colors">
                    <Plus size={20} /> New Tag
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <section className="col-span-1 lg:col-span-3">
                    <div className="relative mb-6">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find tags..."
                            className="w-full pl-12 pr-4 py-3 glass rounded-2xl text-sm focus:ring-2 ring-cyan-500/50 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Tag list stub */}
                        <div className="glass p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-8 bg-cyan-500 rounded-full"></div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-lg uppercase tracking-tight">FINANCE</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">142 Documents</span>
                                </div>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-opacity">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </section>

                <aside className="space-y-6">
                    <div className="glass p-6 rounded-3xl">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center gap-2">
                            <Folder size={12} className="text-cyan-500" /> Categories
                        </h3>
                        <nav className="space-y-4">
                            <div className="flex justify-between items-center text-sm font-bold opacity-50 hover:opacity-100 cursor-pointer transition-opacity">
                                <span>UNGROUPED</span>
                                <span className="text-[10px] font-mono">12</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold text-cyan-400">
                                <span>TAX_RECORDS</span>
                                <span className="text-[10px] font-mono">45</span>
                            </div>
                        </nav>
                    </div>
                </aside>
            </div>
        </div>
    );
};
