import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const BulkActionPanel = ({ proposals, onApproveAll, onRejectAll }) => {
  const [showApprovalConfirm, setShowApprovalConfirm] = useState(false);
  const [showRejectionConfirm, setShowRejectionConfirm] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingCount = proposals?.filter(p => p?.status === 'pending')?.length;
  const totalEvaluators = proposals?.reduce((sum, p) => sum + p?.evaluators?.length, 0);

  const handleApproveAll = () => {
    onApproveAll(approvalNotes);
    setShowApprovalConfirm(false);
    setApprovalNotes('');
  };

  const handleRejectAll = () => {
    if (rejectionReason?.trim()) {
      onRejectAll(rejectionReason);
      setShowRejectionConfirm(false);
      setRejectionReason('');
    }
  };

  return (
    <>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="CheckSquare" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Aksi Massal
              </h3>
              <p className="text-sm caption text-muted-foreground">
                {pendingCount} usulan menunggu persetujuan
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm caption text-muted-foreground mb-1">Total Kategori</p>
            <p className="text-2xl font-heading font-semibold text-foreground data-text">
              {proposals?.length}
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm caption text-muted-foreground mb-1">Total Evaluator</p>
            <p className="text-2xl font-heading font-semibold text-foreground data-text">
              {totalEvaluators}
            </p>
          </div>
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm caption text-muted-foreground mb-1">Menunggu</p>
            <p className="text-2xl font-heading font-semibold text-warning data-text">
              {pendingCount}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant="success"
            iconName="CheckCheck"
            iconPosition="left"
            onClick={() => setShowApprovalConfirm(true)}
            disabled={pendingCount === 0}
            className="flex-1"
          >
            Setujui Semua
          </Button>
          <Button
            variant="danger"
            iconName="XCircle"
            iconPosition="left"
            onClick={() => setShowRejectionConfirm(true)}
            disabled={pendingCount === 0}
            className="flex-1"
          >
            Tolak Semua
          </Button>
        </div>
      </div>
      {showApprovalConfirm && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80"
            onClick={() => setShowApprovalConfirm(false)}
          />
          <div className="relative bg-card rounded-xl shadow-xl max-w-lg w-full p-6 border border-border">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="CheckCheck" size={24} color="var(--color-success)" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                  Setujui Semua Usulan
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Anda akan menyetujui {pendingCount} usulan evaluator dengan total {totalEvaluators} evaluator. Tindakan ini tidak dapat dibatalkan.
                </p>
                <Input
                  type="text"
                  label="Catatan Persetujuan (Opsional)"
                  placeholder="Tambahkan catatan jika diperlukan..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e?.target?.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowApprovalConfirm(false)}
              >
                Batal
              </Button>
              <Button
                variant="success"
                iconName="Check"
                iconPosition="left"
                onClick={handleApproveAll}
              >
                Konfirmasi Persetujuan
              </Button>
            </div>
          </div>
        </div>
      )}
      {showRejectionConfirm && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/80"
            onClick={() => setShowRejectionConfirm(false)}
          />
          <div className="relative bg-card rounded-xl shadow-xl max-w-lg w-full p-6 border border-border">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="AlertTriangle" size={24} color="var(--color-error)" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                  Tolak Semua Usulan
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Anda akan menolak {pendingCount} usulan evaluator. Evaluee harus mengajukan usulan baru.
                </p>
                <Input
                  type="text"
                  label="Alasan Penolakan"
                  placeholder="Jelaskan alasan penolakan..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e?.target?.value)}
                  required
                  error={!rejectionReason?.trim() ? 'Alasan penolakan wajib diisi' : ''}
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowRejectionConfirm(false)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                iconName="X"
                iconPosition="left"
                onClick={handleRejectAll}
                disabled={!rejectionReason?.trim()}
              >
                Konfirmasi Penolakan
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActionPanel;