import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'default',
  loading = false
}) => {
  if (!isOpen) return null;

  const iconConfig = {
    default: { name: 'AlertCircle', color: 'var(--color-primary)' },
    success: { name: 'CheckCircle', color: 'var(--color-success)' },
    warning: { name: 'AlertTriangle', color: 'var(--color-warning)' },
    danger: { name: 'XCircle', color: 'var(--color-error)' }
  };

  const config = iconConfig?.[variant] || iconConfig?.default;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-xl shadow-xl max-w-md w-full p-6 border border-border">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            variant === 'success' ? 'bg-success/10' :
            variant === 'warning' ? 'bg-warning/10' :
            variant === 'danger'? 'bg-error/10' : 'bg-primary/10'
          }`}>
            <Icon name={config?.name} size={24} color={config?.color} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {message}
            </p>
            <div className="flex items-center space-x-3">
              <Button
                variant={variant === 'danger' ? 'destructive' : 'default'}
                onClick={onConfirm}
                loading={loading}
                disabled={loading}
              >
                {confirmText}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                {cancelText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;