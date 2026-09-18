import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const ArtisanBasketModel = () => {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle auto rotation
      groupRef.current.rotation.y = t * 0.35;
      // Gentle floating oscillation
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.12;

      // Mouse parallax tilt
      const mouseX = state.mouse.x * 0.4;
      const mouseY = state.mouse.y * 0.3;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouseY, 0.05);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, -mouseX, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Basket Base - Warm terracotta & sage tones */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[1.3, 0.9, 1.2, 18, 4, true]} />
        <meshStandardMaterial
          color="#C97B3C"
          roughness={0.7}
          metalness={0.1}
          wireframe={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Basket Base bottom disc */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.08, 18]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>

      {/* Woven Rim Rings */}
      <mesh position={[0, 0.6, 0]}>
        <torusGeometry args={[1.32, 0.09, 8, 24]} />
        <meshStandardMaterial color="#2F6F4E" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <torusGeometry args={[1.18, 0.06, 8, 24]} />
        <meshStandardMaterial color="#FAF8F5" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <torusGeometry args={[1.04, 0.06, 8, 24]} />
        <meshStandardMaterial color="#2F6F4E" roughness={0.6} />
      </mesh>

      {/* Bamboo Handle Arch */}
      <mesh position={[0, 0.7, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.2, 0.08, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#2F6F4E" roughness={0.5} />
      </mesh>

      {/* Sprouting Growth Leaves / Geometric Nodes rising out */}
      <mesh position={[0, 0.5, 0]}>
        <dodecahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial color="#2F6F4E" roughness={0.4} />
      </mesh>
      <mesh position={[0.4, 0.7, 0.2]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#E6A93C" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[-0.35, 0.8, -0.15]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#C97B3C" roughness={0.3} />
      </mesh>
      <mesh position={[0.1, 1.05, -0.1]}>
        <tetrahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#2F9E44" roughness={0.2} />
      </mesh>
    </group>
  );
};

export const Hero3DScene = () => {
  return (
    <div className="w-full h-[360px] md:h-[460px] relative">
      <Canvas
        camera={{ position: [0, 0.6, 4.2], fov: 45 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow />
        <pointLight position={[-4, -2, -2]} intensity={0.5} color="#E4EFE8" />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
          <ArtisanBasketModel />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-border text-[11px] text-text-secondary shadow-xs pointer-events-none">
        Handcrafted 3D Artisan Motif • Drag to Orbit
      </div>
    </div>
  );
};

export default Hero3DScene;
