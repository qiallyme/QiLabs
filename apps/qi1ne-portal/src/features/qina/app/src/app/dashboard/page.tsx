'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ScrollText, 
  Scale, 
  Clock, 
  FileText, 
  Calendar, 
  CheckSquare, 
  LifeBuoy, 
  Bell, 
  Search, 
  Plus, 
  Command, 
  ChevronRight, 
  Menu, 
  MoreVertical, 
  Filter, 
  ArrowLeft,
  Briefcase
} from 'lucide-react';
import { Database } from '@/types/database.types';

// Type alias for convenience
type Task = Database['public']['Tables']['tasks']['Row'];

// --- Sub-Components (Ideally these go in /components/dashboard/...) ---

const SidebarItem = ({ icon: Icon, label, isActive, collapsed, onClick }: any) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors group ${
      isActive
        ? 'bg-slate-800 text-white'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
  </div>
);

const SectionLabel = ({ label, collapsed }: { label: string, collapsed: boolean }) => (
  !collapsed && (
    <div className="px-3 mt-6 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
      {label}
    </div>
  )
);

const ProgressBar = ({ current, total }: { current: number, total: number }) => {
  const percentage = total === 0 ? 0 : (current / total) * 100;
  return (
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-500 transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
      <CheckSquare size={32} className="text-slate-300" />
    </div>
    <h3 className="text-lg font-medium text-slate-900 mb-1">No tasks yet</h3>
    <p className="text-slate-500 max-w-xs mb-6 text-sm">
      Your task list is empty. Start organizing your case by adding tasks manually or asking the AI for help.
    </p>
    <div className="flex gap-3">
      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors shadow-sm">
        <Plus size={16} />
        Add Task Manually
      </button>
      <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 text-sm font-medium transition-colors shadow-sm shadow-indigo-200">
        <Command size={16} />
        Ask AI Assistant
      </button>
    </div>
  </div>
);

// --- Main Page Component ---

export default function CaseDashboard({ params }: { params: { id: string } }) {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');

  // MOCK DATA - In production, fetch this via Supabase using params.id
  const caseData = {
    id: params.id,
    title: "Cody Rice-Velasquez v. FCFCU",
    type: "Other",
    trial_date: "Apr 1, 2026",
    days_remaining: 410
  };

  // Mock Tasks (Empty for now as per requirements)
  const tasks: Task[] = []; 

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* --- Sidebar --- */}
      <aside
        className={`${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } bg-slate-900 flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out flex-shrink-0 z-20`}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white">
            <div className="bg-indigo-500 p-1.5 rounded-lg">
              <Scale size={18} className="text-white" />
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-lg tracking-tight">Justicia<span className="text-indigo-400">AI</span></span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-hide">
           {!isSidebarCollapsed && (
            <div className="mb-6 px-2">
               <button className="flex items-center justify-between w-full text-left text-slate-300 hover:text-white transition-colors group">
                 <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-slate-700 flex items-center justify-center text-[10px] font-bold">A</div>
                    <span className="text-sm font-medium">All Matters</span>
                 </div>
                 <ChevronRight size={14} className="opacity-50 group-hover:opacity-100" />
               </button>
            </div>
           )}

          <SectionLabel label="Matter Management" collapsed={isSidebarCollapsed} />
          
          <SidebarItem icon={LayoutDashboard} label="Dashboard" isActive={activeTab === 'dashboard'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={ScrollText} label="Facts" isActive={activeTab === 'facts'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('facts')} />
          <SidebarItem icon={Scale} label="Evidence" isActive={activeTab === 'evidence'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('evidence')} />
          <SidebarItem icon={Clock} label="Timeline" isActive={activeTab === 'timeline'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('timeline')} />
          <SidebarItem icon={FileText} label="Documents" isActive={activeTab === 'documents'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('documents')} />
          <SidebarItem icon={Calendar} label="Deadlines" isActive={activeTab === 'deadlines'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('deadlines')} />
          <SidebarItem icon={CheckSquare} label="Tasks" isActive={activeTab === 'tasks'} collapsed={isSidebarCollapsed} onClick={() => setActiveTab('tasks')} />

          <SectionLabel label="Support" collapsed={isSidebarCollapsed} />
          <SidebarItem icon={LifeBuoy} label="Help Center" isActive={false} collapsed={isSidebarCollapsed} />
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full"
          >
            <Menu size={20} />
            {!isSidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500 overflow-hidden whitespace-nowrap">
            <span className="hover:text-slate-800 cursor-pointer transition-colors">All Matters</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase size={14} className="text-slate-400" />
              {caseData.title}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs border border-slate-200 font-medium ml-2">
              {caseData.type}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search case files..." 
                className="pl-9 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                 <kbd className="hidden sm:inline-block border border-slate-200 rounded px-1.5 text-[10px] font-sans font-medium text-slate-400 bg-white">Ctrl</kbd>
                 <kbd className="hidden sm:inline-block border border-slate-200 rounded px-1.5 text-[10px] font-sans font-medium text-slate-400 bg-white">F</kbd>
              </div>
            </div>
            
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs cursor-pointer">
              U
            </div>
          </div>
        </header>

        {/* Case Info Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{caseData.title}</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Active Matter &bull; Case ID: {caseData.id}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <div className="bg-rose-50 p-2 rounded-md">
              <Calendar size={20} className="text-rose-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trial / Hearing Date</div>
              <div className="font-bold text-slate-900">{caseData.trial_date}</div>
            </div>
            <div className="h-8 w-px bg-slate-100 mx-2 hidden sm:block"></div>
            <div className="hidden sm:block text-right">
              <div className="text-xs text-slate-400">Time Remaining</div>
              <div className="font-medium text-slate-700">{caseData.days_remaining} Days</div>
            </div>
          </div>
        </div>

        {/* Workspace Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  Task Tracker
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200">
                    Project View
                  </span>
                </h2>
                <p className="text-slate-500 mt-1">Manage your lawsuit deliverables and deadlines.</p>
              </div>
              <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                <Plus size={16} />
                Add Task
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-slate-500 text-sm font-medium">Completion</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold">0%</span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold text-slate-900">0</span>
                  <span className="text-sm text-slate-500 mb-1.5">of 0 tasks</span>
                </div>
                <ProgressBar current={0} total={10} />
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                 <div className="text-sm text-slate-500 font-medium mb-1">Upcoming Deadlines</div>
                 <div className="text-slate-400 text-sm italic">No upcoming deadlines synced.</div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl shadow-md text-white flex flex-col justify-between relative overflow-hidden group cursor-pointer">
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <Command size={14} />
                        <span className="text-xs font-medium uppercase opacity-80">AI Assistant</span>
                    </div>
                    <div className="font-bold">Generate Checklist</div>
                 </div>
                 <ArrowLeft size={100} className="absolute -right-8 -bottom-8 opacity-10 group-hover:opacity-20 transition-opacity" />
                 <p className="text-indigo-100 text-xs mt-2 relative z-10">Scan case docs to build a to-do list.</p>
              </div>
            </div>

            {/* Task List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
                <div className="flex items-center px-6 py-3 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 rounded-t-xl">
                    <div className="w-8"></div>
                    <div className="flex-1">Task Name</div>
                    <div className="w-32">Due Date</div>
                    <div className="w-32">Priority</div>
                    <div className="w-24">Assignee</div>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                     <EmptyState />
                     <div className="mt-8 flex items-center gap-2 text-slate-400 text-xs">
                        <span>Pro Tip: Press</span>
                        <kbd className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-500 font-sans">Cmd</kbd>
                        <span>+</span>
                        <kbd className="bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-500 font-sans">K</kbd>
                        <span>to open the Command Center at any time.</span>
                     </div>
                </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}