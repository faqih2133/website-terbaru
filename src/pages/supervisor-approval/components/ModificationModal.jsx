import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';


const ModificationModal = ({ proposal, onClose, onSave, availableEmployees }) => {
  const [modifiedEvaluators, setModifiedEvaluators] = useState(proposal?.evaluators);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modificationReason, setModificationReason] = useState('');

  const filteredEmployees = availableEmployees?.filter(emp =>
    emp?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    emp?.position?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
    emp?.department?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const handleRemoveEvaluator = (evaluatorId) => {
    setModifiedEvaluators(prev => prev?.filter(e => e?.id !== evaluatorId));
  };

  const handleAddEvaluator = () => {
    if (selectedEmployee && modificationReason?.trim()) {
      const newEvaluator = {
        ...selectedEmployee,
        isModified: true,
        modificationReason: modificationReason?.trim()
      };
      setModifiedEvaluators(prev => [...prev, newEvaluator]);
      setSelectedEmployee(null);
      setModificationReason('');
      setSearchQuery('');
    }
  };

  const handleSave = () => {
    onSave({
      ...proposal,
      evaluators: modifiedEvaluators,
      status: 'modified'
    });
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Edit" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold text-foreground">
                Modifikasi Usulan Evaluator
              </h2>
              <p className="text-sm caption text-muted-foreground">
                {proposal?.category === 'supervisor' && 'Atasan'}
                {proposal?.category === 'peer' && 'Rekan Sejawat'}
                {proposal?.category === 'subordinate' && 'Bawahan'}
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
            <div>
              <h3 className="text-base font-medium text-foreground mb-4">
                Evaluator Saat Ini ({modifiedEvaluators?.length})
              </h3>
              <div className="space-y-3">
                {modifiedEvaluators?.map((evaluator) => (
                  <div
                    key={evaluator?.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Image
                        src={evaluator?.avatar}
                        alt={evaluator?.avatarAlt}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {evaluator?.name}
                        </p>
                        <p className="text-xs caption text-muted-foreground">
                          {evaluator?.position}
                        </p>
                      </div>
                      {evaluator?.isModified && (
                        <span className="status-badge bg-warning/10 text-warning flex-shrink-0">
                          Baru
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveEvaluator(evaluator?.id)}
                      className="p-2 hover:bg-error/10 rounded-lg transition-smooth touch-target ml-2"
                      aria-label="Hapus evaluator"
                    >
                      <Icon name="Trash2" size={16} color="var(--color-error)" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-base font-medium text-foreground mb-4">
                Tambah Evaluator Baru
              </h3>
              <div className="space-y-4">
                <Input
                  type="search"
                  label="Cari Pegawai"
                  placeholder="Nama, jabatan, atau unit kerja..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                />

                {searchQuery && (
                  <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-muted/30 rounded-lg">
                    {filteredEmployees?.length > 0 ? (
                      filteredEmployees?.map((employee) => (
                        <button
                          key={employee?.id}
                          onClick={() => setSelectedEmployee(employee)}
                          className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-smooth text-left ${
                            selectedEmployee?.id === employee?.id
                              ? 'bg-primary/10 border-2 border-primary' :'bg-background hover:bg-muted border-2 border-transparent'
                          }`}
                        >
                          <Image
                            src={employee?.avatar}
                            alt={employee?.avatarAlt}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {employee?.name}
                            </p>
                            <p className="text-xs caption text-muted-foreground">
                              {employee?.position} • {employee?.department}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Icon name="Search" size={32} className="mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Tidak ada pegawai ditemukan
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedEmployee && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-xs caption text-muted-foreground mb-2">
                      Pegawai Terpilih:
                    </p>
                    <div className="flex items-center space-x-3 mb-4">
                      <Image
                        src={selectedEmployee?.avatar}
                        alt={selectedEmployee?.avatarAlt}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {selectedEmployee?.name}
                        </p>
                        <p className="text-xs caption text-muted-foreground">
                          {selectedEmployee?.position}
                        </p>
                      </div>
                    </div>
                    <Input
                      type="text"
                      label="Alasan Modifikasi"
                      placeholder="Jelaskan alasan penambahan evaluator ini..."
                      value={modificationReason}
                      onChange={(e) => setModificationReason(e?.target?.value)}
                      required
                    />
                    <Button
                      variant="default"
                      iconName="Plus"
                      iconPosition="left"
                      onClick={handleAddEvaluator}
                      disabled={!modificationReason?.trim()}
                      className="mt-3"
                    >
                      Tambahkan Evaluator
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="default"
            iconName="Save"
            iconPosition="left"
            onClick={handleSave}
            disabled={modifiedEvaluators?.length === 0}
          >
            Simpan Modifikasi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModificationModal;