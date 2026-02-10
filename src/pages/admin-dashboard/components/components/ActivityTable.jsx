import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const ActivityTable = ({ activities, onViewDetails, onManageEvaluation }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const getStatusColor = (status) => {
    const statusMap = {
      'completed': 'bg-success/10 text-success border-success/20',
      'in_progress': 'bg-primary/10 text-primary border-primary/20',
      'pending': 'bg-warning/10 text-warning border-warning/20',
      'new': 'bg-info/10 text-info border-info/20',
      'approved': 'bg-success/10 text-success border-success/20',
      'rejected': 'bg-error/10 text-error border-error/20'
    };
    return statusMap[status] || 'bg-gray-10 text-gray border-gray-20';
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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedActivities = React.useMemo(() => {
    let sortableItems = [...activities];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [activities, sortConfig]);

  return (
    <div className="card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Aktivitas Terbaru
          </h3>
          <div className="text-sm text-muted-foreground">
            {activities.length} aktivitas
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 mb-4 pb-3 border-b border-border">
          <div className="col-span-1"></div>
          <div 
            className="col-span-3 font-medium text-sm text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={() => handleSort('user')}
          >
            Pengguna
            {sortConfig.key === 'user' && (
              <Icon 
                name={sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                size={14} 
                className="inline ml-1" 
              />
            )}
          </div>
          <div 
            className="col-span-4 font-medium text-sm text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={() => handleSort('action')}
          >
            Aktivitas
            {sortConfig.key === 'action' && (
              <Icon 
                name={sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                size={14} 
                className="inline ml-1" 
              />
            )}
          </div>
          <div 
            className="col-span-2 font-medium text-sm text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={() => handleSort('status')}
          >
            Status
            {sortConfig.key === 'status' && (
              <Icon 
                name={sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                size={14} 
                className="inline ml-1" 
              />
            )}
          </div>
          <div 
            className="col-span-2 font-medium text-sm text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={() => handleSort('timestamp')}
          >
            Waktu
            {sortConfig.key === 'timestamp' && (
              <Icon 
                name={sortConfig.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
                size={14} 
                className="inline ml-1" 
              />
            )}
          </div>
        </div>

        {/* Table Body */}
        <div className="space-y-2">
          {sortedActivities.map((activity, index) => (
            <div 
              key={activity.id || index} 
              className="grid grid-cols-12 gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              {/* Icon */}
              <div className="col-span-1 flex items-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(activity.status)}`}>
                  <Icon name={getStatusIcon(activity.type)} size={16} />
                </div>
              </div>

              {/* User */}
              <div className="col-span-3 flex items-center">
                <div>
                  <p className="font-medium text-sm text-foreground">{activity.user}</p>
                </div>
              </div>

              {/* Action */}
              <div className="col-span-4 flex items-center">
                <p className="text-sm text-muted-foreground">{activity.action}</p>
              </div>

              {/* Status */}
              <div className="col-span-2 flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status === 'completed' && 'Selesai'}
                  {activity.status === 'in_progress' && 'Berlangsung'}
                  {activity.status === 'pending' && 'Menunggu'}
                  {activity.status === 'new' && 'Baru'}
                  {activity.status === 'approved' && 'Disetujui'}
                  {activity.status === 'rejected' && 'Ditolak'}
                </span>
              </div>

              {/* Timestamp */}
              <div className="col-span-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails?.(activity)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon name="Eye" size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12">
            <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Belum ada aktivitas</h3>
            <p className="text-sm text-muted-foreground">Aktivitas sistem akan muncul di sini</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTable;