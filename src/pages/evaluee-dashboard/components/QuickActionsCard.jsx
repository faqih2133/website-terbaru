import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


const QuickActionsCard = ({ actions }) => {
  const navigate = useNavigate();

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'proposal':
        return 'FileEdit';
      case 'status':
        return 'Clock';
      case 'results':
        return 'BarChart3';
      case 'help':
        return 'HelpCircle';
      default:
        return 'ArrowRight';
    }
  };

  const handleActionClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon name="Zap" size={20} color="var(--color-accent)" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-foreground">
          Aksi Cepat
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => handleActionClick(action?.route)}
            disabled={action?.disabled}
            className={`p-4 rounded-lg border border-border text-left transition-smooth hover:border-primary/30 hover:bg-muted/50 touch-target ${
              action?.disabled ? 'opacity-50 cursor-not-allowed' : 'interactive'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={getActionIcon(action?.type)} size={20} color="var(--color-primary)" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {action?.title}
                </h4>
                <p className="text-xs caption text-muted-foreground">
                  {action?.description}
                </p>
                {action?.badge && (
                  <span className="inline-block mt-2 status-badge status-warning">
                    {action?.badge}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsCard;