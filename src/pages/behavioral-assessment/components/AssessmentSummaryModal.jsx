import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AssessmentSummaryModal = ({ 
  isOpen, 
  onClose, 
  coreValues,
  scores,
  comments,
  evalueeData 
}) => {
  if (!isOpen) return null;

  const calculateCoreValueScore = (coreValueId) => {
    const indicators = coreValues?.find(cv => cv?.id === coreValueId)?.indicators || [];
    const validScores = indicators?.map(ind => scores?.[ind?.id])?.filter(score => score > 0);
    
    if (validScores?.length === 0) return 0;
    return validScores?.reduce((sum, score) => sum + score, 0) / validScores?.length;
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-success';
    if (score >= 3.5) return 'text-primary';
    if (score >= 2.5) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-background/80"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="sticky top-0 bg-card border-b border-border p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="FileText" size={24} color="var(--color-primary)" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  Ringkasan Penilaian
                </h3>
                <p className="text-sm caption text-muted-foreground">
                  Tinjau penilaian sebelum mengirim
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-smooth touch-target"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">
              Informasi Pegawai
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="caption text-muted-foreground">Nama:</span>
                <span className="ml-2 font-medium text-foreground">{evalueeData?.name}</span>
              </div>
              <div>
                <span className="caption text-muted-foreground">NIP:</span>
                <span className="ml-2 font-medium data-text text-foreground">{evalueeData?.nip}</span>
              </div>
              <div>
                <span className="caption text-muted-foreground">Jabatan:</span>
                <span className="ml-2 font-medium text-foreground">{evalueeData?.position}</span>
              </div>
              <div>
                <span className="caption text-muted-foreground">Unit Kerja:</span>
                <span className="ml-2 font-medium text-foreground">{evalueeData?.unit}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-medium text-foreground">
              Ringkasan Nilai per Nilai Dasar
            </h4>
            {coreValues?.map((coreValue) => {
              const avgScore = calculateCoreValueScore(coreValue?.id);
              const indicators = coreValue?.indicators;
              const completedCount = indicators?.filter(ind => scores?.[ind?.id] > 0)?.length;

              return (
                <div key={coreValue?.id} className="bg-card rounded-lg p-4 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h5 className="text-base font-medium text-foreground">
                        {coreValue?.name}
                      </h5>
                      <p className="text-xs caption text-muted-foreground mt-1">
                        {completedCount}/{indicators?.length} indikator dinilai
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold data-text ${getScoreColor(avgScore)}`}>
                        {avgScore?.toFixed(2)}
                      </div>
                      <div className="text-xs caption text-muted-foreground">
                        Rata-rata
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {indicators?.map((indicator, idx) => {
                      const score = scores?.[indicator?.id] || 0;
                      const comment = comments?.[indicator?.id] || '';

                      return (
                        <div key={indicator?.id} className="bg-muted/30 rounded p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs caption text-muted-foreground">
                                  {idx + 1}.
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                  {indicator?.name}
                                </span>
                              </div>
                            </div>
                            <div className={`text-lg font-bold data-text ${getScoreColor(score)}`}>
                              {score > 0 ? score : '-'}
                            </div>
                          </div>
                          {comment && (
                            <div className="mt-2 pl-5">
                              <p className="text-xs caption text-muted-foreground">
                                Komentar: <span className="text-foreground">{comment}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex items-center justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            iconName="ArrowLeft"
            iconPosition="left"
          >
            Kembali ke Penilaian
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSummaryModal;