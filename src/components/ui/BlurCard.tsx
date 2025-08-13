import { ReactNode } from 'react';

interface BlurCardProps {
  children: ReactNode;
  className?: string;
  intensity?: 'light' | 'strong';
}

export default function BlurCard({ 
  children, 
  className = '', 
  intensity = 'light' 
}: BlurCardProps) {
  const glassClass = intensity === 'strong' ? 'glass-effect-strong' : 'glass-effect';
  
  return (
    <div className={`${glassClass} rounded-[20px] shadow-lg ${className}`}>
      {children}
    </div>
  );
}