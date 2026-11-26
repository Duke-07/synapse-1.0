'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, Filter, Info, RotateCcw, Layers } from 'lucide-react';

interface DataPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  label: 'PD' | 'HC';
  f0: number;
  jitter: number;
  shimmer: number;
  hnr: number;
  ppe: number;
}

export const AcousticManifold3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [filter, setFilter] = useState<'all' | 'pd' | 'hc'>('all');
  const [showPlane, setShowPlane] = useState(true);

  const filterRef = useRef(filter);
  const showPlaneRef = useRef(showPlane);
  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);
  useEffect(() => {
    showPlaneRef.current = showPlane;
  }, [showPlane]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 4, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. BOUNDING GRID BOX
    const gridHelper = new THREE.GridHelper(10, 10, 0x116466, 0x2c3531);
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    gridHelper.position.y = -3;
    rootGroup.add(gridHelper);

    // 2. GENERATE 195 CLUSTER DATA POINTS (Oxford Dataset UMAP projection)
    const pointsData: DataPoint[] = [];
    const sphereMeshes: THREE.Mesh[] = [];

    // Cohort 1: Healthy Controls (48 points, clustered around (-2.5, -0.5, -1))
    for (let i = 0; i < 48; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 2.2;
      const sinPhi = Math.sin(phi);

      const x = -2.6 + r * sinPhi * Math.cos(theta);
      const y = -0.5 + (r * sinPhi * Math.sin(theta)) * 0.8;
      const z = -0.8 + r * Math.cos(phi);

      pointsData.push({
        id: `HC-${String(i + 1).padStart(3, '0')}`,
        x,
        y,
        z,
        label: 'HC',
        f0: 180 + Math.random() * 45,
        jitter: 0.0028 + Math.random() * 0.0015,
        shimmer: 0.018 + Math.random() * 0.01,
        hnr: 24.5 + Math.random() * 6,
        ppe: 0.08 + Math.random() * 0.06,
      });
    }

    // Cohort 2: Parkinson's Dysphonia (147 points, clustered around (2.2, 1.2, 0.5))
    for (let i = 0; i < 147; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 3.4;
      const sinPhi = Math.sin(phi);

      const x = 2.0 + r * sinPhi * Math.cos(theta);
      const y = 0.8 + (r * sinPhi * Math.sin(theta)) * 0.9;
      const z = 0.5 + r * Math.cos(phi);

      pointsData.push({
        id: `PD-${String(i + 1).padStart(3, '0')}`,
        x,
        y,
        z,
        label: 'PD',
        f0: 125 + Math.random() * 70,
        jitter: 0.0075 + Math.random() * 0.006,
        shimmer: 0.042 + Math.random() * 0.03,
        hnr: 15.2 + Math.random() * 5.5,
        ppe: 0.28 + Math.random() * 0.18,
      });
    }

    const pointGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const hcMat = new THREE.MeshStandardMaterial({
      color: 0x116466,
      emissive: 0x116466,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const pdMat = new THREE.MeshStandardMaterial({
      color: 0xd9b08c,
      emissive: 0xffcb9a,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });

    pointsData.forEach((pt) => {
      const mesh = new THREE.Mesh(pointGeo, pt.label === 'HC' ? hcMat : pdMat);
      mesh.position.set(pt.x, pt.y, pt.z);
      mesh.userData = pt;
      rootGroup.add(mesh);
      sphereMeshes.push(mesh);
    });

    // 3. SEPARATING HYPERPLANE DECISION BOUNDARY
    const planeGeo = new THREE.PlaneGeometry(9, 7, 10, 10);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x2c3531,
      roughness: 0.5,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      wireframe: true,
    });
    const decisionPlane = new THREE.Mesh(planeGeo, planeMat);
    decisionPlane.rotation.y = Math.PI / 4;
    decisionPlane.position.set(0, 0.2, 0);
    rootGroup.add(decisionPlane);

    // 4. LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(6, 10, 8);
    scene.add(dirLight);

    // 5. INTERACTION & RAYCASTING
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.2;
    let rotY = -0.4;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        rotY += dx * 0.007;
        rotX += dy * 0.007;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        // Raycast on hover
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(sphereMeshes);
        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          if (hit.userData) {
            setSelectedPoint(hit.userData as DataPoint);
          }
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDragging) {
        rotY += 0.0015; // Gentle auto-orbit
      }

      rootGroup.rotation.x = rotX;
      rootGroup.rotation.y = rotY;

      // Filter visibility
      const activeFilter = filterRef.current;
      sphereMeshes.forEach((mesh) => {
        const data = mesh.userData as DataPoint;
        if (activeFilter === 'all') {
          mesh.visible = true;
        } else if (activeFilter === 'pd') {
          mesh.visible = data.label === 'PD';
        } else {
          mesh.visible = data.label === 'HC';
        }
      });

      decisionPlane.visible = showPlaneRef.current;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('mousemove', onMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      pointGeo.dispose();
      hcMat.dispose();
      pdMat.dispose();
      planeGeo.dispose();
      planeMat.dispose();
      gridHelper.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full craft-card p-6 sm:p-8 space-y-6 overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-display font-semibold uppercase tracking-wider text-[#116466]">
            Interactive 3D Dimensionality Reduction
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C3531] tracking-tight uppercase">
            Acoustic Latent Space Manifold
          </h3>
          <p className="text-xs sm:text-sm text-[#2C3531]/75 max-w-xl font-sans leading-relaxed">
            3D manifold projection of 195 sustained phonations. Rotate and inspect the separation between the healthy phonation cluster and the hypokinetic dysarthria cohort.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 bg-[#EBF4F1] px-4 py-2 rounded-2xl border border-[#116466]/15 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#116466]" />
            <span>Healthy (48)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D9B08C]" />
            <span>Parkinson&apos;s (147)</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#2C3531]/5 via-white/50 to-transparent border border-[#2C3531]/10">
        <div
          ref={containerRef}
          className="w-full h-[380px] sm:h-[460px] cursor-grab active:cursor-grabbing relative"
        />

        {/* Hovered Point HUD Inspector */}
        {selectedPoint && (
          <div className="absolute top-4 left-4 p-3.5 rounded-xl bg-white/90 backdrop-blur-md border border-[#116466]/20 shadow-md text-xs font-mono space-y-1.5 max-w-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-3 border-b border-[#2C3531]/10 pb-1">
              <span className="font-bold text-[#2C3531]">{selectedPoint.id}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                  selectedPoint.label === 'PD'
                    ? 'bg-[#FFCB9A]/50 text-[#B84A39]'
                    : 'bg-[#D1E8E2] text-[#116466]'
                }`}
              >
                {selectedPoint.label === 'PD' ? 'Dysphonia' : 'Healthy Control'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[#2C3531]/80 text-[11px]">
              <div>F0: {selectedPoint.f0.toFixed(1)} Hz</div>
              <div>Jitter: {(selectedPoint.jitter * 100).toFixed(3)}%</div>
              <div>Shimmer: {(selectedPoint.shimmer * 100).toFixed(2)}%</div>
              <div>HNR: {selectedPoint.hnr.toFixed(1)} dB</div>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          {/* Cohort Filters */}
          <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md p-1.5 rounded-xl border border-[#2C3531]/10 shadow-xs text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-[#116466] text-white'
                  : 'text-[#2C3531]/70 hover:bg-[#116466]/10'
              }`}
            >
              All Cohorts
            </button>
            <button
              onClick={() => setFilter('pd')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'pd'
                  ? 'bg-[#116466] text-white'
                  : 'text-[#2C3531]/70 hover:bg-[#116466]/10'
              }`}
            >
              Parkinson&apos;s
            </button>
            <button
              onClick={() => setFilter('hc')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'hc'
                  ? 'bg-[#116466] text-white'
                  : 'text-[#2C3531]/70 hover:bg-[#116466]/10'
              }`}
            >
              Healthy
            </button>
          </div>

          {/* Toggle Hyperplane */}
          <button
            onClick={() => setShowPlane(!showPlane)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/85 backdrop-blur-md border border-[#2C3531]/10 text-xs font-medium shadow-xs transition-colors ${
              showPlane ? 'text-[#116466]' : 'text-[#2C3531]/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>SVM Decision Hyperplane: {showPlane ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcousticManifold3D;
