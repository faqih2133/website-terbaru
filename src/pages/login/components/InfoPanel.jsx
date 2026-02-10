import React from 'react';
import Icon from '../../../components/AppIcon';

const InfoPanel = () => {
  const features = [
    {
      icon: 'Shield',
      title: 'Evaluasi Aman & Terpercaya',
      description: 'Sistem berbasis PP 30 Tahun 2019 dengan audit trail lengkap dan keamanan data tingkat pemerintah.',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: 'Users',
      title: '360° Multi-Perspective',
      description: 'Evaluasi komprehensif dari berbagai sudut pandang untuk hasil yang objektif dan berimbang.',
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: 'Target',
      title: 'Core Values BerAKHLAK',
      description: 'Penilaian berbasis 7 nilai dasar ASN yang menjadi fondasi integritas dan profesionalitas.',
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      icon: 'TrendingUp',
      title: 'Analitik Real-time',
      description: 'Dashboard interaktif dengan visualisasi data real-time untuk monitoring kinerja yang akurat.',
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  return (
    <div className="space-y-12">
      {/* ===========================================
          HERO SECTION - IMPACTFUL & RESPONSIVE
          =========================================== */}
      <div className="text-center mt-10">
        <div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-tight tracking-tight">
            Transformasi
          </h1>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold 
        bg-gradient-to-r from-blue-700 via-amber-500 to-blue-800 
        bg-clip-text text-transparent -mt-2 sm:-mt-3 tracking-tight">
        Penilaian Kinerja
      </h2>

        </div>

        <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium px-4 mt-6">
          Sistem informasi terintegrasi untuk penilaian perilaku kerja pegawai Kementerian Keuangan berbasis Core Values ASN BerAKHLAK.
        </p>

        {/* ===========================================
            STATS - RESPONSIVE METRICS
            =========================================== */}
        <div className="flex justify-center px-4 mt-8">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 p-6 sm:p-8 bg-white/70 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/50 w-full max-w-2xl hover:shadow-xl transition-shadow duration-300">
            <div className="text-center group">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 group-hover:scale-110 transition-transform duration-300">7</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Core Values</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-600 group-hover:scale-110 transition-transform duration-300">2</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Tools</div>
            </div>
            <div className="text-center group">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">360°</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">Perspektif</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===========================================
          FEATURES GRID - CONSISTENT RESPONSIVE
          =========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/40 hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 overflow-hidden"
          >
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

            <div className="relative z-10 space-y-4 sm:space-y-6">

              {/* Icon with gradient background */}
              <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 sm:group-hover:scale-110 group-hover:rotate-3 sm:group-hover:rotate-6 transition-all duration-500`}>
                <Icon 
                  name={feature.icon} 
                  size={window.innerWidth >= 640 ? 32 : 24} 
                  color="white" 
                />
              </div>

              {/* Content */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors duration-300 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>

              {/* Hover indicator */}
              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gold-400 rounded-full flex items-center justify-center">
                  <Icon 
                    name="ArrowRight" 
                    size={window.innerWidth >= 640 ? 16 : 12} 
                    color="white" 
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===========================================
          TRUST INDICATORS - RESPONSIVE BOTTOM
          =========================================== */}
      <div className="text-center space-y-6 pt-6 sm:pt-8">
        <div className="inline-flex items-center space-x-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-gold-50 border border-blue-200/60 rounded-xl sm:rounded-2xl shadow-lg">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Icon 
              name="CheckCircle" 
              size={window.innerWidth >= 640 ? 16 : 14} 
              color="white" 
            />
          </div>
          <div className="text-xs sm:text-sm font-semibold text-blue-900">
            Sistem Terverifikasi & Sesuai Regulasi Pemerintah
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;