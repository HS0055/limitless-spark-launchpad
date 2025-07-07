import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface InteractiveCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}

export const InteractiveCard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  delay = 0 
}: InteractiveCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    
    setMousePosition({ x: x * 10, y: y * 10 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <Card 
      ref={cardRef}
      className={`group relative overflow-hidden cursor-pointer transition-all duration-500 ease-out animate-scale-in hover:scale-105`}
      style={{ 
        animationDelay: `${delay}s`,
        transform: `perspective(1000px) rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg) translateZ(${isHovered ? '20px' : '0px'})`,
        transition: 'transform 0.3s ease-out'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />
      
      {/* Shimmer Effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)`,
          transform: `translateX(${isHovered ? '100%' : '-100%'})`,
          transition: 'transform 0.7s ease-out'
        }}
      />
      
      {/* Content */}
      <CardContent className="relative z-10 p-8 text-center">
        <div 
          className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}
          style={{
            transform: `translateZ(${isHovered ? '10px' : '0px'})`,
          }}
        >
          <Icon className="w-10 h-10 text-primary-foreground" />
        </div>
        
        <h3 
          className="text-xl font-display font-bold mb-4 text-gradient-secondary transition-all duration-300"
          style={{
            transform: `translateZ(${isHovered ? '5px' : '0px'})`,
          }}
        >
          {title}
        </h3>
        
        <p 
          className="text-muted-foreground leading-relaxed transition-all duration-300"
          style={{
            transform: `translateZ(${isHovered ? '3px' : '0px'})`,
          }}
        >
          {description}
        </p>
      </CardContent>
      
      {/* Border Glow */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, hsl(var(--primary)) 50%, transparent)`,
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'exclude',
        }}
      />
    </Card>
  );
};