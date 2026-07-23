"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeDBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup with explicit solid space dark background color to prevent Chrome WebGL compositor gray bleed
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070d);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      1,
      800
    );
    camera.position.z = 380;

    // WebGL Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      alpha: false, 
      antialias: false,
      powerPreference: "high-performance" 
    });
    renderer.setClearColor(0x05070d, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Group for 3D objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- Object 1: Low-poly Icosahedron Wireframe ---
    const icoGeo = new THREE.IcosahedronGeometry(110, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoMat);
    mainGroup.add(icoMesh);

    // Inner glowing sphere core
    const innerGeo = new THREE.IcosahedronGeometry(52, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // --- Object 2: Particle Constellation Cloud ---
    const particleCount = 220;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x2563eb);
    const color2 = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 1200;
      positions[i3 + 1] = (Math.random() - 0.5) * 1200;
      positions[i3 + 2] = (Math.random() - 0.5) * 800;

      const pColor = Math.random() < 0.6 ? color1 : color2;
      colors[i3] = pColor.r;
      colors[i3 + 1] = pColor.g;
      colors[i3 + 2] = pColor.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const pMaterial = new THREE.PointsMaterial({
      size: 5,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, pMaterial);
    mainGroup.add(particles);

    // Mouse Parallax Throttling
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - window.innerWidth / 2) * 0.08;
      targetMouseY = (e.clientY - window.innerHeight / 2) * 0.08;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // High performance animation loop using performance.now()
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const currentTime = performance.now();
      const elapsedTime = (currentTime - startTime) * 0.001;

      // Smooth interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      mainGroup.rotation.y = elapsedTime * 0.08 + mouseX * 0.0002;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.08 + mouseY * 0.0002;

      icoMesh.rotation.x = elapsedTime * 0.12;
      icoMesh.rotation.y = elapsedTime * 0.15;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
}
