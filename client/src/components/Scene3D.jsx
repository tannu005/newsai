import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import RobotAssistant from './3d/RobotAssistant';

export default function Scene3D({ isResponding }) {
  return (
    <div className="scene-3d-container">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting Environment */}
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight
            position={[-10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1.5}
            castShadow
          />

          {/* Interactive Robot Assistant */}
          <RobotAssistant isResponding={isResponding} />

          {/* Shadows for grounded feel */}
          <ContactShadows
            position={[3, -2.5, -3]}
            opacity={0.4}
            scale={10}
            blur={2}
            far={4.5}
          />

          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
