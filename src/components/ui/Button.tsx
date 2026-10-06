import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-black',
    secondary: 'bg-accent text-white hover:bg-accent-hover',
    outline: 'border border-neutral-300 text-primary hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizes = {
    sm: 'h-11 px-3 text-sm',
    md: 'h-12 px-4 py-2',
    lg: 'h-12 px-6 text-base',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
