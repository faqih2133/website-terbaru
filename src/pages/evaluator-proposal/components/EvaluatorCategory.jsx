import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const EvaluatorCategorySection = ({
  category,
  title,
  description,
  icon,
  evaluators,
  onAddEvaluator,
  onRemoveEvaluator,
  onUpdateEvaluator,
  employeeOptions,
  minRequired = 1,
  maxAllowed = 5,
  isExpanded,
  onToggleExpand
}) => {
  const isComplete = evaluators?.length >= minRequired && evaluators?.every(e => e?.employeeId && e?.justification);
  const canAddMore = evaluators?.length < maxAllowed;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-6 hover:bg-muted/50 transition-smooth lg:cursor-default lg:pointer-events-none"
      >
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isComplete ? 'bg-success/10' : 'bg-primary/10'
          }`}>
            <Icon 
              name={isComplete ? 'CheckCircle' : icon} 
              size={24} 
              color={isComplete ? 'var(--color-success)' : 'var(--color-primary)'} 
            />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-heading font-semibold text-foreground">{title}</h3>
            <p className="text-sm caption text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="status-badge bg-muted text-muted-foreground">
            {evaluators?.length}/{minRequired} minimum
          </span>
          <Icon 
            name={isExpanded ? 'ChevronUp' : 'ChevronDown'} 
            size={20} 
            className="lg:hidden"
          />
        </div>
      </button>
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="p-6 pt-0 space-y-4">
          {evaluators?.map((evaluator, index) => (
            <div key={evaluator?.id} className="bg-muted/30 rounded-lg p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium data-text text-primary">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">Evaluator {index + 1}</span>
                </div>
                {evaluators?.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Trash2"
                    onClick={() => onRemoveEvaluator(evaluator?.id)}
                    className="text-error hover:text-error"
                  >
                    Hapus
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Pilih Pegawai"
                  placeholder="Cari nama pegawai..."
                  searchable
                  required
                  options={employeeOptions}
                  value={evaluator?.employeeId}
                  onChange={(value) => onUpdateEvaluator(evaluator?.id, 'employeeId', value)}
                  error={evaluator?.errors?.employeeId}
                />

                <Input
                  label="NIP"
                  type="text"
                  placeholder="Otomatis terisi"
                  value={evaluator?.nip}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Jabatan"
                  type="text"
                  placeholder="Otomatis terisi"
                  value={evaluator?.position}
                  disabled
                  className="bg-muted"
                />

                <Input
                  label="Unit Kerja"
                  type="text"
                  placeholder="Otomatis terisi"
                  value={evaluator?.department}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alasan Pemilihan <span className="text-error">*</span>
                </label>
                <textarea
                  placeholder="Jelaskan alasan memilih pegawai ini sebagai evaluator..."
                  value={evaluator?.justification}
                  onChange={(e) => onUpdateEvaluator(evaluator?.id, 'justification', e?.target?.value)}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    evaluator?.errors?.justification 
                      ? 'border-error focus:ring-error' :'border-input focus:ring-ring'
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 transition-smooth resize-none`}
                />
                {evaluator?.errors?.justification && (
                  <p className="text-sm text-error mt-1">{evaluator?.errors?.justification}</p>
                )}
                <p className="text-xs caption text-muted-foreground mt-1">
                  Minimal 50 karakter
                </p>
              </div>
            </div>
          ))}

          {canAddMore && (
            <Button
              variant="outline"
              fullWidth
              iconName="Plus"
              iconPosition="left"
              onClick={onAddEvaluator}
            >
              Tambah {title}
            </Button>
          )}

          {!canAddMore && (
            <div className="flex items-center space-x-2 p-3 bg-warning/10 rounded-lg">
              <Icon name="AlertCircle" size={16} color="var(--color-warning)" />
              <p className="text-sm text-warning">
                Maksimal {maxAllowed} evaluator per kategori
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorCategorySection;