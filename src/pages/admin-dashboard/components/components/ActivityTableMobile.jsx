import React, { useMemo } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const ActivityTableMobile = ({ activities, onViewDetails, onManageEvaluation }) => {
  const getStatusColor = (status) => {
    const statusMap = {
      'Usulan': 'status-warning',
      'Persetujuan': 'status-pending',
      'Penilaian': 'bg-primary/10 text-primary',
      'completed': 'bg-success/10 text-success',
      'in_progress': 'bg-primary/10 text-primary',
      'pending': 'bg-warning/10 text-warning',
      'new': 'bg-info/10 text-info',
      'approved': 'bg-success/10 text-success',
      'rejected': 'bg-error/10 text-error'
    };
    return statusMap[status] || 'bg-gray-10 text-gray';
  };

  const getStatusIcon = (type) => {
    const iconMap = {
      'evaluation_submitted': 'FileText',
      'proposal_approved': 'CheckCircle',
      'user_registered': 'UserPlus',
      'evaluation_started': 'Play',
      'evaluation_completed': 'CheckCircle2',
      'proposal_rejected': 'XCircle'
    };
    return iconMap[type] || 'Activity';
  };

  const formatTimestamp = (timestamp) => {
    return timestamp; // You can add date formatting logic here
  };

  return (
    <div className="card">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-heading font-semibold text-foreground">
            Aktivitas Terbaru
          </h3>
          <div className="text-xs text-muted-foreground">
            {activities.length} aktivitas
          </div>
        </div>

        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div 
              key={activity.id || index} 
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getStatusColor(activity.status)}`}>
                  <Icon name={getStatusIcon(activity.type)} size={18} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground truncate">{activity.user}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.action}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${getStatusColor(activity.status)}`}>
                      {activity.status === 'completed' && 'Selesai'}
                      {activity.status === 'in_progress' && 'Berlangsung'}
                      {activity.status === 'pending' && 'Menunggu'}
                      {activity.status === 'new' && 'Baru'}
                      {activity.status === 'approved' && 'Disetujui'}
                      {activity.status === 'rejected' && 'Ditolak'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails?.(activity)}
                      className="text-xs"
                    >
                      <Icon name="Eye" size={12} className="mr-1" />
                      Lihat
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8">
            <Icon name="FileText" size={32} className="mx-auto text-muted-foreground mb-3" />
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Belum ada aktivitas</h3>
            <p className="text-xs text-muted-foreground">Aktivitas sistem akan muncul di sini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTableMobile;