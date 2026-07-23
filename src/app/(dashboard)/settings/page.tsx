"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, ShieldCheck, UserCircle, Bell } from "lucide-react";
import { ThreeDPageHeader } from "@/components/ui/ThreeDPageHeader";
import { ThreeDCard } from "@/components/ui/ThreeDCard";

export default function Settings() {
  return (
    <div className="space-y-6">
      <ThreeDPageHeader
        title="Personal Telemetry & Preferences"
        subtitle="Manage your profile configuration, security keys, and system notifications."
        badge="User Configuration"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ThreeDCard glowColor="blue">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
              <UserCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Account Security</h3>
              <p className="text-xs text-sky-400 font-mono mt-0.5">Managed via Supabase Auth Protocol</p>
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard glowColor="cyan">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Neural Notifications</h3>
              <p className="text-xs text-sky-300 font-mono mt-0.5">Email & In-App Alerts Active</p>
            </div>
          </div>
        </ThreeDCard>
      </div>

      <ThreeDCard glowColor="blue">
        <div className="p-2">
          <h3 className="text-lg font-black text-white uppercase mb-1">System Profile</h3>
          <p className="text-xs text-muted-foreground mb-4">Current session & system preferences</p>
          <p className="text-xs text-sky-400 font-mono">
            Authenticated as 256-Bit Encrypted User. All changes synchronize instantly across Three Dine Mesh.
          </p>
        </div>
      </ThreeDCard>
    </div>
  );
}
