import React from 'react';
import { cn } from '../../utils/cn';

const Checkbox = React.forwardRef(({
    className,
    checked = false,
    defaultChecked,
    disabled = false,
    required = false,
    label,
    description,
    error,
    onCheckedChange,
    ...props
}, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || defaultChecked || false);

    const handleChange = (e) => {
        const newChecked = e.target.checked;
        setIsChecked(newChecked);
        onCheckedChange?.(newChecked);
    };

    return (
        <div className={cn("flex items-start space-x-3", className)}>
            <div className="relative">
                <input
                    type="checkbox"
                    className={cn(
                        "h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    checked={isChecked}
                    disabled={disabled}
                    required={required}
                    onChange={handleChange}
                    ref={ref}
                    {...props}
                />
            </div>

            <div className="flex-1 min-w-0">
                {label && (
                    <label className="text-sm font-medium text-gray-700 cursor-pointer">
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                {description && (
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}

                {error && (
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                )}
            </div>
        </div>
    );
});

// ... existing code ...

Checkbox.displayName = "Checkbox";

// Default export (untuk import default)
export default Checkbox;

// Named export (untuk import { Checkbox })
export { Checkbox };