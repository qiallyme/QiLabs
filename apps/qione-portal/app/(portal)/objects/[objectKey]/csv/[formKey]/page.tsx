'use client';

import React, { use } from 'react';
import { qiRegistry } from '@/qione/objects';
import { notFound } from 'next/navigation';
import { generateCsvHeaders, parseRows } from '@/qione/csv/csvParse';
import { validateRow, createZodFromObject } from '@/qione/csv/csvValidate';
import { FileUp, Download, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Table, ChevronRight, FileCode } from 'lucide-react';
import Link from 'next/link';

export default function CsvPage({ params }: { params: Promise<{ objectKey: string, formKey: string }> }) {
    const { objectKey, formKey } = use(params);
    const obj = qiRegistry[objectKey];
    const [file, setFile] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<any[]>([]);
    const [validating, setValidating] = React.useState(false);
    const [errors, setErrors] = React.useState<any[]>([]);

    if (!obj) notFound();

    const handleDownloadTemplate = () => {
        const headers = generateCsvHeaders(obj);
        const blob = new Blob([headers], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${obj.key}_template.csv`;
        a.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setValidating(true);

        const text = await f.text();
        const rows = parseRows(text).slice(0, 10); // Show first 10 for preview
        setPreview(rows);

        // Validate ALL rows
        const allRows = parseRows(text);
        const validationErrors: any[] = [];
        allRows.forEach((row, idx) => {
            const result = validateRow(obj, row);
            if (!result.success) {
                validationErrors.push({ row: idx + 1, errors: result.error.errors });
            }
        });

        setErrors(validationErrors);
        setValidating(false);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col space-y-6">
                <Link
                    href={`/objects/${objectKey}`}
                    className="group flex items-center space-x-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 tracking-[0.2em] transition-all mb-4 w-fit px-4 py-2 rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-x-1"
                >
                    <ArrowLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Object Registry</span>
                </Link>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5">
                        <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl shadow-slate-900/20 ring-4 ring-slate-50">
                            <FileUp size={32} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight"> registry: bulk-import </h1>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] leading-none flex items-center mb-1">
                                <span>Object Target</span>
                                <span className="mx-2 text-slate-200">/</span>
                                <span className="text-emerald-500">{obj.plural}</span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center space-x-3 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-500/10 transition-all active:scale-95 group font-black text-xs uppercase tracking-widest"
                    >
                        <Download size={18} strokeWidth={3} className="group-hover:-translate-y-1 transition-transform" />
                        <span>Get CSV Template</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-12">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-12 flex flex-col items-center justify-center space-y-8 min-h-[400px] group/upload relative overflow-hidden transition-all duration-700 hover:border-blue-400">
                        {!file ? (
                            <>
                                <div className="absolute top-0 left-0 w-full h-1 bg-slate-100" />
                                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 text-slate-300 flex items-center justify-center group-hover/upload:bg-blue-50 group-hover/upload:text-blue-600 group-hover/upload:scale-110 transition-all duration-500 ring-8 ring-transparent group-hover/upload:ring-blue-50/50">
                                    <FileUp size={48} strokeWidth={1} />
                                </div>
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Drop your CSV here</h2>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Or click to browse from your device</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </>
                        ) : (
                            <div className="w-full space-y-12 animate-in zoom-in-95 duration-500">
                                <div className="flex items-center justify-between pb-8 border-b border-slate-100 px-2">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10 flex items-center space-x-2">
                                            {validating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} strokeWidth={3} />}
                                            <span className="text-xs font-black uppercase tracking-widest leading-none"> File Loaded: {file.name} </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors"
                                    > Discard and Change File </button>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center space-x-3 px-2">
                                        <Table size={18} />
                                        <span>Data Preview (First 10 Rows)</span>
                                    </h3>

                                    <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-inner bg-slate-50/30">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50/80">
                                                <tr>
                                                    {obj.fields.map(f => (
                                                        <th key={f.key} className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">{f.label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {preview.map((row, idx) => (
                                                    <tr key={idx} className="border-b border-slate-50 last:border-none">
                                                        {obj.fields.map(f => (
                                                            <td key={f.key} className="px-6 py-4 text-xs font-bold text-slate-600">{row[f.label] || row[f.key]}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-10 border-t border-slate-100">
                                    <div className="flex items-center space-x-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Validation Status</span>
                                            {errors.length > 0 ? (
                                                <div className="flex items-center space-x-2 text-rose-500 font-black text-sm uppercase">
                                                    <AlertCircle size={16} strokeWidth={3} />
                                                    <span>{errors.length} Rows contain errors</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2 text-emerald-600 font-black text-sm uppercase">
                                                    <CheckCircle2 size={16} strokeWidth={3} />
                                                    <span>All rows verified</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        disabled={errors.length > 0 || validating}
                                        className="pl-8 pr-10 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale ring-8 ring-blue-500/5 group/btn flex items-center space-x-4"
                                    >
                                        <span>Initiate Migration</span>
                                        <ChevronRight size={18} strokeWidth={4} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {errors.length > 0 && (
                    <div className="md:col-span-12 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-rose-50/50 rounded-3xl border border-rose-100 p-8 space-y-6">
                            <h3 className="text-xs font-black uppercase text-rose-500 tracking-widest flex items-center space-x-3">
                                <AlertCircle size={18} />
                                <span>Detailed Error Log</span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {errors.slice(0, 6).map((err, i) => (
                                    <div key={i} className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col space-y-2">
                                        <span className="text-[10px] font-black text-rose-600 uppercase">Row #{err.row}</span>
                                        <div className="flex flex-col space-y-1">
                                            {err.errors.map((e: any, j: number) => (
                                                <span key={j} className="text-xs font-bold text-slate-600">
                                                    <span className="text-rose-500 mr-2">→</span> {e.path[0]}: {e.message}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {errors.length > 6 && <div className="p-4 flex items-center justify-center text-xs font-black uppercase text-slate-400">... and {errors.length - 6} more errors</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
