"use client";

import { Bell, Search, Menu, Radio, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
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

        {/* Notification Bell with 3D Ring */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/40 transition-all text-muted-foreground hover:text-blue-300"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_#2563EB]" />
        </Button>
      </div>
    </header>
  );
}
