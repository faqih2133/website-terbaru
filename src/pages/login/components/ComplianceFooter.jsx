import React from 'react';
import Icon from '../../../components/AppIcon';

// ... existing imports ...

const ComplianceFooter = () => {
  const currentYear = new Date()?.getFullYear();

  const complianceItems = [
    { 
      icon: 'Lock', 
      title: 'Keamanan Data Terjamin',
      subtitle: 'Enkripsi end-to-end & audit trail',
      color: 'emerald'
    },
    { 
      icon: 'CheckCircle', 
      title: 'Sesuai Regulasi Pemerintah',
      subtitle: 'PP 30/2019 & UU ASN',
      color: 'blue'
    },
    { 
      icon: 'Users', 
      title: 'Evaluasi 360 Derajat',
      subtitle: 'Multi-perspective assessment',
      color: 'purple'
    }
  ];

  return (
    <div className="mt-12 space-y-8">
      
      {/* ===========================================
          COMPLIANCE GRID - CLEAN 3-COLUMN LAYOUT
          =========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {complianceItems?.map((item, index) => (
          <div
            key={index}
            className="group text-center p-6 bg-white/60 backdrop-blur-sm border border-slate-200/40 rounded-2xl shadow-sm hover:shadow-lg hover:border-slate-300/60 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Icon - Centered & Clean */}
            <div className={`relative w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 ${
              item.color === 'emerald' 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 group-hover:scale-110' 
                : item.color === 'blue'
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 group-hover:scale-110'
                : 'bg-gradient-to-br from-purple-600 to-indigo-700 group-hover:scale-110'
            }`}>
              <Icon name={item?.icon} size={28} color="white" />
              
              {/* Subtle glow */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
                item.color === 'emerald' 
                  ? 'bg-emerald-400' 
                  : item.color === 'blue'
                  ? 'bg-blue-400'
                  : 'bg-purple-400'
              }`}></div>
            </div>
            
            {/* Content - Centered Typography */}
            <div className="space-y-2">
              <div className="text-base font-bold text-slate-900 leading-tight">
                {item?.title}
              </div>
              <div className="text-sm text-slate-600 leading-snug">
                {item?.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===========================================
          FOOTER TEXT - CLEAN & CENTERED
          =========================================== */}
      <div className="text-center space-y-4 pt-8 border-t border-slate-200/60">
        
        {/* Security Notice */}
        <div className="flex items-start justify-center space-x-3 px-4">
          <div className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0">
            <Icon name="Info" size={20} color="currentColor" />
          </div>
          <div className="text-sm text-slate-600 leading-relaxed text-center max-w-lg">
            Sistem ini menggunakan standar keamanan tingkat pemerintah dan mematuhi regulasi perlindungan data ASN
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-xs text-slate-500 font-medium">
          &copy; 2026 Badan Kepegawaian Negara - Kementerian Keuangan RI
        </div>
        <div className="text-xs text-slate-400">
          Hak Cipta Dilindungi
        </div>
      </div>
    </div>
  );
};

// ... export

export default ComplianceFooter;