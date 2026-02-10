import React from 'react';
import Icon from '../AppIcon';

const WorkflowProgressIndicator = ({ 
  currentPhase = 'proposal',
  completedPhases = [],
  variant = 'horizontal'
}) => {
  const phases = [
    {
      id: 'proposal',
      label: 'Usulan',
      description: 'Pengajuan evaluasi',
      icon: 'FileEdit',
    },
    {
      id: 'approval',
      label: 'Persetujuan',
      description: 'Tinjauan atasan',
      icon: 'CheckSquare',
    },
    {
      id: 'assessment',
      label: 'Penilaian',
      description: 'Evaluasi perilaku',
      icon: 'ClipboardCheck',
    },
    {
      id: 'results',
      label: 'Hasil',
      description: 'Laporan akhir',
      icon: 'Award',
    },
  ];

  const getPhaseStatus = (phaseId) => {
    if (completedPhases?.includes(phaseId)) return 'completed';
    if (phaseId === currentPhase) return 'current';
    return 'pending';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10 border-success';
      case 'current':
        return 'text-primary bg-primary/10 border-primary';
      case 'pending':
        return 'text-muted-foreground bg-muted border-border';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getConnectorColor = (index) => {
    const currentIndex = phases?.findIndex(p => p?.id === currentPhase);
    return index < currentIndex ? 'bg-success' : 'bg-border';
  };

  if (variant === 'vertical') {
    return (
      <div className="space-y-4">
        {phases?.map((phase, index) => {
          const status = getPhaseStatus(phase?.id);
          const statusColor = getStatusColor(status);
          const isLast = index === phases?.length - 1;

          return (
            <div key={phase?.id} className="relative">
              <div className="flex items-start space-x-4">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-smooth ${statusColor}`}
                  >
                    <Icon 
                      name={status === 'completed' ? 'Check' : phase?.icon} 
                      size={20}
                    />
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-16 mt-2 transition-smooth ${getConnectorColor(index)}`} />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <h4 className={`text-base font-medium ${status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {phase?.label}
                  </h4>
                  <p className="text-sm caption text-muted-foreground mt-1">
                    {phase?.description}
                  </p>
                  {status === 'current' && (
                    <div className="mt-2">
                      <span className="status-badge bg-primary/10 text-primary">
                        Sedang Berlangsung
                      </span>
                    </div>
                  )}
                  {status === 'completed' && (
                    <div className="mt-2">
                      <span className="status-badge status-success">
                        Selesai
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {phases?.map((phase, index) => {
          const status = getPhaseStatus(phase?.id);
          const statusColor = getStatusColor(status);
          const isLast = index === phases?.length - 1;

          return (
            <React.Fragment key={phase?.id}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-smooth ${statusColor}`}
                >
                  <Icon 
                    name={status === 'completed' ? 'Check' : phase?.icon} 
                    size={20}
                  />
                </div>
                <div className="text-center mt-3">
                  <p className={`text-sm font-medium ${status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {phase?.label}
                  </p>
                  <p className="text-xs caption text-muted-foreground mt-1 hidden md:block">
                    {phase?.description}
                  </p>
                </div>
              </div>
              {!isLast && (
                <div className={`h-0.5 flex-1 mx-2 transition-smooth ${getConnectorColor(index)}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowProgressIndicator;