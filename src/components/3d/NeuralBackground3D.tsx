'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const NeuralBackground3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // PARTICLES & CONNECTIONS
    const particleCount = 75;
    const maxDistance = 25;
    const particlePositions: THREE.Vector3[] = [];
    const particleVelocities: THREE.Vector3[] = [];

    const geom = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 120;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 60;
      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;

      particlePositions.push(new THREE.Vector3(x, y, z));
      particleVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.02
        )
      );
    }

    geom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const pMaterial = new THREE.PointsMaterial({
      color: 0x116466,
      size: 1.5,
      transparent: true,
      opacity: 0.45,
    });
    const pSystem = new THREE.Points(geom, pMaterial);
    scene.add(pSystem);

    // LINE CONNECTIONS
    const linePositions = new Float32Array(particleCount * particleCount * 6);
    const lineColors = new Float32Array(particleCount * particleCount * 6);
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeom.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });

    const lines = new THREE.LineSegments(lineGeom, lineMaterial);
    scene.add(lines);

    // MOUSE PARALLAX
    let targetX = 0;
    let targetY = 0;
    const onMouseMove = (e: MouseEvent) => {
      targetX = ((e.clientX - width / 2) / width) * 10;
      targetY = -(((e.clientY - height / 2) / height) * 10);
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ANIMATION LOOP
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Camera parallax
      camera.position.x += (targetX - camera.position.x) * 0.02;
      camera.position.y += (targetY - camera.position.y) * 0.02;

      const pos = geom.attributes.position as THREE.BufferAttribute;
      let lineIndex = 0;

      for (let i = 0; i < particleCount; i++) {
        const p = particlePositions[i];
        const v = particleVelocities[i];

        p.add(v);
        if (p.x < -60 || p.x > 60) v.x *= -1;
        if (p.y < -50 || p.y > 50) v.y *= -1;
        if (p.z < -30 || p.z > 30) v.z *= -1;

        pos.setXYZ(i, p.x, p.y, p.z);

        // Find neighbors to connect lines
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particlePositions[j];
          const dist = p.distanceTo(p2);
          if (dist < maxDistance) {
            const alpha = 1.0 - dist / maxDistance;
            linePositions[lineIndex * 6] = p.x;
            linePositions[lineIndex * 6 + 1] = p.y;
            linePositions[lineIndex * 6 + 2] = p.z;
            linePositions[lineIndex * 6 + 3] = p2.x;
            linePositions[lineIndex * 6 + 4] = p2.y;
            linePositions[lineIndex * 6 + 5] = p2.z;

            // Soft cyan-teal to warm tan gradient
            lineColors[lineIndex * 6] = 0.06;
            lineColors[lineIndex * 6 + 1] = 0.39;
            lineColors[lineIndex * 6 + 2] = 0.4;
            lineColors[lineIndex * 6 + 3] = 0.85;
            lineColors[lineIndex * 6 + 4] = 0.69;
            lineColors[lineIndex * 6 + 5] = 0.55;

            lineIndex++;
          }
        }
      }

      pos.needsUpdate = true;
      lineGeom.setDrawRange(0, lineIndex * 2);
      lineGeom.attributes.position.needsUpdate = true;
      if (lineGeom.attributes.color) {
        lineGeom.attributes.color.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geom.dispose();
      pMaterial.dispose();
      lineGeom.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-40 overflow-hidden"
      aria-hidden="true"
    />
  );
};

export default NeuralBackground3D;
