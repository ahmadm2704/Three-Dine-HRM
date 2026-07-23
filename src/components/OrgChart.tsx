"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown, ChevronRight, Plus, Minus, Loader2, Sparkles, Move, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface OrgNode {
  id: string;
  name: string;
  title: string;
  department: string;
  photoUrl?: string;
  color: string;
  borderColor: string;
  glowColor: string;
  children: OrgNode[];
}

// 3D Perspective Interactive Node Card Component
function OrgNodeCard({ 
  node, 
  isRoot = false,
  onDragStart,
  onDrop,
  isReadOnly = false
}: { 
  node: OrgNode; 
  isRoot?: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, targetId: string) => void;
  isReadOnly?: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 3D Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const hasChildren = node.children && node.children.length > 0;
  const initials = node.name.split(" ").map((n) => n[0]).join("");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: (y / rect.height) * -12, // Subtle X tilt
      y: (x / rect.width) * 12,   // Subtle Y tilt
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    onDrop(e, node.id);
  };

  // Clean title so Super Admin is NEVER displayed
  const displayTitle = node.title.replace(/& Super Admin|Super Admin/gi, "").trim() || (isRoot ? "Chief Executive Officer" : "Employee");

  return (
    <div className="flex flex-col items-center select-none">
      {/* 3D Perspective Card Container */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ perspective: 1000, transformStyle: "preserve-3d" }}
        className={`relative group cursor-pointer ${isRoot ? "mb-8" : "mb-4"} ${isDragOver && !isReadOnly ? "ring-4 ring-blue-500 ring-offset-4 rounded-3xl" : ""}`}
        draggable={!isRoot && !isReadOnly}
        onDragStart={(e) => !isRoot && !isReadOnly && onDragStart(e as unknown as React.DragEvent, node.id)}
        onDragOver={isReadOnly ? undefined : handleDragOver}
        onDragLeave={isReadOnly ? undefined : handleDragLeave}
        onDrop={isReadOnly ? undefined : handleDrop}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div
          className={`
            relative overflow-hidden rounded-3xl p-5 text-center
            bg-[#0A0E1A]/95 backdrop-blur-2xl border-2 transition-all duration-300
            shadow-[0_15px_35px_rgba(0,0,0,0.6)] group-hover:shadow-[0_20px_50px_rgba(37,99,235,0.35)]
            ${node.borderColor}
            ${isRoot ? "w-[240px] px-6 py-6 border-blue-500/80 ring-2 ring-blue-500/30" : "w-[200px] px-4 py-5"}
          `}
        >
          {/* Ambient Inner 3D Glow */}
          <div className="absolute -top-12 -left-12 w-28 h-28 bg-blue-500/15 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-sky-500/15 rounded-full blur-2xl group-hover:bg-sky-500/30 transition-all pointer-events-none" />

          {/* Perfectly Sized & Rounded Avatar Frame */}
          <div className="flex justify-center mb-3 relative z-10" style={{ transform: "translateZ(25px)" }}>
            <div className={`relative ${isRoot ? "w-20 h-20" : "w-14 h-14"} rounded-full border-2 ${node.borderColor} shadow-[0_0_20px_rgba(37,99,235,0.4)] overflow-hidden shrink-0 mx-auto flex items-center justify-center bg-blue-950/60`}>
              {node.photoUrl ? (
                <img 
                  src={node.photoUrl} 
                  alt={node.name} 
                  className="w-full h-full object-cover rounded-full" 
                />
              ) : (
                <span className={`font-black text-white tracking-wider ${isRoot ? "text-xl" : "text-base"}`}>
                  {initials}
                </span>
              )}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0F1424] shadow-[0_0_10px_#10B981] z-20" />
            </div>
          </div>

          {/* Name & Clean Title */}
          <div className="relative z-10 space-y-1" style={{ transform: "translateZ(18px)" }}>
            <h4 className={`font-black text-white ${isRoot ? "text-lg" : "text-sm"} tracking-tight group-hover:text-blue-300 transition-colors truncate`}>
              {node.name}
            </h4>
            <p className="text-xs text-sky-400/90 font-mono font-medium truncate">
              {displayTitle}
            </p>

            {node.department && (
              <div className="mt-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-300 bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full inline-block truncate max-w-full">
                  {node.department}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Expand / Collapse Pulsing Trigger Button */}
        {hasChildren && (
          <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-[#0F1424] border-2 border-blue-400 flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.6)] z-20 group-hover:scale-110 transition-transform">
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-blue-300" />
            )}
          </div>
        )}
      </motion.div>

      {/* Glowing Neon Connecting Lines */}
      {hasChildren && expanded && (
        <>
          <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500 to-sky-400 shadow-[0_0_10px_#2563EB]" />

          {/* Horizontal Connector Bar */}
          {node.children.length > 1 && (
            <div className="relative w-full flex justify-center">
              <div
                className="h-0.5 bg-gradient-to-r from-blue-500 via-sky-400 to-blue-500 shadow-[0_0_10px_#38BDF8] absolute top-0"
                style={{
                  width: `${Math.max(50, (node.children.length - 1) * 100 / node.children.length)}%`,
                }}
              />
            </div>
          )}

          {/* Children List */}
          <div className="flex gap-6 sm:gap-8 pt-0 flex-wrap justify-center">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-0.5 h-8 bg-gradient-to-b from-sky-400 to-blue-500 shadow-[0_0_10px_#2563EB]" />
                <OrgNodeCard 
                  node={child} 
                  onDragStart={onDragStart}
                  onDrop={onDrop}
                  isReadOnly={isReadOnly}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const getDepartmentStyle = (dept: string) => {
  switch (dept) {
    case 'Leadership': 
      return { color: "text-blue-300", borderColor: "border-blue-500/60", glowColor: "blue" };
    case 'Top Management': 
      return { color: "text-sky-300", borderColor: "border-sky-500/60", glowColor: "cyan" };
    case 'Three Dine Technology': 
    case 'IT Team': 
      return { color: "text-violet-300", borderColor: "border-violet-500/60", glowColor: "purple" };
    case 'Support': 
      return { color: "text-emerald-300", borderColor: "border-emerald-500/60", glowColor: "emerald" };
    default: 
      return { color: "text-blue-300", borderColor: "border-blue-500/40", glowColor: "blue" };
  }
};

export default function OrgChartComponent() {
  const [data, setData] = useState<OrgNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Smooth Click & Drag Panning State
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });

  // Handle Mouse Click & Drag Panning
  const handlePanStart = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    if ((e.target as HTMLElement).closest('.group')) return; // Don't pan if clicking node card

    setIsPanning(true);
    setStartPan({ x: e.clientX, y: e.clientY });
    setScrollPos({ left: scrollRef.current.scrollLeft, top: scrollRef.current.scrollTop });
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning || !scrollRef.current) return;
    e.preventDefault();
    const dx = e.clientX - startPan.x;
    const dy = e.clientY - startPan.y;
    scrollRef.current.scrollLeft = scrollPos.left - dx;
    scrollRef.current.scrollTop = scrollPos.top - dy;
  };

  const handlePanEnd = () => setIsPanning(false);

  // Wheel Zoom Listener
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        setZoom(z => Math.min(2.0, z + 0.1));
      } else {
        setZoom(z => Math.max(0.4, z - 0.1));
      }
    }
  };

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const response = await fetch('/api/employees');
        let employees: any[] = [];
        
        if (response.ok) {
          const resData = await response.json();
          employees = (resData.employees || []).filter(
            (emp: any) => !emp.employment_status || emp.employment_status === 'active'
          );
        }

        // Read current user from localStorage for live avatar reflection
        let localUserPhoto: string | null = null;
        let localUserEmail: string | null = null;
        const savedUserStr = localStorage.getItem("threedine_user");
        if (savedUserStr) {
          try {
            const parsed = JSON.parse(savedUserStr);
            if (parsed.photoUrl) localUserPhoto = parsed.photoUrl;
            if (parsed.email) localUserEmail = parsed.email.toLowerCase();
          } catch (e) {}
        }

        if (!employees || employees.length === 0) {
          setData({
            id: 'root',
            name: 'Ali Danish',
            title: 'Chief Executive Officer',
            department: 'Leadership',
            color: 'text-blue-300',
            borderColor: 'border-blue-500/60',
            glowColor: 'blue',
            children: []
          });
          setLoading(false);
          return;
        }

        // 1. Identify CEO Record (Ali Danish is ALWAYS single APEX ROOT node)
        const ceoEmp = employees.find(e => 
          (e.job_title || '').toLowerCase().includes('ceo') || 
          (e.job_title || '').toLowerCase().includes('chief executive officer') || 
          e.email?.toLowerCase() === 'admin@threedinecorporation.com' ||
          e.email?.toLowerCase() === 'ali.danish@threedinecorporation.com'
        ) || employees[0];

        // 2. Build direct and sub-reporting children for any manager
        const buildChildrenForManager = (managerId: string, ceoId: string): OrgNode[] => {
          return employees
            .filter(e => e.id !== ceoId && ((e.manager_id === managerId) || (!e.manager_id && managerId === ceoId)))
            .map(emp => {
              const deptName = emp.departments ? (Array.isArray(emp.departments) ? emp.departments[0]?.name : (emp.departments as any).name) : '';
              const style = getDepartmentStyle(deptName);
              const cleanTitle = (emp.job_title || '').replace(/& Super Admin|Super Admin/gi, "").trim() || 'Employee';
              
              let resolvedPhoto = emp.avatar_url || emp.photo_url || emp.photoUrl || '';

              return {
                id: emp.id,
                name: `${emp.first_name} ${emp.last_name}`,
                title: cleanTitle,
                department: deptName,
                photoUrl: resolvedPhoto,
                color: style.color,
                borderColor: style.borderColor,
                glowColor: style.glowColor,
                children: buildChildrenForManager(emp.id, ceoId)
              };
            });
        };

        // 3. Construct CEO APEX Root Node
        const ceoDept = ceoEmp.departments ? (Array.isArray(ceoEmp.departments) ? ceoEmp.departments[0]?.name : (ceoEmp.departments as any).name) : 'Leadership';
        const ceoStyle = getDepartmentStyle(ceoDept);
        let ceoPhoto = ceoEmp.avatar_url || ceoEmp.photo_url || ceoEmp.photoUrl || '';

        const rootNode: OrgNode = {
          id: ceoEmp.id,
          name: `${ceoEmp.first_name} ${ceoEmp.last_name}`,
          title: 'Chief Executive Officer',
          department: ceoDept,
          photoUrl: ceoPhoto,
          color: ceoStyle.color,
          borderColor: ceoStyle.borderColor,
          glowColor: ceoStyle.glowColor,
          children: buildChildrenForManager(ceoEmp.id, ceoEmp.id)
        };

        setData(rootNode);

      } catch (err) {
        setData({
          id: 'root',
          name: 'Ali Danish',
          title: 'Chief Executive Officer',
          department: 'Leadership',
          color: 'text-blue-300',
          borderColor: 'border-blue-500/60',
          glowColor: 'blue',
          children: []
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrgData();

    const saved = localStorage.getItem("threedine_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'employee') {
          setIsReadOnly(true);
        }
      } catch (e) {}
    }
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId || draggedId === targetId || !data) return;

    const newData = JSON.parse(JSON.stringify(data));
    let draggedNode: OrgNode | null = null;

    const removeNode = (nodes: OrgNode[], id: string): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
          draggedNode = nodes[i];
          nodes.splice(i, 1);
          return true;
        }
        if (nodes[i].children && removeNode(nodes[i].children, id)) {
          return true;
        }
      }
      return false;
    };

    const addNode = (node: OrgNode, id: string, newChild: OrgNode): boolean => {
      if (node.id === id) {
        node.children.push(newChild);
        return true;
      }
      for (const child of node.children) {
        if (addNode(child, id, newChild)) return true;
      }
      return false;
    };

    if (removeNode([newData], draggedId) && draggedNode) {
      if (addNode(newData, targetId, draggedNode)) {
        setData(newData);
        try {
          await supabase.from('employees').update({ manager_id: targetId }).eq('id', draggedId);
        } catch (err) {}
      }
    }
  };

  if (loading || !data) {
    return (
      <Card className="w-full h-full min-h-[600px] bg-[#05070D] border-none flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="font-mono text-sm text-sky-400">Loading 3D Organizational Canvas...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">3D Organizational Chart</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" /> Executive Canvas
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Three Dine Corporation company hierarchy. CEO at apex root node; team members report under assigned managers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-blue-500/30 rounded-2xl bg-[#0C101D]/80 backdrop-blur-xl p-1.5 shadow-2xl">
            <span className="w-12 text-center text-xs text-sky-400 font-mono font-bold">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/10 text-white" onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-white/10 text-white" onClick={() => setZoom(z => Math.min(2.0, z + 0.1))}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs rounded-xl hover:bg-white/10 text-sky-300 font-mono font-bold" onClick={() => setZoom(1)}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Card */}
      <Card className="bg-[#05070D] border border-blue-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col min-h-[650px] relative">
        
        {/* Canvas Header */}
        <CardHeader className="border-b border-white/10 bg-[#0A0E1A]/80 backdrop-blur-2xl shrink-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-white uppercase tracking-wider">
                  Three Dine Corporate Hierarchy
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground font-mono">
                  CEO Apex Root Node • Hold click & drag anywhere on grid to navigate 360°
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              <Move className="w-3.5 h-3.5 text-blue-400" />
              <span>Click & Drag to Pan Canvas</span>
            </div>
          </div>
        </CardHeader>

        {/* 3D Infinite Grid Panning Canvas */}
        <CardContent className="flex-1 p-0 relative overflow-hidden bg-[radial-gradient(#1E2640_1px,transparent_1px)] [background-size:24px_24px]">
          <div 
            ref={scrollRef}
            onWheel={handleWheel}
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
            className={`absolute inset-0 overflow-auto select-none scrollbar-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            <div 
              className="min-w-max min-h-max p-16 flex justify-center origin-top transition-transform duration-150"
              style={{ transform: `scale(${zoom})` }}
            >
              <OrgNodeCard 
                node={data} 
                isRoot 
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                isReadOnly={isReadOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
