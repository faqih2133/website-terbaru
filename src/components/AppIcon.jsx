import React from 'react';

// Simple icon component with emoji fallbacks
const Icon = ({
    name,
    size = 24,
    color = "currentColor",
    className = "",
    ...props
}) => {
    // Icon mapping with emoji fallbacks
    const iconMap = {
        // Common icons
        'User': '👤',
        'Lock': '🔒',
        'Eye': '👁️',
        'EyeOff': '🙈',
        'Mail': '✉️',
        'Phone': '📞',
        'Calendar': '📅',
        'CalendarDays': '📅',
        'Clock': '🕒',
        'FileText': '📄',
        'FileEdit': '✏️',
        'ClipboardCheck': '✅',
        'CheckCircle': '✅',
        'Check': '✓',
        'X': '✕',
        'Plus': '➕',
        'Minus': '➖',
        'Search': '🔍',
        'Filter': '🔽',
        'Download': '⬇️',
        'Upload': '⬆️',
        'Settings': '⚙️',
        'Bell': '🔔',
        'AlertCircle': '⚠️',
        'Info': 'ℹ️',
        'HelpCircle': '❓',
        'ChevronDown': '▼',
        'ChevronUp': '▲',
        'ChevronLeft': '◀️',
        'ChevronRight': '▶️',
        'ArrowRight': '→',
        'ArrowLeft': '←',
        'LogIn': '🚪',
        'LogOut': '🚪',
        'Target': '🎯',
        'Shield': '🛡️',
        'Users': '👥',
        'UserCheck': '✅',
        'TrendingUp': '📈',
        'Award': '🏆',
        'History': '📚',
        'Send': '📤',
        'Save': '💾',
        'RefreshCw': '🔄',
        'PlayCircle': '▶️',
        'MessageCircle': '💬',
        'MessageSquare': '💬',
        'Lightbulb': '💡',
        'FileSpreadsheet': '📊',
        // Default fallback
        'default': '📌'
    };

    const emoji = iconMap[name] || iconMap['default'];

    return (
        <span
            className={className}
            style={{
                fontSize: `${size}px`,
                color: color,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: `${size}px`,
                height: `${size}px`,
                lineHeight: 1,
            }}
            {...props}
        >
            {emoji}
        </span>
    );
};

export default Icon;