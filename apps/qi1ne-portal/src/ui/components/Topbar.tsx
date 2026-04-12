'use client';

import React from 'react';
import { User, Bell, Search, LogOut } from 'lucide-react';

export default function Topbar({ user = { email: 'user@qially.me' } }) {
    return (
        <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-slate-200 z-10 px-6 flex items-center justify-between shadow-sm backdrop-blur-md bg-white/80">
            <div className="flex items-center space-x-4 bg-slate-100 rounded-lg px-3 py-2 w-96 border border-slate-200 hover:border-slate-300 transition-colors">
                <Search size={18} className="text-slate-400" />
                <input
                    type="text"
                    placeholder="Global search (Ctrl+K)"
                    className="bg-transparent border-none outline-none text-sm w-full text-slate-900 placeholder:text-slate-400 font-medium"
                />
            </div>

            <div className="flex items-center space-x-6">
                <div className="relative group p-2 rounded-full cursor-pointer hover:bg-slate-100 transition-colors">
                    <Bell size={20} className="text-slate-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white ring-2 ring-slate-100 ring-offset-0 animate-pulse" />
                </div>

                <div className="h-8 w-px bg-slate-200 mx-1" />

                <div className="flex items-center space-x-3 cursor-pointer group">
                    <div className="text-right flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{user.email.split('@')[0]}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tenant Admin</span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-50/50 group-hover:scale-105 transition-transform duration-200">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </header>
    );
}
