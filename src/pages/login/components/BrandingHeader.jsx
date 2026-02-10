import React from 'react';

const BrandingHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-6">
        <img 
          src="/assets/images/images.png" 
          alt="Logo Kementerian Keuangan" 
          className="h-24 w-auto drop-shadow-sm hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Penilaian Perilaku Kinerja</h1>
      <p className="text-base font-medium text-slate-600 mt-1">Kementerian Keuangan RI</p>
      <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-amber-400 mx-auto mt-4 rounded-full opacity-80"></div>
    </div>
  );
};

export default BrandingHeader;