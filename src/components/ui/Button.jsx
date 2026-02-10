import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({
    className,
    variant = 'default',
    size = 'default',
    children,
    loading = false,
    iconName = null,
    iconPosition = 'left',
    fullWidth = false,
    disabled = false,
    ...props
}, ref) => {
    // Variant styles
    const variants = {
        default: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
        outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700 bg-white',
        primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent',
        success: 'bg-green-600 hover:bg-green-700 text-white border-transparent',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-black border-transparent',
        danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
        ghost: 'hover:bg-gray-100 text-gray-700 border-transparent bg-transparent',
        link: 'text-blue-600 hover:text-blue-800 underline border-transparent bg-transparent'
    };

    // Size styles
    const sizes = {
        xs: 'h-8 px-2 text-xs',
        sm: 'h-9 px-3 text-sm',
        default: 'h-10 px-4 py-2 text-sm',
        lg: 'h-11 px-8 text-base',
        xl: 'h-12 px-10 text-base',
        icon: 'h-10 w-10 p-0'
    };

    // Loading spinner component
    const LoadingSpinner = () => (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );

    // Icon component (using emoji)
    const renderIcon = () => {
        if (!iconName) return null;
        
        const iconMap = {
            'User': '👤', 'Lock': '🔒', 'Eye': '👁️', 'EyeOff': '🙈', 'Mail': '✉️',
            'Calendar': '📅', 'Clock': '🕒', 'FileText': '📄', 'CheckCircle': '✅',
            'Plus': '➕', 'Search': '🔍', 'Download': '⬇️', 'Settings': '⚙️',
            'Bell': '🔔', 'Send': '📤', 'Save': '💾', 'RefreshCw': '🔄', 'default': '📌'
        };
        
        const emoji = iconMap[iconName] || iconMap['default'];
        
        return (
            <span 
                className={cn(
                    "inline-flex items-center justify-center",
                    children && iconPosition === 'left' && "mr-2",
                    children && iconPosition === 'right' && "ml-2"
                )}
                style={{ fontSize: '16px' }}
            >
                {emoji}
            </span>
        );
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variants[variant] || variants.default,
                sizes[size] || sizes.default,
                fullWidth && "w-full",
                className
            )}
            ref={ref}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <LoadingSpinner />}
            {iconName && iconPosition === 'left' && renderIcon()}
            {children}
            {iconName && iconPosition === 'right' && renderIcon()}
        </button>
    );
});

Button.displayName = "Button";
export default Button;