import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProposalCard = ({ 
  proposal, 
  onModify, 
  onApprove, 
  onReject,
  isExpanded,
  onToggleExpand 
}) => {
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'supervisor':
        return 'UserCheck';
      case 'peer':
        return 'Users';
      case 'subordinate':
        return 'UserMinus';
      default:
        return 'User';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'supervisor':
        return 'Atasan';
      case 'peer':
        return 'Rekan Sejawat';
      case 'subordinate':
        return 'Bawahan';
      default:
        return category;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'status-success';
      case 'modified':
        return 'status-warning';
      case 'rejected':
        return 'status-error';
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon name={getCategoryIcon(proposal?.category)} size={24} color="var(--color-primary)" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-heading font-semibold text-foreground">
                {getCategoryLabel(proposal?.category)}
              </h3>
              <span className={`status-badge ${getStatusColor(proposal?.status)}`}>
                {proposal?.status === 'pending' && 'Menunggu Persetujuan'}
                {proposal?.status === 'approved' && 'Disetujui'}
                {proposal?.status === 'modified' && 'Dimodifikasi'}
                {proposal?.status === 'rejected' && 'Ditolak'}
              </span>
            </div>
            <p className="text-sm caption text-muted-foreground">
              {proposal?.evaluators?.length} evaluator diusulkan • Bobot: {proposal?.weight}%
            </p>
          </div>
        </div>
        <button
          onClick={onToggleExpand}
          className="p-2 hover:bg-muted rounded-lg transition-smooth touch-target lg:hidden"
          aria-label={isExpanded ? 'Tutup detail' : 'Lihat detail'}
        >
          <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={20} />
        </button>
      </div>
      <div className={`space-y-4 ${!isExpanded ? 'hidden lg:block' : ''}`}>
        {proposal?.evaluators?.map((evaluator, index) => (
          <div
            key={evaluator?.id}
            className="flex items-start space-x-4 p-4 bg-muted/50 rounded-lg"
          >
            <Image
              src={evaluator?.avatar}
              alt={evaluator?.avatarAlt}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-medium text-foreground mb-1">
                    {evaluator?.name}
                  </h4>
                  <p className="text-sm caption text-muted-foreground">
                    {evaluator?.position} • {evaluator?.department}
                  </p>
                </div>
                {evaluator?.isModified && (
                  <span className="status-badge bg-warning/10 text-warning ml-2 flex-shrink-0">
                    Dimodifikasi
                  </span>
                )}
              </div>
              {evaluator?.justification && (
                <div className="mt-3 p-3 bg-background rounded-lg">
                  <p className="text-xs caption text-muted-foreground mb-1">Justifikasi:</p>
                  <p className="text-sm text-foreground">{evaluator?.justification}</p>
                </div>
              )}
              {evaluator?.modificationReason && (
                <div className="mt-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <p className="text-xs caption text-warning mb-1">Alasan Modifikasi:</p>
                  <p className="text-sm text-foreground">{evaluator?.modificationReason}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            iconName="Edit"
            iconPosition="left"
            onClick={() => onModify(proposal)}
            className="flex-1 sm:flex-initial"
          >
            Modifikasi
          </Button>
          <Button
            variant="success"
            iconName="Check"
            iconPosition="left"
            onClick={() => onApprove(proposal)}
            className="flex-1 sm:flex-initial"
          >
            Setujui
          </Button>
          <Button
            variant="danger"
            iconName="X"
            iconPosition="left"
            onClick={() => onReject(proposal)}
            className="flex-1 sm:flex-initial"
          >
            Tolak
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProposalCard;