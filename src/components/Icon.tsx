import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export type IconName = keyof typeof Icons;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const Icon = ({ name, className, size = 24, color = 'currentColor', strokeWidth = 2, ...rest }: IconProps) => {
  const context = useLanguage(); // Triggers re-render on language switch
  
  const LucideIcon = Icons[name] as React.ComponentType<any>;
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }
  
  return <LucideIcon className={cn('inline-block', className)} size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
};

export default Icon;