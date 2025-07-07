import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { FloatingSphere, FloatingCube, FloatingTorus, FloatingIcosahedron } from './FloatingElements';

interface Scene3DProps {
  className?: string;
  enableControls?: boolean;
}

export const Scene3D = ({ className = "", enableControls = false }: Scene3DProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff6b00" />
        <pointLight position={[10, -10, 5]} intensity={0.5} color="#00ff88" />
        
        {/* Environment */}
        <Environment preset="night" />
        
        {/* Floating Elements */}
        <FloatingSphere position={[-3, 2, 0]} delay={0} speed={0.8} color="#00ff88" />
        <FloatingCube position={[3, -1, -2]} delay={1} speed={1.2} color="#ff6b00" />
        <FloatingTorus position={[0, 1, -1]} delay={2} speed={0.6} color="#ff0088" />
        <FloatingIcosahedron position={[-2, -2, 1]} delay={3} speed={1} color="#00ffff" />
        <FloatingSphere position={[4, 3, -3]} delay={4} speed={0.9} color="#ff6b00" />
        <FloatingTorus position={[-4, 0, 2]} delay={5} speed={0.7} color="#00ff88" />
        
        {/* Controls */}
        {enableControls && (
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        )}
      </Canvas>
    </div>
  );
};