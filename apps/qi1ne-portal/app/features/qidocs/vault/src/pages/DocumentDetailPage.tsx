import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft,
    FileText,
    Tag,
    Calendar,
    User,
    ExternalLink,
    Download,
    MoreHorizontal,
    Trash2,
    CheckCircle2
} from 'lucide-react';

export const DocumentDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-grow flex flex-col p-6 overflow-y-auto">
                <nav className="flex items-center gap-4 mb-8">
                    <Link to="/inbox" className="p-2 glass rounded-lg hover:bg-white/5 transition-all">
                        <ChevronLeft size={20} />
                    </Link>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black text-cyan-500/50 tracking-widest">Document Registry</span>
                        <h2 className="text-xl font-bold tracking-tight">doc_{id?.slice(0, 8)}...</h2>
                    </div>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Preview Stub */}
                    <div className="glass rounded-[2rem] aspect-[3/4] flex items-center justify-center bg-black/40 border-dashed border-white/5 relative group cursor-pointer overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end pb-12 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-sm font-bold uppercase tracking-widest mb-4">Click to view full resolution</span>
                            <div className="flex gap-4">
                                <button className="p-3 bg-cyan-500 rounded-full text-black"><ExternalLink size={20} /></button>
                                <button className="p-3 glass rounded-full"><Download size={20} /></button>
                            </div>
                        </div>
                        <FileText size={80} className="text-gray-800" />
                        <p className="absolute bottom-8 text-gray-600 font-mono text-[10px] uppercase">PREVIEWING: {id}</p>
                    </div>

                    {/* Metadata Panel */}
                    <div className="flex flex-col gap-6">
                        <section className="glass p-8 rounded-[2rem]">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center justify-between">
                                Core Metadata
                                <button className="p-1 hover:bg-white/5 rounded"><MoreHorizontal size={14} /></button>
                            </h3>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-cyan-400">
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Title</label>
                                        <input
                                            type="text"
                                            defaultValue="Q1-Draft-2026-02-24.pdf"
                                            className="bg-transparent font-bold text-lg outline-none focus:text-cyan-400 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-purple-400">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Document Date</label>
                                            <span className="font-bold">2026-02-24</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-emerald-400">
                                            <User size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Correspondent</label>
                                            <span className="font-bold">QiLabs Global HQ</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="glass p-8 rounded-[2rem]">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Tags & Classification</h3>
                            <div className="flex flex-wrap gap-2">
                                <div className="px-3 py-1.5 glass rounded-full text-xs font-bold border-l-4 border-cyan-500 flex items-center gap-2">
                                    <Tag size={12} /> INVOICE
                                </div>
                                <div className="px-3 py-1.5 glass rounded-full text-xs font-bold border-l-4 border-purple-500 flex items-center gap-2">
                                    <Tag size={12} /> FY2026
                                </div>
                                <button className="px-3 py-1.5 border border-dashed border-white/10 rounded-full text-xs font-bold text-gray-500 hover:border-white/30 hover:text-white transition-all">
                                    + ADD TAG
                                </button>
                            </div>
                        </section>

                        <div className="flex gap-4 mt-auto">
                            <button className="flex-grow py-4 bg-emerald-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors">
                                <CheckCircle2 size={18} /> Mark as Curated
                            </button>
                            <button className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors">
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
