import React from 'react';
import Icon from '../../../components/AppIcon';

const CoreValuesSummaryCard = ({ coreValuesData }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 75) return 'text-primary';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getProgressColor = (score) => {
    if (score >= 90) return 'bg-success';
    if (score >= 75) return 'bg-primary';
    if (score >= 60) return 'bg-warning';
    return 'bg-error';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Target" size={20} color="var(--color-primary)" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Ringkasan Nilai Inti ASN
          </h3>
        </div>
      </div>
      <div className="space-y-4">
        {coreValuesData?.map((value) => (
          <div key={value?.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-foreground mb-1">
                  {value?.name}
                </h4>
                <p className="text-xs caption text-muted-foreground">
                  {value?.indicatorCount} Indikator Perilaku
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-heading font-bold data-text ${getScoreColor(value?.score)}`}>
                  {value?.score}
                </p>
                <p className="text-xs caption text-muted-foreground">
                  dari 100
                </p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-smooth ${getProgressColor(value?.score)}`}
                style={{ width: `${value?.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm caption text-muted-foreground">
            Rata-rata Keseluruhan
          </span>
          <span className="text-xl font-heading font-bold text-primary data-text">
            {(coreValuesData?.reduce((sum, v) => sum + v?.score, 0) / coreValuesData?.length)?.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CoreValuesSummaryCard;