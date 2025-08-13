import { ReactNode, ButtonHTMLAttributes } from 'react';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'clockIn' | 'clockOut' | 'save';
  className?: string;
}

export default function GradientButton({ 
  children, 
  variant = 'clockIn', 
  className = '', 
  ...props 
}: GradientButtonProps) {
  const variantClasses = {
    clockIn: 'bg-emerald-400 hover:bg-emerald-500',
    clockOut: 'bg-blue-500 hover:bg-blue-600',
    save: 'bg-blue-500 hover:bg-blue-600'
  };

  return (
    <button
      className={`
        flex items-center justify-center gap-3 px-6 py-4 rounded-2xl
        text-white font-bold text-lg transition-all duration-200
        shadow-lg hover:shadow-xl transform hover:scale-105
        ${variantClasses[variant]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}