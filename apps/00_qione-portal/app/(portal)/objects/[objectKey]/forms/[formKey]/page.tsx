import React from 'react';
import { qiRegistry } from '@/qione/objects';
import FormRenderer from '@/ui/components/FormRenderer';
import { notFound } from 'next/navigation';
import { ArrowLeft, Box, ShieldCheck, ChevronRight, LayoutList, FormInput } from 'lucide-react';
import Link from 'next/link';

export default async function FormPage({ params }: { params: Promise<{ objectKey: string, formKey: string }> }) {
    const { objectKey, formKey } = await params;
    const obj = qiRegistry[objectKey];

    if (!obj) notFound();

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col space-y-6">
                <Link
                    href={`/objects/${objectKey}`}
                    className="group flex items-center space-x-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 tracking-[0.2em] transition-all mb-4 w-fit px-4 py-2 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-x-1"
                >
                    <ArrowLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to {obj.plural} List</span>
                </Link>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                        <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl shadow-slate-900/20 ring-4 ring-slate-50">
                            <FormInput size={32} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight"> registry: {obj.key} </h1>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] leading-none flex items-center mb-1">
                                <span>Component: Form Runner</span>
                                <span className="mx-2 text-slate-200">/</span>
                                <span className="text-blue-500">{formKey}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link href={`/objects/${obj.key}/contract`} className="p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-500/10 transition-all active:scale-95 group">
                            <ShieldCheck size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-8">
                    <FormRenderer obj={obj} formKey={formKey} />
                </div>

                <div className="md:col-span-4 space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl shadow-slate-900/30 text-white flex flex-col space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000" />

                        <div className="flex flex-col space-y-4 relative">
                            <div className="flex items-center space-x-3 text-blue-400">
                                <LayoutList size={20} strokeWidth={3} />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none"> Registry: Mapping Logic </span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight leading-tight uppercase italic opacity-90 italic"> Form Contract </h3>
                            <p className="text-sm font-bold text-slate-400 tracking-wide opacity-80 mt-2 leading-relaxed">
                                This form is dynamically mapped to the <code className="text-slate-200 bg-white/10 px-2 py-0.5 rounded text-xs">qione.{obj.table}</code> table.
                                Submissions will pass through the form runner logic for validation before persistence.
                            </p>
                        </div>

                        <div className="space-y-4 relative">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col space-y-2">
                                <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                    <span>Persistence Layer</span>
                                </div>
                                <span className="text-sm font-black text-white italic opacity-70 italic tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">Supabase RPC: rpc_{obj.table}_submit</span>
                            </div>

                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col space-y-2">
                                <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                    <span>Schema Integration</span>
                                </div>
                                <span className="text-sm font-black text-white italic opacity-70 italic tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">Type: pg_catalog.jsonb</span>
                            </div>
                        </div>

                        <Link href={`/objects/${obj.key}/contract`} className="flex items-center space-x-2 text-[10px] font-black uppercase text-blue-500 hover:text-white transition-colors tracking-widest w-full justify-center pt-8 border-t border-white/10 mt-4 group">
                            <span>Inspect SQL Migrations</span>
                            <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
