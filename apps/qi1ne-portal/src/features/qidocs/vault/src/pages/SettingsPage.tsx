import React from 'react';
import { Settings, User, Sliders, Database, Shield } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    return (
        <div className="p-8">
            <header className="mb-12">
                <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <Settings className="text-cyan-500" /> Vault Configuration
                </h1>
                <p className="text-gray-500 text-sm mt-1">Global settings for correspondents, custom fields, and storage backends.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <User className="text-purple-500" size={24} />
                        <h2 className="text-xl font-bold uppercase tracking-tight">Correspondents</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 glass rounded-2xl flex justify-between items-center border-l-4 border-purple-500 hover:bg-white/5 transition-all cursor-pointer">
                            <div>
                                <h4 className="font-bold text-sm">QiLabs Global HQ</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Organization • 24 Documents</p>
                            </div>
                            <button className="p-2 hover:bg-white/10 rounded-lg"><Sliders size={16} /></button>
                        </div>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-8">
                        <Database className="text-cyan-500" size={24} />
                        <h2 className="text-xl font-bold uppercase tracking-tight">Custom Fields</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 glass rounded-2xl flex justify-between items-center border-l-4 border-cyan-500">
                            <div>
                                <h4 className="font-bold text-sm">INVOICE_NUMBER</h4>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Type: Text • Mandatory: No</p>
                            </div>
                            <button className="p-2 hover:bg-white/10 rounded-lg"><Sliders size={16} /></button>
                        </div>
                    </div>
                </section>

                <section className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-8">
                        <Shield className="text-emerald-500" size={24} />
                        <h2 className="text-xl font-bold uppercase tracking-tight">Storage Sovereignty</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 glass rounded-3xl border-2 border-emerald-500/50">
                            <span className="text-[10px] uppercase font-black tracking-widest text-emerald-500">Default Store</span>
                            <h4 className="text-2xl font-black mt-2">SUPABASE</h4>
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">Active and encrypted. Linked to primary Postgres instance.</p>
                        </div>
                        <div className="p-6 glass rounded-3xl opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-600">Off-site Hub</span>
                            <h4 className="text-2xl font-black mt-2">CF R2</h4>
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">S3 Compatible storage for large blobs and backups.</p>
                        </div>
                        <div className="p-6 glass rounded-3xl opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-600">Cold Storage</span>
                            <h4 className="text-2xl font-black mt-2">GDRIVE</h4>
                            <p className="text-xs text-gray-500 mt-2 leading-relaxed">Backbone sync for permanent archival and compliance.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
