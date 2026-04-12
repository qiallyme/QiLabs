'use client';

import React from 'react';
import { QiObject, qiRegistry } from '@/qione/objects';
import { deriveContract } from '@/qione/contracts/deriveContract';
import Link from 'next/link';
import { ChevronRight, Database, Layers, ArrowUpRight, Plus, ExternalLink, Activity, Users, Box, Terminal, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
    const objects = Object.values(qiRegistry) as QiObject[];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl shadow-slate-900/20 ring-4 ring-slate-100 ring-offset-0">
                        <Box size={24} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none"> Registry Dashboard </h1>
                        <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none flex items-center space-x-2">
                            <span>QiOne v1.1 Control Center</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-blue-500">Live Workspace</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Records', value: '1,248', delta: '+12%', icon: Database, color: 'blue' },
                    { label: 'Active Users', value: '84', delta: '+3', icon: Users, color: 'emerald' },
                    { label: 'Active Tasks', value: '12', delta: '-2', icon: Activity, color: 'amber' },
                    { label: 'Schema Version', value: 'v1.1.2', delta: 'STABLE', icon: Layers, color: 'slate' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-500 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 ring-1 ring-${stat.color}-600/10 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                <stat.icon size={20} strokeWidth={2.5} />
                            </div>
                            <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-${stat.color === 'emerald' ? 'emerald' : stat.color === 'amber' ? 'amber' : 'slate'}-50 text-${stat.color === 'emerald' ? 'emerald' : stat.color === 'amber' ? 'amber' : 'slate'}-600`}>
                                {stat.delta}
                            </div>
                        </div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{stat.value}</div>
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-amber-50 rounded-3xl border border-amber-200 p-8 flex items-center justify-between group overflow-hidden relative shadow-lg shadow-amber-500/5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                <div className="flex items-center space-x-6 relative">
                    <div className="p-4 rounded-2xl bg-amber-600 text-white shadow-xl shadow-amber-700/20 animate-pulse">
                        <Terminal size={24} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-lg font-black text-amber-900 tracking-tight">Pending Infrastructure Contracts</h3>
                        <p className="text-xs font-bold text-amber-700 mt-1 uppercase tracking-widest">
                            {objects.length} Objects have generated new SQL migrations. Sync to Supabase.
                        </p>
                    </div>
                </div>
                {objects.length > 0 && (
                    <Link href={`/objects/${objects[0].key}/contract`} className="relative pl-6 pr-8 py-3 rounded-xl bg-amber-900 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-900/10 hover:bg-black transition-all active:scale-95 flex items-center space-x-3">
                        <span>Inspect All Contracts</span>
                        <ChevronRight size={14} strokeWidth={3} />
                    </Link>
                )}
            </div>

            <div className="flex flex-col space-y-6 mt-12">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
                        <Layers size={20} className="text-blue-600" />
                        <span>Registered Multi-tenant Objects</span>
                    </h2>
                    <Link href="/admin/schema" className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 tracking-[0.3em] flex items-center space-x-2 transition-colors">
                        <span>View Source Code</span>
                        <ArrowUpRight size={14} strokeWidth={3} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {objects.map((obj) => (
                        <div key={obj.key} className="bg-white p-8 rounded-[2rem] border-2 border-slate-100/80 shadow-2xl shadow-slate-200/50 hover:border-blue-200 hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-50 transition-colors duration-500" />

                            <div className="relative flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center space-x-5">
                                        <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 group-hover:bg-blue-600 transition-colors duration-300">
                                            <Database size={24} strokeWidth={2.5} />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-blue-700 transition-colors">{obj.plural}</h3>
                                            <p className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest leading-none flex items-center space-x-2">
                                                <span>table: {obj.table}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span>fields: {obj.fields.length}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Link href={`/objects/${obj.key}`} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 active:scale-90 border-2 border-transparent hover:border-blue-100">
                                        <ChevronRight size={24} strokeWidth={3} />
                                    </Link>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-10 overflow-hidden h-6">
                                    {obj.fields.slice(0, 4).map(f => (
                                        <span key={f.key} className="text-[9px] font-black uppercase text-slate-400 border border-slate-100 px-3 py-1.5 rounded-xl bg-slate-50/50 tracking-widest whitespace-nowrap">{f.label}</span>
                                    ))}
                                    {obj.fields.length > 4 && <span className="text-[9px] font-black uppercase text-slate-300 px-2 py-1.5 h-6 leading-none flex items-center">+{obj.fields.length - 4} more</span>}
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center space-x-1">
                                        {obj.forms.map(f => (
                                            <Link key={f.key} href={`/objects/${obj.key}/forms/${f.key}`} className="text-[9px] font-black uppercase text-slate-500 hover:text-blue-600 bg-slate-50 px-3 py-2 rounded-xl border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-md transition-all">
                                                {f.key.replace(/-/g, ' ')}
                                            </Link>
                                        ))}
                                    </div>
                                    <Link href={`/objects/${obj.key}/contract`} className="flex items-center space-x-2 text-[9px] font-black uppercase text-blue-600 hover:text-blue-700 tracking-widest whitespace-nowrap pl-4 border-l border-slate-100 ml-4 group-hover/btn:translate-x-1 transition-transform">
                                        <span>Contract</span>
                                        <ArrowUpRight size={12} strokeWidth={3} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="group border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center justify-center space-y-4 hover:border-blue-300 hover:bg-blue-50/20 transition-all duration-500 cursor-pointer">
                        <div className="p-6 rounded-[2rem] bg-slate-50 text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all group-hover:scale-110 duration-500">
                            <Plus size={48} strokeWidth={1} />
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-black text-slate-400 group-hover:text-blue-900 transition-colors uppercase tracking-widest">New Object Type</div>
                            <p className="text-xs font-bold text-slate-300 mt-1 uppercase tracking-widest">Extend the Registry</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
