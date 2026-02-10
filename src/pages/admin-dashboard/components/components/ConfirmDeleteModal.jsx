import React from 'react';
import Button from '../../../../components/ui/Button'; // Jalur yang benar
import Icon from '../../../../components/AppIcon';     // Jalur yang benar

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, employeeName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Konfirmasi Hapus</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Icon name="X" size={24} color="slate-500" />
            </button>
          </div>

          <p className="text-slate-700 mb-6">
            Apakah Anda yakin ingin menonaktifkan pegawai <span className="font-semibold">{employeeName}</span>?
            Tindakan ini akan membuat pegawai tidak aktif tetapi datanya tetap tersimpan.
          </p>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={onConfirm}
            >
              Hapus
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;