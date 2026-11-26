'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface PhonationOrb3DProps {
  analyser?: AnalyserNode | null;
  isRecording?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const PhonationOrb3D: React.FC<PhonationOrb3DProps> = ({
  analyser,
  isRecording = false,
  isLoading = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isRecordingRef = useRef(isRecording);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    analyserRef.current = analyser ?? null;
  }, [analyser]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // SCENE & CAMERA
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

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

    // ROOT ORB GROUP
    const group = new THREE.Group();
    scene.add(group);

    // 1. DEFORMABLE AUDIO SPHERE (Icosahedron with sub-divisions)
    const sphereGeo = new THREE.IcosahedronGeometry(1.8, 4);
    const posAttr = sphereGeo.attributes.position;
    const originalPositions = Float32Array.from(posAttr.array);

    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0x116466,
      emissive: 0x0c4b4d,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.7,
      wireframe: false,
      transparent: true,
      opacity: 0.9,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    group.add(sphereMesh);

    // 2. OUTER HOLOGRAPHIC SCAN WIREFRAME
    const wireGeo = new THREE.IcosahedronGeometry(2.1, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xd9b08c,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    group.add(wireMesh);

    // 3. SCANNER LASER RING (for analyzing state)
    const scanRingGeo = new THREE.TorusGeometry(2.3, 0.03, 16, 80);
    const scanRingMat = new THREE.MeshBasicMaterial({
      color: 0xffcb9a,
      transparent: true,
      opacity: 0,
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scanRing.rotation.x = Math.PI / 2;
    group.add(scanRing);

    // 4. AUDIO PARTICLES
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = 2.4 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particlePos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePos[i * 3 + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xd1e8e2,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // 5. LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0x116466, 3, 15);
    light1.position.set(3, 3, 3);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xffcb9a, 2, 15);
    light2.position.set(-3, -2, 2);
    scene.add(light2);

    // RESIZE
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 280;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // FREQUENCY DATA BUFFER
    const freqData = new Uint8Array(64);

    // ANIMATION
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const recording = isRecordingRef.current;
      const loading = isLoadingRef.current;
      const node = analyserRef.current;

      group.rotation.y = time * 0.35;
      wireMesh.rotation.y = -time * 0.25;
      particles.rotation.y = time * 0.15;

      // Extract real audio frequency data if available
      let audioEnergy = 0;
      if (recording && node) {
        try {
          node.getByteFrequencyData(freqData);
          let sum = 0;
          for (let i = 0; i < 32; i++) {
            sum += freqData[i];
          }
          audioEnergy = (sum / 32) / 255; // 0.0 to 1.0
        } catch {}
      }

      // Dynamic Material & Deformations based on state
      if (loading) {
        // High-tech laser scanning animation
        sphereMat.color.setHex(0x116466);
        sphereMat.emissive.setHex(0x116466);
        sphereMat.emissiveIntensity = 0.9;
        wireMat.opacity = 0.7;
        scanRingMat.opacity = 0.9;
        scanRing.position.y = Math.sin(time * 4) * 1.8;

        const positions = sphereGeo.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const ox = originalPositions[i * 3];
          const oy = originalPositions[i * 3 + 1];
          const oz = originalPositions[i * 3 + 2];
          const scanPulse = Math.abs(oy - scanRing.position.y) < 0.3 ? 1.25 : 1.0;
          positions.setXYZ(i, ox * scanPulse, oy * scanPulse, oz * scanPulse);
        }
        positions.needsUpdate = true;
      } else if (recording) {
        // Voice-reactive deformation (Micro-tremors + pitch)
        sphereMat.color.setHex(0xb84a39); // Warm coral when recording
        sphereMat.emissive.setHex(0x8a2c20);
        sphereMat.emissiveIntensity = 0.7 + audioEnergy * 0.6;
        wireMat.opacity = 0.5 + audioEnergy * 0.4;
        scanRingMat.opacity = 0;

        const positions = sphereGeo.attributes.position;
        const reactiveFactor = 0.08 + audioEnergy * 0.45;

        for (let i = 0; i < positions.count; i++) {
          const ox = originalPositions[i * 3];
          const oy = originalPositions[i * 3 + 1];
          const oz = originalPositions[i * 3 + 2];

          // Harmonic perturbation
          const perturbation =
            Math.sin(ox * 4 + time * 8) *
            Math.cos(oy * 4 + time * 6) *
            Math.sin(oz * 4 + time * 10);

          const scale = 1 + perturbation * reactiveFactor;
          positions.setXYZ(i, ox * scale, oy * scale, oz * scale);
        }
        positions.needsUpdate = true;
      } else {
        // Idle state: gentle rhythmic breathing
        sphereMat.color.setHex(0x116466);
        sphereMat.emissive.setHex(0x0c4b4d);
        sphereMat.emissiveIntensity = 0.5;
        wireMat.opacity = 0.3;
        scanRingMat.opacity = 0;

        const positions = sphereGeo.attributes.position;
        const breath = Math.sin(time * 1.8) * 0.06;

        for (let i = 0; i < positions.count; i++) {
          const ox = originalPositions[i * 3];
          const oy = originalPositions[i * 3 + 1];
          const oz = originalPositions[i * 3 + 2];
          const scale = 1 + breath;
          positions.setXYZ(i, ox * scale, oy * scale, oz * scale);
        }
        positions.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeo.dispose();
      sphereMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      scanRingGeo.dispose();
      scanRingMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div ref={containerRef} className="w-full h-full min-h-[260px] relative pointer-events-none" />
      
      {/* Dynamic 3D Status Overlay Badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md border border-[#116466]/20 text-[11px] font-mono text-[#2C3531] shadow-xs flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            isRecording
              ? 'bg-[#B84A39] animate-ping'
              : isLoading
              ? 'bg-[#116466] animate-pulse'
              : 'bg-[#116466]'
          }`}
        />
        <span>
          {isRecording
            ? '3D Acoustic Phonation Active'
            : isLoading
            ? '3D Quantum Signal Decomposition'
            : '3D Voice Receptor Ready'}
        </span>
      </div>
    </div>
  );
};

export default PhonationOrb3D;
