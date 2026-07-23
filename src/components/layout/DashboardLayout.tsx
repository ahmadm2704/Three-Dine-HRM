"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ThreeDBackground } from "@/components/ui/ThreeDBackground";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("threedine_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const role = parsed.role;
        
        // Enforce employee restrictions based on URL
        if (role === 'employee') {
          const restrictedPaths = ['/admin', '/directory', '/payroll', '/performance', '/recruiting'];
          if (restrictedPaths.some(p => pathname.startsWith(p))) {
            router.replace('/dashboard');
          }
        }
      } catch(e) {}
    } else {
      // Not logged in
      router.replace('/');
    }
  }, [pathname, router]);

  return (
    <div className="min-h-screen bg-[#05070D] text-foreground flex flex-col relative overflow-hidden bg-grid-cyber selection:bg-blue-600/30">
      {/* 3D WebGL Background Canvas */}
      <ThreeDBackground />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 w-full md:w-[calc(100%-16rem)] transition-all duration-300 relative z-10">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
