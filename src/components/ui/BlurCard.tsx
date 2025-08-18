import { ReactNode, memo } from 'react';

interface BlurCardProps {
  children: ReactNode;
  className?: string;
  intensity?: 'light' | 'strong';
  role?: string;
  'aria-label'?: string;
}

const BlurCard = memo(function BlurCard({ 
  children, 
  className = '', 
  intensity = 'light',
  role,
  'aria-label': ariaLabel
}: BlurCardProps) {
  const glassClass = intensity === 'strong' ? 'glass-effect-strong' : 'glass-effect';
  
  return (
    <div 
      className={`${glassClass} rounded-[20px] shadow-lg ${className}`}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
});

export default BlurCard;