'use client';

import React from 'react';
import { QiField } from '@/qione/objects/types';
import { clsx } from 'clsx';
import { Calendar, Type, Hash, CheckSquare, ChevronDown, AtSign, Phone } from 'lucide-react';

interface FieldRendererProps {
    field: QiField;
    defaultValue?: any;
}

export default function FieldRenderer({ field, defaultValue }: FieldRendererProps) {
    const Icon = React.useMemo(() => {
        if (field.key.includes('email')) return AtSign;
        if (field.key.includes('phone')) return Phone;
        if (field.type === 'date') return Calendar;
        if (field.type === 'number') return Hash;
        if (field.type === 'boolean') return CheckSquare;
        return Type;
    }, [field]);

    return (
        <div className="flex flex-col space-y-2 group/field transition-transform duration-300">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] group-focus-within/field:text-blue-600 transition-colors">
                    {field.label}
                    {field.required && <span className="ml-1 text-rose-500 font-black animate-pulse">*</span>}
                </label>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest opacity-0 group-hover/field:opacity-100 transition-opacity">type: {field.type}</span>
            </div>

            <div className="relative group/input shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden rounded-2xl border-2 border-slate-100 bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:shadow-xl focus-within:shadow-blue-500/10">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-500 transition-colors pointer-events-none">
                    <Icon size={18} strokeWidth={2.5} />
                </div>

                {field.type === 'select' ? (
                    <div className="relative">
                        <select
                            defaultValue={defaultValue}
                            required={field.required}
                            className="w-full pl-12 pr-12 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-slate-900 appearance-none cursor-pointer"
                        >
                            <option value="">Select {field.label}...</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-500 transition-colors pointer-events-none">
                            <ChevronDown size={18} strokeWidth={2.5} />
                        </div>
                    </div>
                ) : (
                    <input
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        defaultValue={defaultValue}
                        required={field.required}
                        autoComplete="off"
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        className="w-full pl-12 pr-6 py-3.5 bg-transparent border-none outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                    />
                )}
            </div>

            {field.required && (
                <div className="text-[9px] font-bold text-blue-500/50 uppercase tracking-widest text-right px-2 mt-1 hidden group-focus-within/field:block animate-in fade-in slide-in-from-top-1">
                    Required Field
                </div>
            )}
        </div>
    );
}
