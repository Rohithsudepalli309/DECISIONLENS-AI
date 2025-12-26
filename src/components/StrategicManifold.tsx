
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Center, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

function ManifoldPoints({ data }: { data: any[] }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(data.length * 3);
    const cols = new Float32Array(data.length * 3);
    
    data.forEach((item, i) => {
      // Scale metrics to fit in a 10x10x10 cube
      // Cost (X), Availability (Y), Risk (Z)
      pos[i * 3] = (item.cost / 20000) * 10 - 5;
      pos[i * 3 + 1] = item.availability * 10 - 5;
      pos[i * 3 + 2] = item.risk * 10 - 5;
      
      // Color by Topsis score (Gold for high, Blue for low)
      const color = new THREE.Color().setHSL(0.6 + (item.topsis * 0.4), 0.8, 0.5);
      cols[i * 3] = color.r;
      cols[i * 3 + 1] = color.g;
      cols[i * 3 + 2] = color.r;
    });
    
    return [pos, cols];
  }, [data]);

  useFrame((state) => {
    pointsRef.current.rotation.y += 0.002;
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export function StrategicManifold({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-full min-h-[400px] bg-black/40 rounded-3xl overflow-hidden border border-white/10 relative">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">3D Strategic Manifold</h3>
        <p className="text-[8px] text-white/40 uppercase">Axis: Cost (X) | Availability (Y) | Risk (Z)</p>
      </div>
      
      <Canvas camera={{ position: [10, 10, 10], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <ManifoldPoints data={data} />
        </Float>

        <gridHelper args={[20, 20, 0x333333, 0x111111]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -5]} />
        
        <Center position={[0, -6, 0]}>
           <Text color="white" fontSize={0.5} font="/fonts/Inter-Black.woff">
              EFFICIENCY FRONTIER
           </Text>
        </Center>
      </Canvas>
    </div>
  );
}
