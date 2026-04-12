'use client';

import React, { useState, useEffect } from 'react';
import {
    Search, X, Plus, Calendar, Tag, Flag,
    CheckCircle, Edit3, MessageSquare, Briefcase, FileText,
    Phone, DollarSign, Lightbulb, GitMerge
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type EntryType = 'note' | 'task' | 'event' | 'document' | 'call' | 'payment' | 'idea' | 'decision';
export type EntryState = 'draft' | 'planned' | 'active' | 'done' | 'cancelled' | 'paused';

export interface Entry {
    id: string;
    entry_type: EntryType;
    title: string;
    body?: string | null;
    occurred_at: string;
    planned_for?: string | null;
    is_active: boolean;
    state: EntryState;
    needs_review: boolean;
    meta_std?: Record<string, any> | null;
    meta_ext?: {
        tags?: string[] | null;
        contexts?: string[] | null;
    } | null;
    created_at: string;
    updated_at: string;
}

interface FilterParams {
    search: string;
    types: EntryType[];
    state: EntryState | '';
    isActiveOnly: boolean;
    needsReviewOnly: boolean;
    dateFrom: string;
    dateTo: string;
}

// ============================================================================
// API LAYER (Calls to /api/qichronicle/moments)
// ============================================================================

const api = {
    getEntries: async (filters: FilterParams): Promise<Entry[]> => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.types.length) params.append('types', filters.types.join(','));
        if (filters.state) params.append('state', filters.state);
        if (filters.isActiveOnly) params.append('isActiveOnly', 'true');
        if (filters.needsReviewOnly) params.append('needsReviewOnly', 'true');
        if (filters.dateFrom) params.append('dateFrom', new Date(filters.dateFrom).toISOString());
        if (filters.dateTo) params.append('dateTo', new Date(filters.dateTo).toISOString());

        const res = await fetch(`/api/qichronicle/moments?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch moments');
        return res.json();
    },

    createEntry: async (entryData: Partial<Entry>): Promise<Entry> => {
        const res = await fetch('/api/qichronicle/moments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData)
        });
        if (!res.ok) throw new Error('Failed to create moment');
        return res.json();
    },

    updateEntry: async (id: string, entryData: Partial<Entry>): Promise<Entry> => {
        const res = await fetch(`/api/qichronicle/moments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData)
        });
        if (!res.ok) throw new Error('Failed to update moment');
        return res.json();
    }
};

// ============================================================================
// UTILITIES & CONSTANTS
// ============================================================================

const ENTRY_TYPES: EntryType[] = ['note', 'task', 'event', 'document', 'call', 'payment', 'idea', 'decision'];
const ENTRY_STATES: EntryState[] = ['draft', 'planned', 'active', 'done', 'cancelled', 'paused'];

/**
 * Ensures we only send valid fields to the DB and prevents tampering
 * with generated fields like id, created_at, updated_at.
 */
const sanitizePayload = (body: any) => ({
    entry_type: body.entry_type,
    title: body.title,
    body: body.body ?? null,
    occurred_at: body.occurred_at,
    planned_for: body.planned_for ?? null,
    is_active: !!body.is_active,
    state: body.state,
    needs_review: !!body.needs_review,
    meta_std: body.meta_std ?? {},
    meta_ext: {
        tags: Array.isArray(body?.meta_ext?.tags) ? body.meta_ext.tags : [],
        contexts: Array.isArray(body?.meta_ext?.contexts) ? body.meta_ext.contexts : [],
    },
});

const getTypeIcon = (type: EntryType) => {
    switch (type) {
        case 'note': return <FileText className="w-4 h-4" />;
        case 'task': return <CheckCircle className="w-4 h-4" />;
        case 'event': return <Calendar className="w-4 h-4" />;
        case 'document': return <FileText className="w-4 h-4" />;
        case 'call': return <Phone className="w-4 h-4" />;
        case 'payment': return <DollarSign className="w-4 h-4" />;
        case 'idea': return <Lightbulb className="w-4 h-4" />;
        case 'decision': return <GitMerge className="w-4 h-4" />;
        default: return <MessageSquare className="w-4 h-4" />;
    }
};

const getTypeColor = (type: EntryType) => {
    const colors: Record<EntryType, string> = {
        note: 'bg-blue-100 text-blue-800 border-blue-200',
        task: 'bg-green-100 text-green-800 border-green-200',
        event: 'bg-purple-100 text-purple-800 border-purple-200',
        document: 'bg-gray-100 text-gray-800 border-gray-200',
        call: 'bg-pink-100 text-pink-800 border-pink-200',
        payment: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        idea: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        decision: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// "Good enough v1" local datetime formatting hack
const formatDateLocal = (isoString?: string | null) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

// ============================================================================
// COMPONENTS
// ============================================================================

export default function QiChroniclePage() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [filters, setFilters] = useState<FilterParams>({
        search: '',
        types: [],
        state: '',
        isActiveOnly: true,
        needsReviewOnly: false,
        dateFrom: '',
        dateTo: ''
    });

    // Drawer State
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

    const loadEntries = async () => {
        setIsLoading(true);
        try {
            const data = await api.getEntries(filters);
            setEntries(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadEntries();
    }, [filters]);

    const handleCreate = async (entryData: Partial<Entry>) => {
        const payload = sanitizePayload(entryData);
        await api.createEntry(payload as Entry);
        loadEntries();
    };

    const handleUpdate = async (id: string, entryData: Partial<Entry>) => {
        const payload = sanitizePayload(entryData);
        await api.updateEntry(id, payload);
        setDrawerOpen(false);
        setEditingEntry(null);
        loadEntries();
    };

    const openEditDrawer = (entry: Entry) => {
        setEditingEntry(entry);
        setDrawerOpen(true);
    };

    return (
        <div className="flex flex-col gap-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">QiChronicle</h1>
                    <p className="text-slate-500 mt-1">Fast capture & timeline review</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4">
                    <div className="sticky top-8">
                        <QuickCaptureForm onSubmit={handleCreate} />
                    </div>
                </div>

                <div className="lg:col-span-8 flex flex-col gap-6">
                    <TimelineFilters filters={filters} setFilters={setFilters} />

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        {isLoading ? (
                            <div className="p-12 text-center text-slate-500">Loading timeline...</div>
                        ) : entries.length === 0 ? (
                            <div className="p-12 text-center text-slate-500">No entries found matching criteria.</div>
                        ) : (
                            <div className="relative p-6">
                                <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-200"></div>
                                <div className="space-y-8">
                                    {entries.map(entry => (
                                        <TimelineListRow
                                            key={entry.id}
                                            entry={entry}
                                            onClick={() => openEditDrawer(entry)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <EntryDrawer
                isOpen={drawerOpen}
                entry={editingEntry}
                onClose={() => { setDrawerOpen(false); setEditingEntry(null); }}
                onSave={handleUpdate}
            />
        </div>
    );
}

// ----------------------------------------------------------------------------
// Quick Capture Form Component
// ----------------------------------------------------------------------------
function QuickCaptureForm({ onSubmit }: { onSubmit: (data: Partial<Entry>) => Promise<void> }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        entry_type: 'note' as EntryType,
        title: '',
        body: '',
        occurred_at: formatDateLocal(new Date().toISOString()),
        planned_for: '',
        state: 'draft' as EntryState,
        is_active: true,
        needs_review: false,
        tagsStr: '',
        contextsStr: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        setIsSubmitting(true);
        const occurredISO = formData.occurred_at
            ? new Date(formData.occurred_at).toISOString()
            : new Date().toISOString();

        const payload: Partial<Entry> = {
            entry_type: formData.entry_type,
            title: formData.title,
            body: formData.body || null,
            occurred_at: occurredISO,
            planned_for: formData.planned_for ? new Date(formData.planned_for).toISOString() : null,
            state: formData.state,
            is_active: formData.is_active,
            needs_review: formData.needs_review,
            meta_ext: {
                tags: formData.tagsStr.split(',').map(s => s.trim()).filter(Boolean),
                contexts: formData.contextsStr.split(',').map(s => s.trim()).filter(Boolean)
            }
        };

        await onSubmit(payload);

        // Reset most fields but keep useful defaults
        setFormData(prev => ({
            ...prev,
            title: '',
            body: '',
            occurred_at: formatDateLocal(new Date().toISOString()),
            planned_for: '',
            tagsStr: '',
            contextsStr: ''
        }));
        setIsSubmitting(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-500" />
                    Quick Capture
                </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">

                {/* Type & State row */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                        <select
                            value={formData.entry_type}
                            onChange={e => setFormData({ ...formData, entry_type: e.target.value as EntryType })}
                            className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border outline-none"
                        >
                            {ENTRY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
                        <select
                            value={formData.state}
                            onChange={e => setFormData({ ...formData, state: e.target.value as EntryState })}
                            className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border outline-none"
                        >
                            {ENTRY_STATES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </select>
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
                    <input
                        type="text"
                        required
                        placeholder="What happened?"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border outline-none"
                    />
                </div>

                {/* Body */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Details</label>
                    <textarea
                        rows={3}
                        placeholder="Add some context..."
                        value={formData.body}
                        onChange={e => setFormData({ ...formData, body: e.target.value })}
                        className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border outline-none resize-none"
                    />
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Occurred At</label>
                        <input
                            type="datetime-local"
                            value={formData.occurred_at}
                            onChange={e => setFormData({ ...formData, occurred_at: e.target.value })}
                            className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Planned For (Opt)</label>
                        <input
                            type="datetime-local"
                            value={formData.planned_for}
                            onChange={e => setFormData({ ...formData, planned_for: e.target.value })}
                            className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border outline-none"
                        />
                    </div>
                </div>

                {/* Tags & Contexts */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tags (comma separated)</label>
                    <input
                        type="text"
                        placeholder="urgent, frontend, client-x"
                        value={formData.tagsStr}
                        onChange={e => setFormData({ ...formData, tagsStr: e.target.value })}
                        className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border outline-none mb-3"
                    />
                    <label className="block text-xs font-medium text-slate-600 mb-1">Contexts (comma separated)</label>
                    <input
                        type="text"
                        placeholder="sprint-42, project-phoenix"
                        value={formData.contextsStr}
                        onChange={e => setFormData({ ...formData, contextsStr: e.target.value })}
                        className="w-full text-sm rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border outline-none"
                    />
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        Active
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={formData.needs_review}
                            onChange={e => setFormData({ ...formData, needs_review: e.target.checked })}
                            className="rounded text-red-500 focus:ring-red-500 w-4 h-4"
                        />
                        <Flag className="w-4 h-4 text-red-500" /> Needs Review
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : 'Save Entry'}
                </button>
            </form>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Timeline Filters Component
// ----------------------------------------------------------------------------
function TimelineFilters({ filters, setFilters }: { filters: FilterParams, setFilters: React.Dispatch<React.SetStateAction<FilterParams>> }) {

    const toggleType = (type: EntryType) => {
        setFilters(prev => ({
            ...prev,
            types: prev.types.includes(type) ? prev.types.filter(t => t !== type) : [...prev.types, type]
        }));
    };

    return (
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
            {/* Top row: Search & Status Toggles */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search timeline..."
                        value={filters.search}
                        onChange={e => setFilters({ ...filters, search: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                            type="checkbox"
                            checked={filters.isActiveOnly}
                            onChange={e => setFilters({ ...filters, isActiveOnly: e.target.checked })}
                            className="rounded text-indigo-600 w-4 h-4"
                        /> Active Only
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                        <input
                            type="checkbox"
                            checked={filters.needsReviewOnly}
                            onChange={e => setFilters({ ...filters, needsReviewOnly: e.target.checked })}
                            className="rounded text-red-600 w-4 h-4"
                        /> Needs Review Only
                    </label>
                </div>
            </div>

            <div className="h-px w-full bg-slate-100"></div>

            {/* Second row: Types Multi-select & Date Range */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Filter by Type</label>
                    <div className="flex flex-wrap gap-2">
                        {ENTRY_TYPES.map(t => {
                            const active = filters.types.includes(t);
                            return (
                                <button
                                    key={t}
                                    onClick={() => toggleType(t)}
                                    className={`px-3 py-1 text-xs rounded-full border transition-colors flex items-center gap-1.5
                    ${active ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {getTypeIcon(t)}
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">State</label>
                        <select
                            value={filters.state}
                            onChange={e => setFilters({ ...filters, state: e.target.value as EntryState | '' })}
                            className="text-sm rounded-lg border-slate-300 py-1.5 px-3 border outline-none"
                        >
                            <option value="">Any State</option>
                            {ENTRY_STATES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">From</label>
                        <input
                            type="datetime-local"
                            value={filters.dateFrom}
                            onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                            className="text-sm rounded-lg border-slate-300 py-1.5 px-3 border outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">To</label>
                        <input
                            type="datetime-local"
                            value={filters.dateTo}
                            onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                            className="text-sm rounded-lg border-slate-300 py-1.5 px-3 border outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Timeline List Row Component
// ----------------------------------------------------------------------------
function TimelineListRow({ entry, onClick }: { entry: Entry, onClick: () => void }) {
    const dateObj = new Date(entry.occurred_at);
    const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="relative flex gap-6 group cursor-pointer" onClick={onClick}>
            {/* Node / Icon */}
            <div className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${getTypeColor(entry.entry_type)} shadow-sm bg-white`}>
                    {getTypeIcon(entry.entry_type)}
                </div>
            </div>

            {/* Content Card */}
            <div className="flex-1 pb-4 group-hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-500 w-28 shrink-0">{dateStr} {timeStr}</span>
                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{entry.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {entry.needs_review && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                                <Flag className="w-3 h-3" /> Review
                            </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                            {entry.state}
                        </span>
                    </div>
                </div>

                {entry.body && (
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed ml-11 sm:ml-0">
                        {entry.body}
                    </p>
                )}

                {/* Tags */}
                {entry.meta_ext && ((entry.meta_ext.tags?.length ?? 0) > 0 || (entry.meta_ext.contexts?.length ?? 0) > 0) && (
                    <div className="flex flex-wrap gap-2 mt-3 ml-11 sm:ml-0">
                        {entry.meta_ext.contexts?.map(ctx => (
                            <span key={ctx} className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                <Briefcase className="w-3 h-3" /> {ctx}
                            </span>
                        ))}
                        {entry.meta_ext.tags?.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                <Tag className="w-3 h-3" /> {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// Edit Drawer Component
// ----------------------------------------------------------------------------
function EntryDrawer({ isOpen, entry, onClose, onSave }: {
    isOpen: boolean,
    entry: Entry | null,
    onClose: () => void,
    onSave: (id: string, data: Partial<Entry>) => Promise<void>
}) {
    const [formData, setFormData] = useState<Partial<Entry>>({});
    const [tagsStr, setTagsStr] = useState('');
    const [contextsStr, setContextsStr] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (entry && isOpen) {
            setFormData({
                entry_type: entry.entry_type,
                title: entry.title,
                body: entry.body || '',
                occurred_at: formatDateLocal(entry.occurred_at),
                planned_for: formatDateLocal(entry.planned_for),
                state: entry.state,
                is_active: entry.is_active,
                needs_review: entry.needs_review,
            });
            setTagsStr(entry.meta_ext?.tags?.join(', ') || '');
            setContextsStr(entry.meta_ext?.contexts?.join(', ') || '');
        }
    }, [entry, isOpen]);

    if (!isOpen || !entry) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const occurredISO = formData.occurred_at
            ? new Date(formData.occurred_at).toISOString()
            : new Date().toISOString();

        const payload: Partial<Entry> = {
            ...formData,
            body: formData.body || null,
            occurred_at: occurredISO,
            planned_for: formData.planned_for ? new Date(formData.planned_for).toISOString() : null,
            meta_ext: {
                tags: tagsStr.split(',').map(s => s.trim()).filter(Boolean),
                contexts: contextsStr.split(',').map(s => s.trim()).filter(Boolean)
            }
        };
        await onSave(entry.id, payload);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Panel */}
            <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-slate-500" />
                        Edit Entry
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="edit-form" onSubmit={handleSubmit} className="space-y-5">

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    value={formData.entry_type}
                                    onChange={e => setFormData({ ...formData, entry_type: e.target.value as EntryType })}
                                    className="w-full text-sm rounded-lg border-slate-300 py-2 px-3 border outline-none"
                                >
                                    {ENTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                                <select
                                    value={formData.state}
                                    onChange={e => setFormData({ ...formData, state: e.target.value as EntryState })}
                                    className="w-full text-sm rounded-lg border-slate-300 py-2 px-3 border outline-none"
                                >
                                    {ENTRY_STATES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input
                                type="text" required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full text-sm rounded-lg border-slate-300 py-2 px-3 border outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Body</label>
                            <textarea
                                rows={5}
                                value={formData.body || ''}
                                onChange={e => setFormData({ ...formData, body: e.target.value })}
                                className="w-full text-sm rounded-lg border-slate-300 py-2 px-3 border outline-none resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Occurred At</label>
                                <input
                                    type="datetime-local"
                                    value={formData.occurred_at || ''}
                                    onChange={e => setFormData({ ...formData, occurred_at: e.target.value })}
                                    className="w-full text-sm rounded-lg border-slate-300 py-2 px-3 border outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Planned For</label>
                                <input
                                    type="datetime-local"
                                    value={formData.planned_for || ''}
                                    onChange={e => setFormData({ ...formData, planned_for: e.target.value })}
                                    className="w-full text-sm rounded-lg border-slate-300 py-2 px-3 border outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                            <input
                                type="text"
                                value={tagsStr}
                                onChange={e => setTagsStr(e.target.value)}
                                className="w-full text-sm rounded-lg border-slate-300 py-2 px-3 border outline-none mb-3"
                            />
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contexts</label>
                            <input
                                type="text"
                                value={contextsStr}
                                onChange={e => setContextsStr(e.target.value)}
                                className="w-full text-sm rounded-lg border-slate-300 py-2 px-3 border outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-6 pt-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                />
                                Is Active
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={formData.needs_review}
                                    onChange={e => setFormData({ ...formData, needs_review: e.target.checked })}
                                    className="rounded text-red-500 focus:ring-red-500 w-4 h-4"
                                />
                                Needs Review
                            </label>
                        </div>
                    </form>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="edit-form"
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ================================================================================
SERVER-SIDE INTEGRATION GUIDE (NEXT.JS + SUPABASE)
================================================================================

1) CREATE TABLE SQL (Run in Supabase SQL Editor):

  CREATE TABLE public.entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entry_type VARCHAR(50) NOT NULL CHECK (entry_type IN ('note', 'task', 'event', 'document', 'call', 'payment', 'idea', 'decision')),
      title TEXT NOT NULL,
      body TEXT,
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      planned_for TIMESTAMPTZ,
      is_active BOOLEAN DEFAULT TRUE,
      state VARCHAR(50) DEFAULT 'draft' CHECK (state IN ('draft', 'planned', 'active', 'done', 'cancelled', 'paused')),
      needs_review BOOLEAN DEFAULT FALSE,
      meta_std JSONB DEFAULT '{}'::jsonb,
      meta_ext JSONB DEFAULT '{"tags": [], "contexts": []}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Trigger to update updated_at automatically
  CREATE OR REPLACE FUNCTION update_modified_column() RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ language 'plpgsql';

  CREATE TRIGGER update_entries_modtime
      BEFORE UPDATE ON public.entries
      FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


2) NEXT.JS API ROUTE HANDLERS:

  // Centralized Table Configuration
  const TABLE_NAME = 'entries';

  // Helper: Sanitize & normalize incoming payloads
  const sanitizePayload = (body: any) => ({
    ...body,
    meta_ext: {
      tags: Array.isArray(body?.meta_ext?.tags) ? body.meta_ext.tags : [],
      contexts: Array.isArray(body?.meta_ext?.contexts) ? body.meta_ext.contexts : []
    }
  });


  // File: app/api/qichronicle/entries/route.ts
  import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
  import { cookies } from 'next/headers';
  import { NextResponse } from 'next/server';

  export async function GET(request: Request) {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    let query = supabase.from(TABLE_NAME).select('*').order('occurred_at', { ascending: false });

    // Apply Filters Safely
    if (searchParams.get('search')) {
      const s = (searchParams.get('search') ?? '').replace(/[%,"']/g, '').trim();
      if (s) query = query.or(`title.ilike.%${s}%,body.ilike.%${s}%`);
    }
    if (searchParams.get('types')) {
      query = query.in('entry_type', searchParams.get('types')!.split(','));
    }
    if (searchParams.get('state')) {
      query = query.eq('state', searchParams.get('state'));
    }
    if (searchParams.get('isActiveOnly') === 'true') {
      query = query.eq('is_active', true);
    }
    if (searchParams.get('needsReviewOnly') === 'true') {
      query = query.eq('needs_review', true);
    }
    if (searchParams.get('dateFrom')) {
      query = query.gte('occurred_at', searchParams.get('dateFrom'));
    }
    if (searchParams.get('dateTo')) {
      query = query.lte('occurred_at', searchParams.get('dateTo'));
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  export async function POST(request: Request) {
    const supabase = createRouteHandlerClient({ cookies });
    const rawBody = await request.json();
    const payload = sanitizePayload(rawBody);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([payload])
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }


  // File: app/api/qichronicle/entries/[id]/route.ts
  import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
  import { cookies } from 'next/headers';
  import { NextResponse } from 'next/server';

  export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    const supabase = createRouteHandlerClient({ cookies });
    const rawBody = await request.json();
    const payload = sanitizePayload(rawBody);

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }
*/