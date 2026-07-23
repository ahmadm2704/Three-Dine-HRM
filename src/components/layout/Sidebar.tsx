"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  Users, 
  LayoutDashboard, 
  CalendarDays, 
  Target, 
  Briefcase, 
  DollarSign, 
  ShieldCheck,
  Settings,
  FolderOpen,
  Network,
  UserCircle,
  LogOut,
  ChevronUp,
  X,
  Cpu,
  Sparkles
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const adminMainItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Info", href: "/my-info", icon: UserCircle },
  { title: "Directory", href: "/directory", icon: Users },
  { title: "Time Off", href: "/time-off", icon: CalendarDays },
  { title: "Performance", href: "/performance", icon: Target },
  { title: "Recruiting", href: "/recruiting", icon: Briefcase },
  { title: "Payroll", href: "/payroll", icon: DollarSign },
  { title: "Documents", href: "/documents", icon: FolderOpen },
  { title: "Org Chart", href: "/org-chart", icon: Network },
];

const adminSettingsItems = [
  { title: "Admin Portal", href: "/admin", icon: ShieldCheck },
  { title: "Settings", href: "/settings", icon: Settings },
];

const employeeItems = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Info", href: "/my-info", icon: UserCircle },
  { title: "Time Off", href: "/time-off", icon: CalendarDays },
  { title: "Org Chart", href: "/org-chart", icon: Network },
  { title: "Files", href: "/documents", icon: FolderOpen },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [role, setRole] = useState<"super_admin" | "admin" | "employee">("employee");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("threedine_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setRole(parsed.role === "super_admin" || parsed.role === "hr_admin" ? "super_admin" : "employee");
        
        // Fetch live profile data from database to get avatar_url, etc.
        if (parsed.id) {
          fetch(`/api/employees/${parsed.id}`)
            .then(res => {
              if (!res.ok) throw new Error("API Route missing GET method or failed");
              return res.json();
            })
            .then(data => {
              if (data && data.employee) {
                // Merge DB data with local state so we have photo_url
                setUser((prev: any) => ({
                  ...prev,
                  photo_url: data.employee.photo_url || data.employee.avatar_url || ''
                }));
              }
            })
            .catch(err => console.warn("Could not fetch live avatar:", err.message));
        }
      } catch (e) {}
    }
  }, []);

  return (
    <aside className="w-64 bg-[#0B0F19]/90 backdrop-blur-2xl border-r border-blue-500/20 flex flex-col h-full relative overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-40 select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-0 w-full h-48 bg-blue-600/10 rounded-full blur-[70px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-48 bg-sky-500/10 rounded-full blur-[70px] -z-10 pointer-events-none" />

      {/* Brand Header with Seamless Transparent Logo */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-white/10 relative z-10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <img 
            src="/logo-transparent.png" 
            alt="Three Dine Logo" 
            className="h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {onClose && (
          <button 
            onClick={onClose} 
            className="md:hidden p-1.5 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-blue-500/20 relative z-10">
        <div className="px-3 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
            {role === "super_admin" ? "Enterprise Portal" : "Employee Portal"}
          </span>
          <Sparkles className="w-3 h-3 text-blue-400" />
        </div>

        {role === "super_admin" ? (
          <>
            {adminMainItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300 relative group overflow-hidden border",
                    isActive 
                      ? "bg-gradient-to-r from-blue-600/25 via-blue-600/10 to-transparent text-blue-300 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.2)] font-semibold" 
                      : "text-muted-foreground/80 hover:text-foreground hover:bg-white/5 border-transparent hover:border-white/10"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeSideBarTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#2563EB]"
                    />
                  )}
                  <item.icon className={cn(
                    "w-4 h-4 transition-all duration-300 relative z-10", 
                    isActive ? "text-blue-400 scale-110" : "text-muted-foreground group-hover:text-blue-300 group-hover:scale-110"
                  )} />
                  <span className="relative z-10">{item.title}</span>
                </Link>
              );
            })}

            <div className="pt-6 pb-2 px-3 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400/80 font-bold">
                Control & Config
              </span>
              <Cpu className="w-3 h-3 text-sky-400" />
            </div>

            {adminSettingsItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300 relative group overflow-hidden border",
                    isActive 
                      ? "bg-gradient-to-r from-sky-500/25 via-sky-500/10 to-transparent text-sky-300 border-sky-500/50 shadow-[0_0_20px_rgba(14,165,233,0.2)] font-semibold" 
                      : "text-muted-foreground/80 hover:text-foreground hover:bg-white/5 border-transparent hover:border-white/10"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeSideBarTabAdmin"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sky-400 rounded-r-full shadow-[0_0_10px_#38BDF8]"
                    />
                  )}
                  <item.icon className={cn(
                    "w-4 h-4 transition-all duration-300 relative z-10", 
                    isActive ? "text-sky-400 scale-110" : "text-muted-foreground group-hover:text-sky-300 group-hover:scale-110"
                  )} />
                  <span className="relative z-10">{item.title}</span>
                </Link>
              );
            })}
          </>
        ) : (
          <>
            {employeeItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-300 relative group overflow-hidden border",
                    isActive 
                      ? "bg-gradient-to-r from-blue-600/25 via-blue-600/10 to-transparent text-blue-300 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.2)] font-semibold" 
                      : "text-muted-foreground/80 hover:text-foreground hover:bg-white/5 border-transparent hover:border-white/10"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeSideBarTabEmp"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#2563EB]"
                    />
                  )}
                  <item.icon className={cn(
                    "w-4 h-4 transition-all duration-300 relative z-10", 
                    isActive ? "text-blue-400 scale-110" : "text-muted-foreground group-hover:text-blue-300 group-hover:scale-110"
                  )} />
                  <span className="relative z-10">{item.title}</span>
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* User Footer Profile Card */}
      <div className="p-3 border-t border-white/10 mt-auto bg-[#070914]/90 backdrop-blur-xl relative z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all duration-300 group hover:border-blue-500/40">
              <Avatar className="h-9 w-9 border border-blue-500/50 shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                {user?.photo_url ? (
                  <img src={user.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                    {user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() : (role === 'super_admin' ? 'AD' : 'EM')}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-blue-300 transition-colors">
                  {user && (user.firstName || user.lastName) ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : (role === 'super_admin' ? 'Ali Danish' : 'Employee Portal')}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono truncate capitalize">
                  {user ? user.role.replace('_', ' ') : (role === 'super_admin' ? 'Super Admin' : 'Staff Member')}
                </p>
              </div>
              <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="center" className="w-[230px] mb-2 bg-[#0F1322] border border-blue-500/30 text-foreground shadow-2xl z-[100] backdrop-blur-xl">
            <DropdownMenuLabel className="text-xs font-mono text-blue-300 uppercase">User Controls</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              className="text-blue-400 hover:bg-blue-500/10 focus:bg-blue-500/10 cursor-pointer text-xs font-medium"
              onClick={() => window.location.href = "/my-info"}
            >
              <UserCircle className="w-4 h-4 mr-2 text-blue-400" /> My Info Profile
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 focus:bg-rose-500/10 focus:text-rose-300 cursor-pointer text-xs font-medium" 
              onClick={() => {
                localStorage.removeItem("threedine_user");
                window.location.href = "/";
              }}
            >
              <LogOut className="w-4 h-4 mr-2 text-rose-400" /> Disconnect Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
