import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Ledger: A premium 3D figure for the background.
 * Animates with floating, rotation, cursor following, and GSAP-driven glows.
 */
export default function Ledger({ isResponding }) {
  const groupRef = useRef();
  const mainMeshRef = useRef();
  const ringRef = useRef();
  const lightRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  // Handle cursor movement for tilt effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // GSAP animation for responding state (glow effect)
  useEffect(() => {
    if (isResponding) {
      gsap.to(mainMeshRef.current.material, {
        distort: 0.6,
        duration: 0.5,
      });
      gsap.to(lightRef.current, {
        intensity: 3,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
      });
    } else {
      gsap.to(mainMeshRef.current.material, {
        distort: 0.3,
        duration: 1,
      });
      gsap.to(lightRef.current, {
        intensity: 1.5,
        duration: 1,
      });
      gsap.killTweensOf(lightRef.current);
    }
  }, [isResponding]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      // Smooth tilt towards cursor
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.current.x * 0.3,
        0.1
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -mouse.current.y * 0.3,
        0.1
      );
    }

    if (mainMeshRef.current) {
      // Constant slow rotation
      mainMeshRef.current.rotation.z = t * 0.1;
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.5;
      ringRef.current.rotation.y = t * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[2, 0, -2]}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        {/* Core Figure: A distorted octahedron representing "Ledger" */}
        <mesh ref={mainMeshRef} scale={1.2}>
          <octahedronGeometry args={[1.5, 2]} />
          <MeshDistortMaterial
            color="#1e293b"
            emissive="#0f172a"
            roughness={0.2}
            metalness={0.8}
            distort={0.3}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Outer Tech Ring */}
        <mesh ref={ringRef}>
          <torusGeometry args={[2.5, 0.015, 16, 100]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.2} />
        </mesh>

        {/* Dynamic Light source */}
        <pointLight
          ref={lightRef}
          color="#38bdf8"
          intensity={1.5}
          distance={15}
          position={[0, 0, 2]}
        />
      </Float>
    </group>
  );
}
