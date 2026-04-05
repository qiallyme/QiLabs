'use client';

import React from 'react';
import Link from 'next/link';
import { 
    Users, 
    Shield, 
    Activity, 
    Database, 
    Settings, 
    ChevronRight,
    UserPlus,
    UserCog,
    KeyRound,
    ClipboardList
} from 'lucide-react';

const adminSections = [
    {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
        description: 'Manage users, roles, and permissions',
        color: 'blue'
    },
    {
        title: 'Roles & Permissions',
        href: '/admin/roles',
        icon: Shield,
        description: 'Configure access levels',
        color: 'purple'
    },
    {
        title: 'Audit Log',
        href: '/admin/audit',
        icon: ClipboardList,
        description: 'View system activity',
        color: 'emerald'
    },
    {
        title: 'Workers',
        href: '/admin/workers',
        icon: Activity,
        description: 'Monitor background jobs',
        color: 'amber'
    },
    {
        title: 'System',
        href: '/admin/system',
        icon: Database,
        description: 'Database and infrastructure',
        color: 'slate'
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        description: 'Application configuration',
        color: 'gray'
    }
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
                <p className="text-slate-500 mt-1">Manage users, roles, and system configuration</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminSections.map((section) => (
                    <Link
                        key={section.href}
                        href={section.href}
                        className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200"
                    >
                        <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-xl bg-${section.color}-50 text-${section.color}-600`}>
                                <section.icon size={24} />
                            </div>
                            <ChevronRight 
                                size={20} 
                                className="text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" 
                            />
                        </div>
                        <h3 className="mt-4 font-semibold text-slate-900">{section.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                    </Link>
                ))}
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Link 
                        href="/admin/users?action=invite"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <UserPlus size={16} />
                        Invite User
                    </Link>
                    <Link 
                        href="/admin/roles?action=create"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <Shield size={16} />
                        Create Role
                    </Link>
                    <Link 
                        href="/admin/workers?action=rebuild"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <Activity size={16} />
                        Rebuild Index
                    </Link>
                </div>
            </div>
        </div>
    );
}
