"use client";

import React, { useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThreeDCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: "blue" | "cyan" | "white" | "emerald" | "default";
  intensity?: number;
}

export function ThreeDCard({
  children,
  className,
  glowColor = "default",
  intensity = 15,
  ...props
}: ThreeDCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-intensity, intensity]);

  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  const glowStyles = {
    blue: "shadow-[0_0_35px_rgba(37,99,235,0.3)] border-blue-500/35 hover:border-blue-400/70",
    cyan: "shadow-[0_0_35px_rgba(14,165,233,0.3)] border-sky-500/35 hover:border-sky-400/70",
    white: "shadow-[0_0_35px_rgba(255,255,255,0.2)] border-white/30 hover:border-white/60",
    emerald: "shadow-[0_0_35px_rgba(16,185,129,0.3)] border-emerald-500/35 hover:border-emerald-400/70",
    default: "shadow-[0_0_30px_rgba(37,99,235,0.2)] border-blue-500/25 hover:border-blue-400/60",
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-2xl border bg-card/70 backdrop-blur-xl transition-colors duration-300 overflow-hidden group",
        glowStyles[glowColor],
        className
      )}
      {...(props as any)}
    >
      {/* Top glowing ambient gradient beam */}
      <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.15),transparent_50%)] pointer-events-none group-hover:opacity-100 opacity-60 transition-opacity" />
      
      {/* Interactive cursor light reflection */}
      {hovered && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300"
          style={{
            background: `radial-gradient(600px circle at ${
              (x.get() + 0.5) * 100
            }% ${(y.get() + 0.5) * 100}%, rgba(37, 99, 235, 0.15), transparent 40%)`,
          }}
        />
      )}

      {/* Content wrapper with translateZ depth */}
      <div className="relative z-10 [transform:translateZ(20px)] p-6">
        {children}
      </div>
    </motion.div>
  );
}
