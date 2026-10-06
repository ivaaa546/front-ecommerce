import React, { forwardRef, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || props.name || generatedId;
    return (
      <div className="w-full flex flex-col space-y-2">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`flex h-12 w-full rounded-lg border ${
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-accent'
          } bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} role="alert" className="text-sm text-red-600 font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
