"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 2.5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(size, size);
    container.appendChild(renderer.domElement);

    // TorusKnot geometry for high-tech AI vibe
    const geometry = new THREE.TorusKnotGeometry(0.65, 0.22, 100, 16);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      wireframe: wireframe,
      roughness: 0.2,
      metalness: 0.8,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.35,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x38bdf8, 2, 10);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x2563eb, 2, 10);
    pointLight2.position.set(-2, -2, -2);
    scene.add(pointLight2);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX = x * 0.005;
      mouseY = y * 0.005;
    };

    container.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Animation Loop using performance.now()
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const elapsedTime = (currentTime - startTime) * 0.001;

      mesh.rotation.x = elapsedTime * 0.4 + mouseY;
      mesh.rotation.y = elapsedTime * 0.6 + mouseX;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousemove", handleMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size, color, wireframe]);

  return <div ref={containerRef} className="shrink-0 pointer-events-auto" />;
}
