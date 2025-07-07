import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Torus, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingElementProps {
  position: [number, number, number];
  delay?: number;
  speed?: number;
  color?: string;
}

export const FloatingSphere = ({ position, delay = 0, speed = 1, color = "#00ff88" }: FloatingElementProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed + delay) * 0.2;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * speed * 0.8 + delay) * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed + delay) * 0.5;
      
      if (hovered) {
        meshRef.current.scale.setScalar(1.2);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <Sphere
      ref={meshRef}
      args={[0.8, 32, 32]}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={hovered ? 0.3 : 0.1}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
};

export const FloatingCube = ({ position, delay = 0, speed = 1, color = "#ff6b00" }: FloatingElementProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.5 + delay;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.3 + delay;
      meshRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * speed + delay) * 0.3;
    }
  });

  return (
    <Box
      ref={meshRef}
      args={[1, 1, 1]}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={hovered ? 0.4 : 0.1}
        transparent
        opacity={0.9}
      />
    </Box>
  );
};

export const FloatingTorus = ({ position, delay = 0, speed = 1, color = "#ff0088" }: FloatingElementProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed + delay) * 0.4;
      meshRef.current.rotation.z = state.clock.elapsedTime * speed * 0.2 + delay;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 1.2 + delay) * 0.4;
    }
  });

  return (
    <Torus
      ref={meshRef}
      args={[0.8, 0.3, 16, 100]}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={hovered ? 0.3 : 0.1}
        transparent
        opacity={0.8}
      />
    </Torus>
  );
};

export const FloatingIcosahedron = ({ position, delay = 0, speed = 1, color = "#00ffff" }: FloatingElementProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3 + delay;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.4 + delay;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * speed + delay) * 0.2;
      meshRef.current.position.y = position[1] + Math.cos(state.clock.elapsedTime * speed * 0.8 + delay) * 0.6;
    }
  });

  return (
    <Icosahedron
      ref={meshRef}
      args={[0.7, 0]}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={hovered ? 0.3 : 0.1}
        transparent
        opacity={0.8}
        wireframe={hovered}
      />
    </Icosahedron>
  );
};