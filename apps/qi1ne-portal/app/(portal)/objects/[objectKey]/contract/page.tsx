'use client';

import React, { use } from 'react';
import { qiRegistry } from '@/qione/objects';
import { deriveContract } from '@/qione/contracts/deriveContract';
import { notFound } from 'next/navigation';
import { ShieldCheck, ArrowLeft, Database, Terminal, Settings, ChevronRight, Copy, Check, Info, FileCode, Layers } from 'lucide-react';
import Link from 'next/link';

export default function ContractPage({ params }: { params: Promise<{ objectKey: string }> }) {
  const { objectKey } = use(params);
  const obj = qiRegistry[objectKey];
  const [copied, setCopied] = React.useState(false);

  if (!obj) notFound();

  const contract = deriveContract(obj);

  const handleCopy = () => {
    navigator.clipboard.writeText(contract.migrationSuggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col space-y-6">
        <Link 
          href={`/objects/${objectKey}`} 
          className="group flex items-center space-x-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 tracking-[0.2em] transition-all mb-4 w-fit px-4 py-2 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-x-1"
        >
          <ArrowLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to {obj.plural} Registry</span>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl shadow-slate-900/20 ring-4 ring-slate-50">
               <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight"> registry: {obj.key} </h1>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] leading-none flex items-center mb-1"> 
                <span>Contract Interface</span> 
                <span className="mx-2 text-slate-200">/</span> 
                <span className="text-emerald-500">Migration Generator</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-8 space-y-10">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-10 flex flex-col space-y-8 group/contract overflow-hidden">
              <div className="flex items-center justify-between pb-8 border-b border-slate-100">
                 <div className="flex flex-col">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-3">
                      <Terminal size={20} className="text-blue-600" />
                      <span>Proposed SQL Migration</span>
                   </h2>
                   <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none"> registry: {obj.key} </p>
                 </div>
                 
                 <button 
                   onClick={handleCopy}
                   className="flex items-center space-x-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-xl hover:shadow-slate-500/30 transition-all duration-300 font-bold text-xs uppercase tracking-widest active:scale-95 group"
                 >
                   {copied ? <Check size={16} strokeWidth={3} className="text-emerald-500" /> : <Copy size={16} strokeWidth={3} className="text-slate-400 group-hover:text-blue-400" />}
                   <span>{copied ? 'Copied to Clipboard' : 'Copy SQL Output'}</span>
                 </button>
              </div>

              <div className="relative group/code">
                 <div className="absolute top-4 right-4 text-[9px] font-black uppercase text-slate-400 tracking-widest bg-slate-900/5 px-3 py-1.5 rounded-xl border border-slate-900/10 backdrop-blur-sm group-hover/code:bg-slate-900/10 transition-colors">SQL / PLPGSQL</div>
                 <pre className="bg-slate-50 p-10 rounded-[2rem] border-2 border-slate-100/80 overflow-x-auto text-sm font-semibold text-slate-600 leading-relaxed shadow-inner">
                   <code>{contract.migrationSuggestion}</code>
                 </pre>
                 
                 <div className="mt-8 flex items-center space-x-4 bg-emerald-50 p-6 rounded-2xl border border-emerald-100/50 text-emerald-800 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <Info size={24} strokeWidth={2.5} className="text-emerald-500 shrink-0" />
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Migration Advice</span>
                       <p className="text-sm font-bold opacity-80 leading-relaxed"> Apply this migration to your <span className="text-emerald-600 underline decoration-2 underline-offset-4">Supabase Dashboard</span> to sync the database schema with this registry config. </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="md:col-span-4 space-y-8">
           <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-slate-900/40 text-white flex flex-col space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />
              
              <div className="flex flex-col space-y-4 relative">
                 <div className="flex items-center space-x-3 text-blue-400">
                    <Layers size={22} strokeWidth={3} />
                    <span className="text-[11px] font-black uppercase tracking-widest leading-none"> Contract Verification </span>
                 </div>
                 <h3 className="text-3xl font-black tracking-tighter leading-tight italic italic"> Contract Integrity </h3>
                 <p className="text-sm font-bold text-slate-400 tracking-wide opacity-80 mt-2 leading-relaxed italic">
                   The Registry uses this contract to ensure the UI remains in sync with the physical database schema.
                 </p>
              </div>

              <div className="space-y-6 relative">
                 {[
                    { label: 'Object Key', value: obj.key, icon: Database },
                    { label: 'Registry Sync', value: 'v1.1.2-alpha', icon: ShieldCheck },
                    { label: 'DB Schema', value: 'qione (Multi-tenant)', icon: Layers },
                    { label: 'View Count', value: obj.views.length, icon: FileCode },
                 ].map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-6 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group/item">
                       <div className="w-12 h-12 rounded-2xl bg-white/5 text-slate-400 group-hover/item:text-blue-400 group-hover/item:bg-white/10 transition-all flex items-center justify-center border border-white/5 ring-1 ring-white/10">
                          <item.icon size={20} strokeWidth={2.5} />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1">{item.label}</span>
                          <span className="text-sm font-black text-white italic tracking-wider">{item.value}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
