import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ComparisonView = ({ original, modified }) => {
  const getChanges = () => {
    const originalIds = original?.evaluators?.map(e => e?.id);
    const modifiedIds = modified?.evaluators?.map(e => e?.id);
    
    const added = modified?.evaluators?.filter(e => !originalIds?.includes(e?.id));
    const removed = original?.evaluators?.filter(e => !modifiedIds?.includes(e?.id));
    const unchanged = modified?.evaluators?.filter(e => originalIds?.includes(e?.id));

    return { added, removed, unchanged };
  };

  const changes = getChanges();

  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
          <Icon name="GitCompare" size={20} color="var(--color-warning)" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Perbandingan Usulan
          </h3>
          <p className="text-sm caption text-muted-foreground">
            Usulan asli vs modifikasi atasan
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-medium text-foreground">
              Usulan Asli
            </h4>
            <span className="text-sm caption text-muted-foreground">
              {original?.evaluators?.length} evaluator
            </span>
          </div>
          <div className="space-y-3">
            {original?.evaluators?.map((evaluator) => {
              const isRemoved = changes?.removed?.some(e => e?.id === evaluator?.id);
              return (
                <div
                  key={evaluator?.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    isRemoved
                      ? 'bg-error/5 border border-error/20' :'bg-muted/50'
                  }`}
                >
                  <Image
                    src={evaluator?.avatar}
                    alt={evaluator?.avatarAlt}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      isRemoved ? 'text-error line-through' : 'text-foreground'
                    }`}>
                      {evaluator?.name}
                    </p>
                    <p className="text-xs caption text-muted-foreground">
                      {evaluator?.position}
                    </p>
                  </div>
                  {isRemoved && (
                    <Icon name="Minus" size={16} color="var(--color-error)" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-medium text-foreground">
              Setelah Modifikasi
            </h4>
            <span className="text-sm caption text-muted-foreground">
              {modified?.evaluators?.length} evaluator
            </span>
          </div>
          <div className="space-y-3">
            {modified?.evaluators?.map((evaluator) => {
              const isAdded = changes?.added?.some(e => e?.id === evaluator?.id);
              return (
                <div
                  key={evaluator?.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    isAdded
                      ? 'bg-success/5 border border-success/20' :'bg-muted/50'
                  }`}
                >
                  <Image
                    src={evaluator?.avatar}
                    alt={evaluator?.avatarAlt}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      isAdded ? 'text-success' : 'text-foreground'
                    }`}>
                      {evaluator?.name}
                    </p>
                    <p className="text-xs caption text-muted-foreground">
                      {evaluator?.position}
                    </p>
                  </div>
                  {isAdded && (
                    <Icon name="Plus" size={16} color="var(--color-success)" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-2">
              Ringkasan Perubahan
            </p>
            <div className="space-y-1">
              {changes?.added?.length > 0 && (
                <p className="text-sm text-success">
                  • {changes?.added?.length} evaluator ditambahkan
                </p>
              )}
              {changes?.removed?.length > 0 && (
                <p className="text-sm text-error">
                  • {changes?.removed?.length} evaluator dihapus
                </p>
              )}
              {changes?.unchanged?.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  • {changes?.unchanged?.length} evaluator tidak berubah
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;