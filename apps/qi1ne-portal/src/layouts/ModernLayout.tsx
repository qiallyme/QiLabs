import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, Folder, Book, Gavel, DollarSign, 
  User, Settings, LogOut, Menu, X, Sparkles, ChevronLeft, ChevronRight,
  Shield, Bell, Home, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import UserAvatar from '@/components/UserAvatar';

const moduleIconMap: any = {
  cases: Gavel,
  vault: Folder,
  knowledge: Book,
  tax: DollarSign,
  qihome: Home,
  qicare: Heart,
};

export default function ModernLayout() {
  const { profile, user, modules, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-8 px-4">
      {/* Brand */}
      <div className={cn("flex items-center mb-12 px-4 transition-all duration-300", collapsed ? "justify-center" : "gap-4")}>
        <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
          <Sparkles className="text-white" size={20} />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-black text-white text-xl tracking-tighter leading-none">QiOS</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-1">Operational</span>
          </div>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 space-y-2">
        <NavLink 
          to="/dashboard" 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          active={location.pathname === '/' || location.pathname === '/dashboard'}
          collapsed={collapsed}
        />
        
        {/* Dynamic Modules */}
        {!collapsed && modules.length > 0 && (
          <div className="pt-6 pb-2 px-4">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[2px]">Modules</span>
          </div>
        )}
        
        {modules.map((m) => {
          const Icon = moduleIconMap[m.slug] || Folder;
          return (
            <NavLink 
              key={m.id}
              to={`/${m.slug}`} 
              icon={<Icon size={20} />} 
              label={m.name} 
              active={location.pathname === `/${m.slug}`}
              collapsed={collapsed}
            />
          );
        })}

        {/* Admin Tools */}
        {profile?.role === 'admin' && (
          <>
            {!collapsed && (
              <div className="pt-6 pb-2 px-4">
                <span className="text-[10px] font-bold text-purple-600/60 uppercase tracking-[2px]">Systems</span>
              </div>
            )}
            <NavLink 
              to="/admin/users" 
              icon={<Shield size={20} />} 
              label="Root Registry" 
              active={location.pathname === '/admin/users'}
              collapsed={collapsed}
              className="text-purple-400/80 hover:text-purple-300 hover:bg-purple-600/10"
            />
          </>
        )}
      </nav>

      {/* Footer Nav */}
      <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
        <NavLink 
          to="/profile" 
          icon={<User size={20} />} 
          label="Identity" 
          active={location.pathname === '/profile'}
          collapsed={collapsed}
        />
        <NavLink 
          to="/settings" 
          icon={<Settings size={20} />} 
          label="Config" 
          active={location.pathname === '/settings'}
          collapsed={collapsed}
        />
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-600/10 transition-all group",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span className="font-bold text-sm tracking-tight">Exit</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex">
      {/* Sidebar (Desktop) */}
      <aside className={cn(
        "hidden lg:block bg-black/40 backdrop-blur-2xl border-r border-white/5 transition-all duration-300 fixed h-full z-50",
        collapsed ? "w-24" : "w-72"
      )}>
        <SidebarContent />
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-10 right-[-14px] w-7 h-7 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 z-50 transition-all backdrop-blur-md"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 w-full h-16 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
             <Sparkles size={16} className="text-white" />
           </div>
           <span className="font-black text-white text-lg tracking-tighter">QiOS</span>
        </div>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-400 hover:text-white"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Overlay Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-[#0a0a0c] z-[60] animate-in fade-in zoom-in-95 duration-200">
           <div className="flex justify-end p-6">
              <button onClick={() => setMobileOpen(false)} className="p-2 text-gray-400"><X size={32} /></button>
           </div>
           <SidebarContent />
        </div>
      )}

      {/* Main Content Space */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen pt-16 lg:pt-0",
        collapsed ? "lg:pl-24" : "lg:pl-72"
      )}>
        {/* Contextual Header */}
        <div className="h-20 border-b border-white/5 flex items-center px-12 justify-end gap-6 bg-gradient-to-b from-white/[0.02] to-transparent sticky top-0 z-30 backdrop-blur-md">
           <div className="flex items-center gap-4">
              <div className="relative group">
                 <Bell size={20} className="text-gray-500 hover:text-white transition-colors cursor-pointer" />
                 <div className="absolute top-0 right-0 w-2 h-2 bg-purple-600 rounded-full border border-[#0a0a0c]" />
              </div>
              <div className="h-8 w-px bg-white/10 mx-2" />
              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/profile')}>
                 <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{profile?.full_name || 'Incognito User'}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mt-1">Operator Profile</div>
                 </div>
                 <UserAvatar 
                   url={profile?.avatar_url || null} 
                   name={profile?.full_name || null}
                   className="group-hover:border-purple-600/50 group-hover:scale-105 transition-all"
                 />
              </div>
           </div>
        </div>

        <div className="p-12">
           <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavLink({ to, icon, label, active, collapsed, className }: any) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm group",
        active 
          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-600/20" 
          : "text-gray-500 hover:text-white hover:bg-white/5",
        collapsed && "justify-center px-0",
        className
      )}
    >
      <div className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-gray-500 group-hover:text-purple-400")}>
        {icon}
      </div>
      {!collapsed && <span className="tracking-tight">{label}</span>}
    </Link>
  );
}
