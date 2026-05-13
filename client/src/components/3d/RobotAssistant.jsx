import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * RobotAssistant: A premium 3D robotic figure.
 * Features: Greeting, Thinking, and Idle animations.
 */
export default function RobotAssistant({ isResponding }) {
  const groupRef = useRef();
  const headRef = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  const lightRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  // Handle cursor movement
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

  // GSAP animations
  useEffect(() => {
    if (isResponding) {
      // "Interactive" state: Robot pops up/moves in from the side to "look" at the question
      gsap.to(groupRef.current.position, { x: 3.2, y: -0.2, z: -1.5, duration: 0.8, ease: "back.out(1.5)" });
      gsap.to(headRef.current.rotation, { x: -0.1, y: -0.4, duration: 0.5 });
      gsap.to(eyeLeftRef.current.material, { emissiveIntensity: 2.5, color: '#FFD700', duration: 0.3 });
      gsap.to(eyeRightRef.current.material, { emissiveIntensity: 2.5, color: '#FFD700', duration: 0.3 });
    } else {
      // "Idle" state: Robot moves back to a subtle side position
      gsap.to(groupRef.current.position, { x: 4, y: -0.5, z: -3, duration: 1.2, ease: "power2.inOut" });
      gsap.to(headRef.current.rotation, { x: 0, y: 0, duration: 0.8 });
      gsap.to(eyeLeftRef.current.material, { emissiveIntensity: 1.5, color: '#B87333', duration: 0.8 });
      gsap.to(eyeRightRef.current.material, { emissiveIntensity: 1.5, color: '#B87333', duration: 0.8 });
    }
  }, [isResponding]);

  // Entrance "Greeting" Animation
  useEffect(() => {
    // Initial position is slightly lower and rotated
    gsap.fromTo(groupRef.current.position, 
      { y: -5, x: 4, z: -3 }, 
      { y: -0.5, x: 4, z: -3, duration: 1.8, ease: "back.out(1.2)" }
    );
    
    // A little "nod" greeting
    gsap.fromTo(headRef.current.rotation,
      { x: -0.5 },
      { x: 0, duration: 1, delay: 1, ease: "bounce.out" }
    );
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      // Smoothly look at cursor
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouse.current.x * 0.4,
        0.1
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -mouse.current.y * 0.2,
        0.1
      );
    }

    if (headRef.current) {
      // Idle "breathing" bob
      headRef.current.position.y = Math.sin(t * 1.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[4, -0.5, -3]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        
        {/* Main Body/Torso */}
        <mesh position={[0, -0.8, 0]}>
          <cylinderGeometry args={[0.5, 0.3, 1.2, 32]} />
          <meshStandardMaterial color="#27272a" roughness={0.3} metalness={0.9} /> {/* Steel */}
        </mesh>

        {/* Neck ring */}
        <mesh position={[0, -0.1, 0]}>
          <torusGeometry args={[0.3, 0.05, 16, 32]} />
          <meshStandardMaterial emissive="#B87333" emissiveIntensity={0.5} color="#B87333" />
        </mesh>

        {/* Head */}
        <group ref={headRef}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[1.2, 0.9, 1.2]} />
            <meshStandardMaterial color="#27272a" roughness={0.3} metalness={0.9} /> {/* Steel */}
          </mesh>

          {/* Screen Face */}
          <mesh position={[0, 0.5, 0.61]}>
            <planeGeometry args={[1.0, 0.7]} />
            <meshBasicMaterial color="#050505" />
          </mesh>

          {/* Eyes */}
          <mesh ref={eyeLeftRef} position={[-0.25, 0.6, 0.62]}>
            <planeGeometry args={[0.2, 0.1]} />
            <meshStandardMaterial emissive="#B87333" emissiveIntensity={1.5} color="#B87333" />
          </mesh>
          <mesh ref={eyeRightRef} position={[0.25, 0.6, 0.62]}>
            <planeGeometry args={[0.2, 0.1]} />
            <meshStandardMaterial emissive="#B87333" emissiveIntensity={1.5} color="#B87333" />
          </mesh>

          {/* Antennas */}
          <mesh position={[-0.65, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.2]} />
            <meshStandardMaterial color="#B87333" metalness={1} roughness={0.1} /> {/* Copper */}
          </mesh>
          <mesh position={[0.65, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.2]} />
            <meshStandardMaterial color="#B87333" metalness={1} roughness={0.1} /> {/* Copper */}
          </mesh>
        </group>

        {/* Floating Rings around Robot */}
        <group onUpdate={(self) => {
          if (isResponding) {
            self.rotation.y += 0.05;
            self.rotation.z += 0.02;
          } else {
            self.rotation.y += 0.01;
          }
        }}>
          <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
            <torusGeometry args={[1.2, 0.02, 16, 100]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, -1.2, 0]} rotation={[Math.PI / 1.8, 0, 0]}>
            <torusGeometry args={[0.8, 0.02, 16, 100]} />
            <meshBasicMaterial color="#B87333" transparent opacity={0.3} />
          </mesh>
        </group>

        {/* Dynamic Light */}
        <pointLight
          ref={lightRef}
          color="#FFD700"
          intensity={1.5}
          distance={10}
          position={[0, 1, 2]}
        />
      </Float>
    </group>
  );
}
