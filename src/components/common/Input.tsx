import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type, ...props }, ref) => {
    const id = props.id || `input-${props.name || Math.random().toString(36).substring(2, 9)}`;
    
    // Handle number type inputs
    const numberInputProps = type === 'number' ? {
      onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent specific keys for number inputs
        if (['-', 'e', '.'].includes(e.key)) {
          e.preventDefault();
        }
        // Call the original onKeyDown if it exists
        props.onKeyDown?.(e);
      },
      onWheel: (e: React.WheelEvent<HTMLInputElement>) => {
        // Prevent wheel scrolling on number inputs
        e.currentTarget.blur();
        // Call the original onWheel if it exists
        props.onWheel?.(e);
      },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        // Ensure value is at least 1 for number inputs
        if (e.target.value !== '') {
          const value = Math.max(1, parseInt(e.target.value) || 1);
          e.target.value = value.toString();
        }
        // Call the original onChange if it exists
        props.onChange?.(e);
      }
    } : {};
    
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border ${
            error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''
          } ${className}`}
          ref={ref}
          {...props}
          {...numberInputProps}
        />
        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };