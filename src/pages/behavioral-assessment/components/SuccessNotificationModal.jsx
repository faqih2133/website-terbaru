import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SuccessNotificationModal = ({
  isOpen,
  onClose,
  title = "Berhasil!",
  message = "Data berhasil diproses",
  details = [],
  iconName = "CheckCircle",
  iconColor = "var(--color-success)"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
        
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-center rounded-t-3xl flex-shrink-0">
          
          {/* Success Icon */}
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Icon name="CheckCircle" size={40} color="#10b981" />
            </div>
          </div>
          
          {/* Success Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-4">
            <Icon name="Star" size={16} color="white" className="mr-2" />
            Penilaian Berhasil Dikirim
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-6">
            
            {/* Title */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 {title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>

            {/* Details */}
            {details?.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200/50">
                <div className="flex items-center mb-4">
                  <Icon name="Info" size={20} color="var(--color-green-600)" className="mr-2" />
                  <h4 className="font-semibold text-green-800">Detail Penilaian</h4>
                </div>
                
                <div className="space-y-3">
                  {details.map((detail, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-green-700 leading-relaxed">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievement Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Icon name="Target" size={20} color="var(--color-blue-600)" />
                </div>
                <div className="text-xs text-gray-600">7 Core Values</div>
                <div className="text-sm font-bold text-blue-600">100%</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Icon name="Award" size={20} color="var(--color-green-600)" />
                </div>
                <div className="text-xs text-gray-600">ASN BerAKHLAK</div>
                <div className="text-sm font-bold text-green-600">✓</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Icon name="TrendingUp" size={20} color="var(--color-purple-600)" />
                </div>
                <div className="text-xs text-gray-600">Weighted Score</div>
                <div className="text-sm font-bold text-purple-600">✓</div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200/50">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="ShieldCheck" size={20} color="var(--color-blue-600)" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Apa Selanjutnya?</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Admin akan memproses penilaian Anda</li>
                    <li>• Hasil akhir akan tersedia di dashboard</li>
                    <li>• Anda akan menerima notifikasi ketika selesai</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Extra space for better scrolling */}
            <div className="h-4"></div>
            
          </div>
        </div>

        {/* Action Buttons - Fixed */}
        <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 rounded-b-3xl flex-shrink-0">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white border-gray-300 hover:border-gray-400 text-gray-700"
            >
              Tutup
            </Button>
            
            <Button
              variant="primary"
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
            >
              <Icon name="Home" size={16} color="white" className="mr-2" />
              Kembali ke Dashboard
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuccessNotificationModal;