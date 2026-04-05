import React from 'react';
import { Search, SlidersHorizontal, Grid3X3, List } from 'lucide-react';

export const SearchPage: React.FC = () => {
    return (
        <div className="p-8">
            <header className="flex flex-col gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Search className="text-cyan-500" /> Vault Explorer
                    </h1>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-grow">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, correspondent, or content..."
                            className="w-full pl-12 pr-4 py-3 glass rounded-2xl text-lg focus:ring-2 ring-cyan-500/50 outline-none"
                        />
                    </div>
                    <button className="px-6 py-3 glass rounded-2xl flex items-center gap-3 font-bold hover:bg-white/5 transition-all">
                        <SlidersHorizontal size={20} /> Advanced Filters
                    </button>
                </div>

                <div className="flex justify-between items-center px-2">
                    <div className="flex gap-4 text-sm text-gray-500">
                        <span>Showing 0 results</span>
                    </div>
                    <div className="flex glass rounded-lg p-1">
                        <button className="p-1.5 bg-white/10 rounded-md"><List size={16} /></button>
                        <button className="p-1.5 hover:bg-white/5 rounded-md"><Grid3X3 size={16} /></button>
                    </div>
                </div>
            </header>

            <div className="glass p-20 rounded-[3rem] flex items-center justify-center border-dashed border-white/5">
                <p className="text-gray-500 font-mono tracking-widest text-sm uppercase">Enter a query to search the vault</p>
            </div>
        </div>
    );
};
