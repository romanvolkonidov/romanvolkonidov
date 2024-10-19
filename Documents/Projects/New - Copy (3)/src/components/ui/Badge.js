import React from 'react';

const variantClasses = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
};

export const Badge = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  return (
    <span
      className={`
        inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};