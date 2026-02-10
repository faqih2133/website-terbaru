import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const VerificationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  evalueeData,
  completionPercentage,
  isSubmitting = false
}) => {
  const [verifications, setVerifications] = useState({
    objectivity: false,
    professionalism: false
  });

  if (!isOpen) return null;

  const handleVerificationChange = (key, checked) => {
    setVerifications(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const allVerified = Object.values(verifications).every(v => v === true);

  const handleSubmit = () => {
    if (!allVerified) {
      return;
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-8 rounded-t-3xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Icon name="ShieldCheck" size={32} color="white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Verifikasi Penilaian</h2>
                <p className="text-blue-100 text-lg">Konfirmasi sebelum mengirim penilaian final</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-colors border border-white/20"
            >
              <Icon name="X" size={24} color="white" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            
            {/* Evaluee Info Card */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl p-6 border border-slate-200/50">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="User" size={24} color="var(--color-blue-600)" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Informasi Pegawai yang Dinilai</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Nama:</p>
                      <p className="font-semibold text-slate-900">{evalueeData?.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">NIP:</p>
                      <p className="font-semibold text-slate-900">{evalueeData?.nip}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Jabatan:</p>
                      <p className="font-semibold text-slate-900">{evalueeData?.position}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Kelengkapan:</p>
                      <p className="font-semibold text-green-600">{completionPercentage}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Checkboxes */}
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Pernyataan Verifikasi</h3>
                <p className="text-slate-600">Centang kotak di bawah ini untuk mengkonfirmasi penilaian Anda</p>
              </div>

              {/* Checkbox 1: Objectivity */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200/50 hover:border-green-300 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div 
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                        verifications.objectivity 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-slate-300 bg-white hover:border-green-300'
                      }`}
                      onClick={() => handleVerificationChange('objectivity', !verifications.objectivity)}
                    >
                      {verifications.objectivity && (
                        <Icon name="Check" size={16} color="white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label 
                      className="flex items-start space-x-3 cursor-pointer"
                      onClick={() => handleVerificationChange('objectivity', !verifications.objectivity)}
                    >
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-green-800 mb-2">Objektivitas Penilaian</h4>
                        <p className="text-sm text-green-700 leading-relaxed">
                          Saya menyatakan bahwa penilaian ini dilakukan secara objektif, bebas dari bias pribadi, 
                          dan berdasarkan pengamatan langsung terhadap perilaku kerja pegawai yang dinilai.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Checkbox 2: Professionalism */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200/50 hover:border-blue-300 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div 
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                        verifications.professionalism 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'border-slate-300 bg-white hover:border-blue-300'
                      }`}
                      onClick={() => handleVerificationChange('professionalism', !verifications.professionalism)}
                    >
                      {verifications.professionalism && (
                        <Icon name="Check" size={16} color="white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label 
                      className="flex items-start space-x-3 cursor-pointer"
                      onClick={() => handleVerificationChange('professionalism', !verifications.professionalism)}
                    >
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-blue-800 mb-2">Profesionalitas</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          Saya menyatakan bahwa penilaian ini dilakukan secara profesional, sesuai standar ASN BerAKHLAK, 
                          dan berdasarkan bukti-bukti konkrit dari perilaku kerja pegawai yang teramati.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="AlertTriangle" size={20} color="var(--color-amber-600)" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 mb-2">Peringatan Penting</h4>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Setelah penilaian dikirim, Anda tidak dapat mengubah atau membatalkan penilaian. 
                    Pastikan semua informasi sudah benar dan sesuai dengan pengamatan Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* Extra space for better scrolling experience */}
            <div className="h-8"></div>
            
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 rounded-b-3xl flex-shrink-0">
          <div className="flex items-center justify-end space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-3 bg-white border-slate-300 hover:border-slate-400 text-slate-700"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!allVerified || isSubmitting}
              className={`px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg ${
                allVerified ? 'hover:shadow-xl' : 'opacity-50 cursor-not-allowed'
              } transition-all duration-300`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Mengirim...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Icon name="Send" size={18} color="white" />
                  <span>Kirim Penilaian Final</span>
                </div>
              )}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerificationModal;