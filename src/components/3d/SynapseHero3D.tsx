'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Activity, Brain, Disc, RefreshCw, Zap } from 'lucide-react';

type VisualizationMode = 'resonance' | 'orbits' | 'synapse';

export const SynapseHero3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMode, setActiveMode] = useState<VisualizationMode>('resonance');
  const [isInteracting, setIsInteracting] = useState(false);
  const [fps, setFps] = useState(60);

  // Mode reference for the animation loop
  const modeRef = useRef<VisualizationMode>(activeMode);
  useEffect(() => {
    modeRef.current = activeMode;
  }, [activeMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported, falling back');
      return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight || 520;

    // SCENE & CAMERA
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 11;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ROOT PIVOT GROUP FOR USER ROTATION
    const pivot = new THREE.Group();
    scene.add(pivot);

    // 1. INNER GLOW CORE (Organic Voice Sphere)
    const innerGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x116466,
      emissive: 0x0c4b4d,
      emissiveIntensity: 0.6,
      roughness: 0.25,
      metalness: 0.8,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    pivot.add(innerMesh);

    // Store original vertices for deformation animation
    const innerPosAttr = innerGeo.attributes.position;
    const originalPositions = Float32Array.from(innerPosAttr.array);

    // 2. SYNAPTIC LATTICE (Wireframe Icosahedron)
    const latticeGeo = new THREE.IcosahedronGeometry(2.3, 2);
    const latticeMat = new THREE.MeshBasicMaterial({
      color: 0xd9b08c,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const latticeMesh = new THREE.Mesh(latticeGeo, latticeMat);
    pivot.add(latticeMesh);

    // 3. SYNAPSE JUNCTION NODES (Points at vertices)
    const nodesMat = new THREE.PointsMaterial({
      color: 0xffcb9a,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
    });
    const nodesMesh = new THREE.Points(latticeGeo, nodesMat);
    pivot.add(nodesMesh);

    // 4. ACOUSTIC ORBITAL RINGS
    const createOrbitRing = (radius: number, tiltX: number, tiltY: number, color: number) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.022, 16, 120);
      const ringMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
        roughness: 0.3,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = tiltX;
      ringMesh.rotation.y = tiltY;

      // Add orbiting satellite beacon
      const satGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const satellite = new THREE.Mesh(satGeo, satMat);
      ringMesh.add(satellite);

      return { ringMesh, satellite, radius };
    };

    const ringF0 = createOrbitRing(3.2, Math.PI / 4, Math.PI / 6, 0x116466); // Pitch
    const ringJitter = createOrbitRing(3.8, -Math.PI / 3, Math.PI / 4, 0xd9b08c); // Jitter
    const ringShimmer = createOrbitRing(4.4, Math.PI / 2.5, -Math.PI / 5, 0xffcb9a); // Shimmer

    pivot.add(ringF0.ringMesh);
    pivot.add(ringJitter.ringMesh);
    pivot.add(ringShimmer.ringMesh);

    // 5. AMBIENT PARTICLE CONSTELLATION
    const particleCount = 350;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 3.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xd1e8e2,
      size: 0.065,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleCloud = new THREE.Points(particleGeo, particleMat);
    pivot.add(particleCloud);

    // 6. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x116466, 3, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffcb9a, 2.5, 20);
    pointLight2.position.set(-5, -3, 3);
    scene.add(pointLight2);

    // INTERACTION STATE
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotationX = 0.15;
    let targetRotationY = 0.2;
    let rotationVelocityX = 0;
    let rotationVelocityY = 0.003;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      setIsInteracting(true);
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        rotationVelocityY = deltaX * 0.006;
        rotationVelocityX = deltaY * 0.006;
        targetRotationY += rotationVelocityY;
        targetRotationX += rotationVelocityX;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Subtle Parallax follow when hovering
        targetRotationY = mouseX * 0.45;
        targetRotationX = -mouseY * 0.35;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        setIsInteracting(true);
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        targetRotationY += deltaX * 0.008;
        targetRotationX += deltaY * 0.008;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);

    // RESIZE OBSERVER
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION LOOP
    let animId: number;
    let clock = new THREE.Clock();
    let frameCount = 0;
    let lastTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const currentMode = modeRef.current;

      // Smooth damping interpolation
      if (!isDragging) {
        pivot.rotation.y += (targetRotationY - pivot.rotation.y) * 0.05 + 0.0025;
        pivot.rotation.x += (targetRotationX - pivot.rotation.x) * 0.05;
      } else {
        pivot.rotation.y = targetRotationY;
        pivot.rotation.x = targetRotationX;
      }

      // 1. Organic Voice Ripple Deformation (Vocal Cord Vibration simulation)
      const positions = innerGeo.attributes.position;
      const pulseSpeed = currentMode === 'resonance' ? 3.5 : 2.0;
      const pulseStrength = currentMode === 'resonance' ? 0.18 : 0.09;

      for (let i = 0; i < positions.count; i++) {
        const ox = originalPositions[i * 3];
        const oy = originalPositions[i * 3 + 1];
        const oz = originalPositions[i * 3 + 2];

        // 3D acoustic harmonic wave
        const wave =
          Math.sin(ox * 2.5 + elapsedTime * pulseSpeed) *
          Math.cos(oy * 2.5 + elapsedTime * (pulseSpeed * 0.8)) *
          Math.sin(oz * 2.5 + elapsedTime * 1.5);

        const factor = 1 + wave * pulseStrength;
        positions.setXYZ(i, ox * factor, oy * factor, oz * factor);
      }
      positions.needsUpdate = true;
      innerGeo.computeVertexNormals();

      // 2. Counter-rotating synaptic lattice
      latticeMesh.rotation.y = -elapsedTime * 0.18;
      latticeMesh.rotation.z = Math.sin(elapsedTime * 0.25) * 0.15;
      nodesMesh.rotation.copy(latticeMesh.rotation);

      // 3. Orbiting ring satellites
      const satSpeed = currentMode === 'orbits' ? 2.5 : 1.2;
      const angleF0 = elapsedTime * satSpeed;
      const angleJitter = -elapsedTime * (satSpeed * 0.85);
      const angleShimmer = elapsedTime * (satSpeed * 0.7);

      ringF0.satellite.position.set(
        Math.cos(angleF0) * ringF0.radius,
        Math.sin(angleF0) * ringF0.radius,
        0
      );
      ringJitter.satellite.position.set(
        Math.cos(angleJitter) * ringJitter.radius,
        Math.sin(angleJitter) * ringJitter.radius,
        0
      );
      ringShimmer.satellite.position.set(
        Math.cos(angleShimmer) * ringShimmer.radius,
        Math.sin(angleShimmer) * ringShimmer.radius,
        0
      );

      // 4. Ambient particle cloud drift
      particleCloud.rotation.y = elapsedTime * 0.04;
      particleCloud.rotation.x = Math.sin(elapsedTime * 0.05) * 0.05;

      // 5. Dynamic mode effects
      if (currentMode === 'synapse') {
        latticeMat.opacity = 0.85;
        nodesMat.size = 0.18;
        innerMat.opacity = 0.45;
      } else if (currentMode === 'resonance') {
        latticeMat.opacity = 0.35;
        nodesMat.size = 0.1;
        innerMat.opacity = 0.95;
      } else {
        latticeMat.opacity = 0.45;
        nodesMat.size = 0.12;
        innerMat.opacity = 0.75;
      }

      renderer.render(scene, camera);

      // FPS tracking for performance stats
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
    };

    animId = requestAnimationFrame(animate);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      innerGeo.dispose();
      innerMat.dispose();
      latticeGeo.dispose();
      latticeMat.dispose();
      nodesMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-[#116466]/10 via-[#2C3531]/5 to-transparent border border-[#116466]/20 shadow-[0_20px_50px_rgba(17,100,102,0.12)]">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-[460px] sm:h-[540px] lg:h-[600px] cursor-grab active:cursor-grabbing relative"
      />

      {/* Floating 3D Holographic Annotation Badges */}
      <div className="pointer-events-none absolute inset-0 p-4 sm:p-6 flex flex-col justify-between">
        {/* Top Floating Badges */}
        <div className="flex items-center justify-between">
          <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#116466]/20 shadow-xs text-xs font-mono text-[#116466]">
            <span className="w-2 h-2 rounded-full bg-[#116466] animate-pulse" />
            <span>3D Acoustic Lattice &middot; 22 Biomarkers</span>
          </div>

          <div className="pointer-events-auto hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C3531]/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono">
            <span>WebGL 60FPS</span>
            <span className="text-[#FFCB9A]">({fps} fps)</span>
          </div>
        </div>

        {/* Center Hint (shows when idle) */}
        {!isInteracting && (
          <div className="pointer-events-none text-center transform -translate-y-6">
            <span className="inline-block px-3.5 py-1 rounded-full bg-white/70 backdrop-blur-xs text-[11px] font-mono text-[#2C3531]/70 border border-[#2C3531]/10">
              Drag to rotate &bull; Hover to pulse
            </span>
          </div>
        )}

        {/* Bottom Interactive Mode Controls */}
        <div className="pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/85 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-[#116466]/15 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-[#2C3531]/80 font-medium px-2">
            <Zap className="w-4 h-4 text-[#116466]" />
            <span className="hidden sm:inline">Vocal Dynamics:</span>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveMode('resonance')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeMode === 'resonance'
                  ? 'bg-[#116466] text-white shadow-xs'
                  : 'bg-transparent text-[#2C3531]/70 hover:bg-[#116466]/10'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Resonance</span>
            </button>

            <button
              onClick={() => setActiveMode('orbits')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeMode === 'orbits'
                  ? 'bg-[#116466] text-white shadow-xs'
                  : 'bg-transparent text-[#2C3531]/70 hover:bg-[#116466]/10'
              }`}
            >
              <Disc className="w-3.5 h-3.5" />
              <span>Praat Orbits</span>
            </button>

            <button
              onClick={() => setActiveMode('synapse')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeMode === 'synapse'
                  ? 'bg-[#116466] text-white shadow-xs'
                  : 'bg-transparent text-[#2C3531]/70 hover:bg-[#116466]/10'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Synapse Mesh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynapseHero3D;
