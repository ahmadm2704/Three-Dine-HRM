"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Menu, Radio, Sparkles, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAndFetchNotifications();

    const sub = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_off_requests' }, () => {
        checkAdminAndFetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  const checkAdminAndFetchNotifications = async () => {
    let role = "employee";
    const saved = localStorage.getItem("threedine_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        role = parsed.role;
      } catch (e) {}
    }

    if (role === 'super_admin' || role === 'admin') {
      setIsAdmin(true);
      const { data } = await supabase
        .from('time_off_requests')
        .select(`
          id,
          type,
          created_at,
          status,
          employees!time_off_requests_employee_id_fkey(first_name, last_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setNotifications(data);
      }
    }
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#05070D]/85 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 w-full transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden shrink-0 text-muted-foreground hover:text-blue-400 hover:bg-white/5" 
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Futuristic Search Input */}
        <div className="relative w-full max-w-md hidden sm:flex items-center group">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-blue-400/70 group-focus-within:text-blue-400 transition-colors" />
          <Input
            type="search"
            placeholder="Search AI Directory, Employees, Payroll, Documents..."
            className="w-full bg-white/5 pl-10 pr-4 h-10 border border-blue-500/25 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 transition-all"
          />
          <div className="absolute right-3 hidden lg:flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 border border-white/10 rounded px-1.5 py-0.5 bg-black/40">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Real-time Corporate Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-300 text-[11px] font-mono shadow-xs">
          <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Where Research Meets Technology</span>
        </div>

        {/* Notification Bell with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/40 transition-all text-muted-foreground hover:text-blue-300"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#2563EB] border border-[#05070D] animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-[#0A0E17] border-white/10 text-white shadow-2xl shadow-blue-900/20">
            <DropdownMenuLabel className="font-bold flex items-center justify-between">
              Notifications
              {notifications.length > 0 && (
                <span className="bg-blue-600/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30">
                  {notifications.length} Pending
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground font-mono">
                No new notifications.
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.map((notif) => (
                  <DropdownMenuItem key={notif.id} className="focus:bg-white/5 cursor-pointer p-3 border-b border-white/5 last:border-0">
                    <div className="flex gap-3 items-start w-full">
                      <div className="bg-amber-500/10 p-2 rounded-full border border-amber-500/20 mt-0.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-xs font-semibold leading-none">
                          {notif.employees?.first_name} {notif.employees?.last_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Requested <span className="uppercase">{notif.type}</span> time off.
                        </span>
                        <span className="text-[10px] text-blue-400/60 font-mono mt-1">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
