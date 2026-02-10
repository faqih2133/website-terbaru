import React, { useState } from "react";
import { cn } from "../../utils/cn";

const Select = React.forwardRef(({
    className,
    options = [],
    value,
    defaultValue,
    placeholder = "Select an option",
    multiple = false,
    disabled = false,
    required = false,
    label,
    description,
    error,
    onChange,
    onValueChange,
    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');

    const handleSelect = (option) => {
        if (multiple) {
            // For multiple select (simplified)
            const newValue = selectedValue.includes(option.value)
                ? selectedValue.filter(v => v !== option.value)
                : [...selectedValue, option.value];
            setSelectedValue(newValue);
            onChange?.(newValue);
            onValueChange?.(newValue);
        } else {
            setSelectedValue(option.value);
            setIsOpen(false);
            onChange?.(option.value);
            onValueChange?.(option.value);
        }
    };

    const getDisplayValue = () => {
        if (multiple) {
            if (!selectedValue || selectedValue.length === 0) return placeholder;
            const selectedLabels = options
                .filter(opt => selectedValue.includes(opt.value))
                .map(opt => opt.label);
            return selectedLabels.join(', ');
        } else {
            const selectedOption = options.find(opt => opt.value === selectedValue);
            return selectedOption ? selectedOption.label : placeholder;
        }
    };

    return (
        <div className={cn("relative", className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    className={cn(
                        "relative w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                        disabled && "bg-gray-50 cursor-not-allowed",
                        error && "border-red-500 focus:ring-red-500 focus:border-red-500"
                    )}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    ref={ref}
                    {...props}
                >
                    <span className={cn(
                        "block truncate",
                        (!selectedValue || selectedValue.length === 0) && "text-gray-500"
                    )}>
                        {getDisplayValue()}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <span className={cn(
                            "text-gray-400 transition-transform",
                            isOpen && "transform rotate-180"
                        )}>
                            ▼
                        </span>
                    </span>
                </button>

                {isOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none border border-gray-300">
                        {options.length === 0 ? (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                                No options available
                            </div>
                        ) : (
                            options.map((option, index) => {
                                const isSelected = multiple 
                                    ? selectedValue.includes(option.value)
                                    : selectedValue === option.value;

                                return (
                                    <button
                                        key={option.value || index}
                                        type="button"
                                        className={cn(
                                            "w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none",
                                            isSelected && "bg-blue-50 text-blue-600"
                                        )}
                                        onClick={() => handleSelect(option)}
                                    >
                                        <span className="flex items-center">
                                            {multiple && (
                                                <span className="mr-2">
                                                    {isSelected ? '✓' : '○'}
                                                </span>
                                            )}
                                            <span className="truncate">{option.label}</span>
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Select.displayName = "Select";
export default Select;