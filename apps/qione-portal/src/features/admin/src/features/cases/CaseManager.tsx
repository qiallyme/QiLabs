import React, { useState, useEffect } from 'react';
import type { QiCase } from '../../types/database.types';
import { supabase } from '../../lib/supabase';

export const CaseManager: React.FC = () => {
    const [cases, setCases] = useState<QiCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCase, setCurrentCase] = useState<Partial<QiCase> | null>(null);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        setLoading(true);
        const { data, error } = await supabase.schema('qicase').from('cases').select('*').order('created_at', { ascending: false });
        if (error) console.error("Error fetching cases:", error);
        else if (data) setCases(data as QiCase[]);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCase) return;

        const isNew = !currentCase.id;
        const payload = {
            ...currentCase,
            tenant_id: currentCase.tenant_id || "00000000-0000-0000-0000-000000000000", // Required UUID
            case_name: currentCase.case_name || "New Case",
            updated_at: new Date().toISOString()
        };

        let response;
        if (isNew) {
            response = await supabase.schema('qicase').from('cases').insert([{ ...payload, created_at: new Date().toISOString() }]);
        } else {
            response = await supabase.schema('qicase').from('cases').update(payload).eq('id', currentCase.id);
        }

        if (response.error) {
            console.error("Error saving case", response.error);
            alert("Failed to save. Ensure tenant_id is valid UUID.");
        } else {
            setIsEditing(false);
            setCurrentCase(null);
            fetchCases();
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8 font-sans">
            <header className="mb-10 max-w-[1100px] mx-auto">
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Master Case Index</h1>
                <p className="text-gray-400 text-lg">qicase schema viewer and data slicer.</p>
            </header>

            <main className="max-w-[1100px] mx-auto">
                <div className="flex gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search cases, QIDs, or counsel..."
                        className="w-full md:w-1/3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 backdrop-blur-md transition-all"
                    />
                    <button 
                        onClick={() => { setCurrentCase({}); setIsEditing(true); }}
                        className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md px-6 py-3 rounded-lg font-semibold transition-all">
                        + New Entry
                    </button>
                    <button 
                        onClick={fetchCases}
                        className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md px-6 py-3 rounded-lg font-semibold transition-all">
                        Refresh
                    </button>
                </div>

                {isEditing && (
                    <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">{currentCase?.id ? 'Edit Case' : 'New Case'}</h2>
                        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Case Name *</label>
                                <input required type="text" value={currentCase?.case_name || ''} onChange={(e) => setCurrentCase({...currentCase, case_name: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Case Number</label>
                                <input type="text" value={currentCase?.case_number || ''} onChange={(e) => setCurrentCase({...currentCase, case_number: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Court</label>
                                <input type="text" value={currentCase?.court || ''} onChange={(e) => setCurrentCase({...currentCase, court: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Opposing Counsel</label>
                                <input type="text" value={currentCase?.opposing_counsel || ''} onChange={(e) => setCurrentCase({...currentCase, opposing_counsel: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Status</label>
                                <input type="text" value={currentCase?.status || ''} onChange={(e) => setCurrentCase({...currentCase, status: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Tenant ID (UUID) *</label>
                                <input required type="text" value={currentCase?.tenant_id || ''} onChange={(e) => setCurrentCase({...currentCase, tenant_id: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div className="col-span-2 flex gap-4 mt-4">
                                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold transition-all">Save Changes</button>
                                <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-all">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5 text-sm uppercase tracking-wider text-gray-400">
                                <th className="p-5 font-semibold">Case Name & No.</th>
                                <th className="p-5 font-semibold">Court / Judge</th>
                                <th className="p-5 font-semibold">Opposing Counsel</th>
                                <th className="p-5 font-semibold">Status</th>
                                <th className="p-5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={5} className="p-5 text-center text-gray-400">Loading cases...</td></tr>
                            ) : cases.length === 0 ? (
                                <tr><td colSpan={5} className="p-5 text-center text-gray-400">No records found.</td></tr>
                            ) : cases.map((c) => (
                                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-5">
                                        <div className="font-bold text-white text-lg">{c.case_name}</div>
                                        <div className="text-sm text-gray-500 font-mono mt-1">{c.case_number || 'N/A'}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-gray-300">{c.court || 'Unassigned'}</div>
                                    </td>
                                    <td className="p-5 text-gray-300">{c.opposing_counsel || '--'}</td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${c.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                            {c.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right flex justify-end gap-2">
                                        <button onClick={() => { setCurrentCase(c); setIsEditing(true); }} className="text-sm bg-white/5 hover:bg-theme border border-white/10 hover:border-white/30 px-4 py-2 rounded-md transition-all text-gray-300">
                                            Edit
                                        </button>
                                        <button className="text-sm bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-4 py-2 rounded-md transition-all text-blue-400">
                                            Open Record
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};