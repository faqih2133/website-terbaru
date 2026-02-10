import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Checkbox from '../../../components/ui/Checkbox';

const RejectionModal = ({ proposal, onClose, onConfirm }) => {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [additionalComments, setAdditionalComments] = useState('');

  const predefinedReasons = [
    { id: 'conflict', label: 'Konflik kepentingan dengan evaluator yang diusulkan' },
    { id: 'unqualified', label: 'Evaluator tidak memenuhi kualifikasi yang diperlukan' },
    { id: 'insufficient', label: 'Jumlah evaluator tidak mencukupi untuk kategori ini' },
    { id: 'inappropriate', label: 'Evaluator tidak sesuai dengan posisi yang dievaluasi' },
    { id: 'other', label: 'Alasan lainnya (jelaskan di komentar tambahan)' }
  ];

  const handleReasonToggle = (reasonId) => {
    setSelectedReasons(prev =>
      prev?.includes(reasonId)
        ? prev?.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleConfirm = () => {
    const reasons = selectedReasons?.map(id =>
      predefinedReasons?.find(r => r?.id === id)?.label
    )?.join('; ');

    const fullReason = additionalComments
      ? `${reasons}\n\nKomentar Tambahan: ${additionalComments}`
      : reasons;

    onConfirm({
      ...proposal,
      status: 'rejected',
      rejectionReason: fullReason
    });
  };

  const isValid = selectedReasons?.length > 0 && (
    !selectedReasons?.includes('other') || additionalComments?.trim()
  );

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center">
              <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Tolak Usulan Evaluator
              </h2>
              <p className="text-sm caption text-muted-foreground">
                Berikan alasan penolakan yang jelas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-smooth touch-target"
            aria-label="Tutup"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">
                Kategori: {proposal?.category === 'supervisor' && 'Atasan'}
                {proposal?.category === 'peer' && 'Rekan Sejawat'}
                {proposal?.category === 'subordinate' && 'Bawahan'}
              </p>
              <p className="text-sm text-muted-foreground">
                {proposal?.evaluators?.length} evaluator diusulkan
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Alasan Penolakan <span className="text-error">*</span>
              </label>
              <div className="space-y-3">
                {predefinedReasons?.map((reason) => (
                  <Checkbox
                    key={reason?.id}
                    label={reason?.label}
                    checked={selectedReasons?.includes(reason?.id)}
                    onChange={() => handleReasonToggle(reason?.id)}
                  />
                ))}
              </div>
            </div>

            {selectedReasons?.includes('other') && (
              <Input
                type="text"
                label="Komentar Tambahan"
                placeholder="Jelaskan alasan penolakan secara detail..."
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e?.target?.value)}
                required
                description="Wajib diisi jika memilih 'Alasan lainnya'"
              />
            )}

            <div className="p-4 bg-error/5 border border-error/20 rounded-lg">
              <div className="flex items-start space-x-3">
                <Icon name="AlertCircle" size={20} className="text-error flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-error mb-2">
                    Perhatian
                  </p>
                  <p className="text-sm text-foreground">
                    Penolakan usulan akan mengembalikan proses ke evaluee untuk melakukan revisi. Pastikan alasan penolakan jelas dan konstruktif untuk membantu perbaikan usulan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="danger"
            iconName="X"
            iconPosition="left"
            onClick={handleConfirm}
            disabled={!isValid}
          >
            Konfirmasi Penolakan
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;