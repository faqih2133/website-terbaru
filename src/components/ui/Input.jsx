import React from 'react';
import { cn } from '../../utils/cn';

const Input = React.forwardRef(({
    className,
    type = 'text',
    disabled = false,
    required = false,
    label,
    description,
    error,
    ...props
}, ref) => {
    return (
        <div className={cn("space-y-1", className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <input
                type={type}
                className={cn(
                    "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    disabled && "bg-gray-50 cursor-not-allowed opacity-50",
                    error && "border-red-500 focus:ring-red-500 focus:border-red-500",
                    "text-sm"
                )}
                disabled={disabled}
                required={required}
                ref={ref}
                {...props}
            />

            {description && (
                <p className="text-sm text-gray-500">{description}</p>
            )}

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = "Input";
export default Input;