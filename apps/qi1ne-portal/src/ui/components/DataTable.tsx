'use client';

import React from 'react';
import { QiObject, QiView } from '@/qione/objects/types';
import { clsx } from 'clsx';
import { ChevronRight, Filter, MoreHorizontal, Download, Upload, Plus } from 'lucide-react';
import Link from 'next/link';

interface DataTableProps {
    obj: QiObject;
    view?: QiView;
}

export default function DataTable({ obj, view }: DataTableProps) {
    const activeView = view || obj.views[0];
    const columns = activeView ? activeView.columns : obj.fields.map(f => f.key);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col group/table transition-all duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm sticky top-0 z-[5]">
                <div className="flex flex-col">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center group-hover/table:text-blue-700 transition-colors">
                        {activeView?.title || obj.plural}
                        <span className="ml-3 text-[11px] font-black uppercase text-blue-100 bg-blue-600 px-2 py-0.5 rounded-full shadow-lg shadow-blue-500/20 ring-1 ring-blue-700/10">live</span>
                    </h2>
                    <span className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-widest leading-none"> registry: {obj.key} </span>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all active:scale-95 duration-200">
                        <Filter size={18} />
                    </button>
                    <Link href={`/objects/${obj.key}/csv/import`} className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all active:scale-95 duration-200 flex items-center space-x-2">
                        <Upload size={18} />
                        <span className="text-xs font-bold uppercase tracking-wide">Import</span>
                    </Link>
                    <button className="pl-4 pr-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/30 font-black text-sm uppercase tracking-wider flex items-center space-x-3 transition-all active:scale-95 ring-2 ring-blue-400/20">
                        <Plus size={18} strokeWidth={3} />
                        <span>Create {obj.label}</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-slate-50/80 sticky top-14 z-[4]">
                        <tr>
                            {columns.map(colKey => {
                                const field = obj.fields.find(f => f.key === colKey);
                                return (
                                    <th key={colKey} className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100 bg-slate-50/30">
                                        <div className="flex items-center space-x-2">
                                            <span>{field?.label || colKey}</span>
                                            <ChevronRight size={12} className="opacity-20" />
                                        </div>
                                    </th>
                                );
                            })}
                            <th className="w-20 px-6 py-4 border-b border-slate-100 bg-slate-50/30" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60">
                        {/* Mock Rows */}
                        {[1, 2, 3, 4, 5].map((idx) => (
                            <tr key={idx} className="group hover:bg-blue-50/30 transition-all duration-300">
                                {columns.map(colKey => (
                                    <td key={colKey} className="px-6 py-5 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
                                        <span className="truncate block">
                                            {colKey === 'status' ? (
                                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider ring-1 ring-emerald-600/10">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    <span>Active</span>
                                                </span>
                                            ) : (
                                                `Sample Data ${idx}`
                                            )}
                                        </span>
                                    </td>
                                ))}
                                <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-all">
                                    <button className="p-2 rounded-lg hover:bg-white hover:shadow-md text-slate-400 hover:text-blue-600 transition-all active:scale-90 border border-transparent hover:border-slate-100">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-widest px-8">
                <div className="flex items-center space-x-2">
                    <span>Showing 5 of 42 results</span>
                </div>
                <div className="flex items-center space-x-1">
                    <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:text-blue-600 transition-colors font-black">1</button>
                    <button className="px-3 py-1.5 rounded-lg border border-transparent hover:bg-white hover:border-slate-100 transition-colors">2</button>
                    <button className="px-3 py-1.5 rounded-lg border border-transparent hover:bg-white hover:border-slate-100 transition-colors">3</button>
                </div>
            </div>
        </div>
    );
}
