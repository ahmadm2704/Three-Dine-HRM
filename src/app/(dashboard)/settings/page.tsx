"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, ShieldCheck, UserCircle, Bell, Loader2 } from "lucide-react";
import { ThreeDPageHeader } from "@/components/ui/ThreeDPageHeader";
import { ThreeDCard } from "@/components/ui/ThreeDCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("threedine_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.email) setUserEmail(user.email);
      } catch (e) {}
    }
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "New passwords do not match." });
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: 'error', text: data.error || "Failed to change password." });
      }
    } catch (err) {
      setMessage({ type: 'error', text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ThreeDPageHeader
        title="Personal Telemetry & Preferences"
        subtitle="Manage your profile configuration, security keys, and system notifications."
        badge="User Configuration"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ThreeDCard glowColor="blue" className="h-full">
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3.5 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
                <UserCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">Account Security</h3>
                <p className="text-xs text-sky-400 font-mono mt-0.5">Managed via Supabase Auth Protocol</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 flex-1">
              {message && (
                <div className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                  <ShieldCheck className="w-4 h-4" />
                  {message.text}
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-blue-300">Current Password</Label>
                <Input type="password" required value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="bg-black/50 border-blue-500/30 focus:border-blue-400 text-white" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-blue-300">New Password</Label>
                <Input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-black/50 border-blue-500/30 focus:border-blue-400 text-white" minLength={6} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase font-mono text-blue-300">Confirm New Password</Label>
                <Input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-black/50 border-blue-500/30 focus:border-blue-400 text-white" minLength={6} />
              </div>
              <Button type="submit" disabled={loading || !userEmail} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white text-xs uppercase font-bold tracking-wider">
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Update Security Key
              </Button>
            </form>
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
