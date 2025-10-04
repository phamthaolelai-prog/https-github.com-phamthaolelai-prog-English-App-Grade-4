
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'next' | 'primary';
  pressed?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({ children, variant = 'default', pressed = false, className, ...props }) => {
  const baseClasses = 'w-14 h-14 rounded-2xl border flex items-center justify-center transition-transform active:translate-y-px disabled:opacity-50';
  
  const variantClasses = {
    default: 'border-[color:var(--frame)] bg-white',
    next: 'border-none bg-[color:var(--accent)] text-white',
    primary: 'border-none bg-[color:var(--brand)] text-white',
  };
  
  const pressedClasses = pressed ? 'outline-3 outline outline-offset-2 outline-blue-200 bg-indigo-100' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${pressedClasses} ${className}`}
      aria-pressed={pressed}
      {...props}
    >
      {children}
    </button>
  );
};
