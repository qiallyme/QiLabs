import React from 'react';
import { qiRegistry } from '@/qione/objects';
import DataTable from '@/ui/components/DataTable';
import { notFound } from 'next/navigation';
import { ChevronRight, Database, Settings, ArrowLeft, MoreHorizontal, Plus, Download, Upload, Filter, Calendar, Activity, ShieldCheck, Box } from 'lucide-react';
import Link from 'next/link';

export default async function ObjectPage({ params }: { params: Promise<{ objectKey: string }> }) {
    const { objectKey } = await params;
    const obj = qiRegistry[objectKey];

    if (!obj) notFound();

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col space-y-6">
                <Link
                    href="/"
                    className="group flex items-center space-x-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 tracking-[0.2em] transition-all mb-4 w-fit px-4 py-2 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-x-1"
                >
                    <ArrowLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Dashboard Registry</span>
                </Link>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                        <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl shadow-slate-900/20 ring-4 ring-slate-50">
                            <Database size={32} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">{obj.plural}</h1>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] leading-none flex items-center mb-1">
                                <span>Portal Object Registry</span>
                                <span className="mx-2 text-slate-200">/</span>
                                <span className="text-blue-500">{obj.key}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link href={`/objects/${obj.key}/contract`} className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-500/10 transition-all active:scale-95 group">
                            <ShieldCheck size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                        </Link>
                        <button className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:shadow-xl hover:shadow-slate-500/10 transition-all active:scale-95 group">
                            <Settings size={24} strokeWidth={2.5} className="group-hover:rotate-45 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-9">
                    <DataTable obj={obj} />
                </div>

                <div className="md:col-span-3 space-y-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col space-y-6">
                        <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-4">Available Actions</h3>
                        <div className="flex flex-col space-y-3">
                            {obj.forms.map(form => (
                                <Link
                                    key={form.key}
                                    href={`/objects/${obj.key}/forms/${form.key}`}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 hover:bg-blue-600 hover:text-white hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <Plus size={18} strokeWidth={3} className="text-blue-500 group-hover:text-white transition-colors" />
                                        <span className="text-xs font-black uppercase tracking-wider">{form.title}</span>
                                    </div>
                                    <ChevronRight size={16} strokeWidth={3} className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all" />
                                </Link>
                            ))}

                            <Link
                                href={`/objects/${obj.key}/csv/import`}
                                className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-500/10 transition-all group"
                            >
                                <div className="flex items-center space-x-4">
                                    <Upload size={18} strokeWidth={3} />
                                    <span className="text-xs font-black uppercase tracking-wider">Bulk Import</span>
                                </div>
                                <ArrowLeft size={16} strokeWidth={3} className="rotate-180 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all" />
                            </Link>

                            <button className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-500/10 transition-all group">
                                <div className="flex items-center space-x-4">
                                    <Download size={18} strokeWidth={3} />
                                    <span className="text-xs font-black uppercase tracking-wider">Export Data</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl shadow-slate-900/40 text-white flex flex-col space-y-6 relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-12 -mb-12 group-hover:scale-125 transition-transform duration-700" />

                        <h3 className="text-xs font-black uppercase text-slate-500 tracking-widest border-b border-white/10 pb-4">Object Health</h3>
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/30">
                                    <Activity size={20} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase text-white tracking-widest leading-none mb-1">Status</span>
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">Synced & Verified</span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center ring-1 ring-blue-500/30">
                                    <ShieldCheck size={20} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase text-white tracking-widest leading-none mb-1">Contract</span>
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">v1.1 Migration Active</span>
                                </div>
                            </div>
                        </div>

                        <Link href={`/objects/${obj.key}/contract`} className="pt-4 border-t border-white/10 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors tracking-widest flex items-center space-x-2 w-full justify-center">
                            <span>Inspect Metadata</span>
                            <ChevronRight size={12} strokeWidth={3} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
