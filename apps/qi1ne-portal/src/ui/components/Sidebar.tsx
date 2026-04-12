"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { qiRegistry } from '@/qione/objects';
import { clsx } from 'clsx';
import { LayoutDashboard, Database, Settings, ShieldCheck, BookOpen, Users, Activity } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Objects', href: '/objects', icon: Database },
        { name: 'QiChronicle', href: '/qichronicle', icon: BookOpen },
    ];

    const adminNavigation = [
        { name: 'Admin', href: '/admin', icon: ShieldCheck },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Workers', href: '/admin/workers', icon: Activity },
    ];

    const objects = Object.values(qiRegistry);

    return (
        <aside className="w-64 border-r bg-slate-50 flex flex-col">
            <div className="p-6">
                <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">Qi</div>
                    QiOne Portal
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                        </Link>
                    );
                })}

                <div className="pt-6 pb-2">
                    <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Quick Access
                    </p>
                </div>

                {objects.map((obj: any) => (
                    <Link
                        key={obj.key}
                        href={`/objects/${obj.key}`}
                        className={clsx(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            pathname.startsWith(`/objects/${obj.key}`)
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                    >
                        {obj.icon ? <obj.icon className="w-4 h-4" /> : <Database className="w-4 h-4 opacity-40" />}
                        {obj.label}
                    </Link>
                ))}

                <div className="pt-6 pb-2">
                    <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Administration
                    </p>
                </div>

                {adminNavigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200">
                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                </button>
            </div>
        </aside>
    );
}
