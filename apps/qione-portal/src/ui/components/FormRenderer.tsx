'use client';

import React from 'react';
import { QiObject, QiForm } from '@/qione/objects/types';
import FieldRenderer from './FieldRenderer';
import { Loader2, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { clsx } from 'clsx';

interface FormRendererProps {
    obj: QiObject;
    formKey: string;
    initialData?: any;
}

export default function FormRenderer({ obj, formKey, initialData = {} }: FormRendererProps) {
    const form = obj.forms.find(f => f.key === formKey);
    const [loading, setLoading] = React.useState(false);
    const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

    if (!form) return <div className="p-12 text-center text-rose-500 font-black uppercase tracking-tighter bg-rose-50 rounded-3xl border-2 border-dashed border-rose-200 animate-pulse">Form not found in registry: {formKey}</div>;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        // Simulate API call to /api/rpc/form-submit
        setTimeout(() => {
            setLoading(false);
            setStatus('success');
        }, 1500);
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-8 flex flex-col group/form overflow-hidden group-hover/form:border-blue-300 transition-all duration-500">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <div className="flex flex-col">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center group-hover/form:text-blue-700 transition-colors">
                        {form.title}
                        <span className="ml-4 text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">config: {form.key}</span>
                    </h3>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none"> object: {obj.label} </p>
                </div>
                {status === 'success' && (
                    <div className="flex items-center space-x-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-right-4 duration-500">
                        <CheckCircle2 size={16} strokeWidth={3} />
                        <span>Record Saved Successfully</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    {form.fields.map(fieldKey => {
                        const field = obj.fields.find(f => f.key === fieldKey);
                        if (!field) return null;
                        return (
                            <FieldRenderer
                                key={fieldKey}
                                field={field}
                                defaultValue={initialData[fieldKey]}
                            />
                        );
                    })}
                </div>

                <div className="pt-10 border-t border-slate-100 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setStatus('idle')}
                        className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors px-6 py-3 rounded-xl hover:bg-rose-50/50"
                    >
                        Discard Changes
                    </button>

                    <button
                        disabled={loading}
                        className={clsx(
                            "pl-6 pr-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center space-x-4 transition-all active:scale-95 ring-4",
                            status === 'success' ? "bg-emerald-600 text-white ring-emerald-500/20 shadow-xl shadow-emerald-500/30" : "bg-blue-600 text-white ring-blue-500/20 shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/40"
                        )}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" strokeWidth={3} /> : (status === 'success' ? <CheckCircle2 size={18} strokeWidth={3} /> : <Save size={18} strokeWidth={3} />)}
                        <span>{loading ? 'Processing...' : (status === 'success' ? 'Saved!' : `Save ${obj.label}`)}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
