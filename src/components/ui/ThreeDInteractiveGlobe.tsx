"use client";

import { motion } from "framer-motion";

interface ThreeDInteractiveGlobeProps {
  size?: number;
  color?: string;
  wireframe?: boolean;
}

export function ThreeDInteractiveGlobe({
  size = 120,
  color = "#2563eb",
  wireframe = true,
}: ThreeDInteractiveGlobeProps) {
  return (
    <div 
      className="shrink-0 flex items-center justify-center pointer-events-none relative"
      style={{ 
        width: size, 
        height: size,
        perspective: "1200px" // Adds true 3D depth for the spin
      }}
    >
      <motion.div
        className="w-full h-full relative flex items-center justify-center"
        animate={{ 
          rotateY: [0, 360], // Continuous 360-degree automated spin
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "linear" // Linear gives it that consistent, mechanical "automated" feel
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <img
          src="/white-icon.png"
          alt="Three Dine Logo"
          style={{
            width: '85%',
            height: '85%',
            objectFit: 'contain',
            opacity: 0.85, // Makes the logo transparent/HUD-like
            mixBlendMode: "screen", // Blends it like a light projection
            filter: `drop-shadow(0 0 10px ${color})`, // Clean, sharp glow
          }}
        />
      </motion.div>
    </div>
  );
}
