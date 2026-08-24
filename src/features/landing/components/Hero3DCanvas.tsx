"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingBrandGeometry({ isReducedMotion }: { isReducedMotion: boolean }) {
  const meshRef1 = useRef<THREE.Mesh>(null!);
  const meshRef2 = useRef<THREE.Mesh>(null!);
  const meshRef3 = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (isReducedMotion) return;
    const t = state.clock.getElapsedTime();
    if (meshRef1.current) {
      meshRef1.current.rotation.x = t * 0.15;
      meshRef1.current.rotation.y = t * 0.2;
    }
    if (meshRef2.current) {
      meshRef2.current.rotation.x = -t * 0.1;
      meshRef2.current.rotation.z = t * 0.15;
    }
    if (meshRef3.current) {
      meshRef3.current.rotation.y = t * 0.12;
    }
  });

  return (
    <group>
      {/* Central Brand Gold Polyhedron */}
      <Float speed={isReducedMotion ? 0 : 1.5} rotationIntensity={isReducedMotion ? 0 : 0.4} floatIntensity={isReducedMotion ? 0 : 0.8}>
        <mesh ref={meshRef1} position={[0, 0.2, 0]}>
          <icosahedronGeometry args={[1.8, 1]} />
          <MeshDistortMaterial
            color="#d0ac64"
            emissive="#4a3b1a"
            roughness={0.25}
            metalness={0.85}
            distort={isReducedMotion ? 0 : 0.25}
            speed={isReducedMotion ? 0 : 1.5}
            wireframe={false}
          />
        </mesh>
      </Float>

      {/* Orbiting Subtle Dark-Gold Torus Ring */}
      <Float speed={isReducedMotion ? 0 : 1.2} rotationIntensity={isReducedMotion ? 0 : 0.6} floatIntensity={isReducedMotion ? 0 : 0.5}>
        <mesh ref={meshRef2} position={[-2.8, -0.6, -1.2]} rotation={[0.4, 0.2, 0]}>
          <torusGeometry args={[1.1, 0.15, 16, 50]} />
          <meshStandardMaterial
            color="#8c733e"
            emissive="#241d0f"
            roughness={0.3}
            metalness={0.9}
          />
        </mesh>
      </Float>

      {/* Orbiting Ambient Octahedron */}
      <Float speed={isReducedMotion ? 0 : 1.8} rotationIntensity={isReducedMotion ? 0 : 0.5} floatIntensity={isReducedMotion ? 0 : 0.7}>
        <mesh ref={meshRef3} position={[3.0, 1.0, -1.5]}>
          <octahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial
            color="#e6c987"
            emissive="#3a2f18"
            roughness={0.2}
            metalness={0.95}
            wireframe={true}
          />
        </mesh>
      </Float>
    </group>
  );
}

function ParticleNetwork({ isReducedMotion }: { isReducedMotion: boolean }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 40;

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
    }
    return [pos];
  }, []);

  useFrame((state) => {
    if (isReducedMotion || !pointsRef.current) return;
    const t = state.clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#d0ac64"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export function Hero3DCanvas() {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);

    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(208,172,100,0.15)_0%,rgba(0,0,0,0)_70%)]" />
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-75">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#fff2db" />
        <pointLight position={[-4, -3, 2]} intensity={1.2} color="#d0ac64" />
        <pointLight position={[4, 3, -2]} intensity={0.8} color="#e6c987" />

        <FloatingBrandGeometry isReducedMotion={isReducedMotion} />
        <ParticleNetwork isReducedMotion={isReducedMotion} />
      </Canvas>
    </div>
  );
}
