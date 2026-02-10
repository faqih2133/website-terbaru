import React from 'react';

const IntervalChart = ({ score, scale, ranges }) => {
  const safeScore = Number(score) || 0;
  const max = scale;
  
  // Calculate percentage for marker position
  const percent = Math.min(Math.max((safeScore / max) * 100, 0), 100);

  return (
    <div className="mt-6 mb-8">
      {/* Bar Label */}
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>0</span>
        <span>{scale}</span>
      </div>

      {/* Chart Bar */}
      <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden relative shadow-inner">
        {ranges.map((range, idx) => {
          const width = ((range.max - range.min) / max) * 100;
          return (
            <div 
              key={idx} 
              style={{ width: `${width}%` }} 
              className={`${range.color} h-full transition-all duration-300`}
              title={`${range.label} (${range.min} - ${range.max})`}
            />
          );
        })}
      </div>

      {/* Marker */}
      <div className="relative h-8 mt-1">
         <div 
           className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500 z-10"
           style={{ left: `${percent}%` }}
         >
           {/* Triangle Pointer */}
           <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-slate-800"></div>
           
           {/* Score Label */}
           <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg mt-0.5 whitespace-nowrap">
             {safeScore.toFixed(2)}
           </div>
         </div>
      </div>

      {/* Legend (Simplified) */}
      <div className="flex flex-wrap gap-2 mt-1 justify-center">
        {ranges.filter(r => (r.max - r.min) >= 5).map((r, i) => ( // Only show larger ranges in legend to avoid clutter
            <div key={i} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${r.color}`}></div>
                <span className="text-[10px] text-slate-500">{r.label}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

const ScaleComparisonModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  // Define ranges for Tool 1 (Scale 120)
  const ranges120 = [
    { min: 0, max: 70, color: 'bg-purple-200', label: 'Hukuman Disiplin' },
    { min: 70, max: 90, color: 'bg-red-300', label: 'Di Bawah Ekspektasi' },
    { min: 90, max: 95, color: 'bg-orange-300', label: 'Sesuai (Min 1)' },
    { min: 95, max: 100, color: 'bg-yellow-300', label: 'Sesuai (Min 2)' },
    { min: 100, max: 105, color: 'bg-cyan-300', label: 'Di Atas (Min 3)' },
    { min: 105, max: 115, color: 'bg-blue-300', label: 'Di Atas (Min 4)' },
    { min: 115, max: 120, color: 'bg-green-400', label: 'Di Atas (Teladan)' },
  ];

  // Define ranges for Tool 2 (Scale 100)
  const ranges100 = [
    { min: 0, max: 70, color: 'bg-purple-200', label: 'Hukuman Disiplin' },
    { min: 70, max: 90, color: 'bg-red-300', label: 'Di Bawah Ekspektasi' },
    { min: 90, max: 92, color: 'bg-orange-300', label: 'Sesuai (Min 3)' },
    { min: 92, max: 94, color: 'bg-yellow-300', label: 'Sesuai (Min 4)' },
    { min: 94, max: 96, color: 'bg-cyan-300', label: 'Di Atas (Min 5)' },
    { min: 96, max: 98, color: 'bg-blue-300', label: 'Di Atas (Min 6)' },
    { min: 98, max: 100, color: 'bg-green-400', label: 'Di Atas (Min 7+)' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Perbandingan Tool Penilaian</h3>
            <p className="text-sm text-slate-500">Analisis Komparatif Skala 120 (Tool 1) vs Skala 100 (Tool 2)</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tool 1 (Scale 120) */}
            <div className="bg-purple-50/50 rounded-xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                 <div>
                   <h4 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                     Tool 1 (Skala 120)
                   </h4>
                   <p className="text-xs text-purple-600 mt-1">Penilaian Perilaku Plus (8 Aspek)</p>
                 </div>
                 <div className="text-right">
                   <div className="text-3xl font-bold text-purple-700">{data.scale120?.avgNPK?.toFixed(2) || '0.00'}</div>
                   <div className="text-xs font-medium text-slate-500">Rata-rata NPK</div>
                 </div>
              </div>

              <div className="bg-white rounded-lg p-3 mb-4 border border-purple-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Jumlah Evaluasi</span>
                  <span className="font-bold text-slate-900">{data.scale120?.count || 0}</span>
                </div>
              </div>

              {/* Graphic Chart */}
              <IntervalChart 
                score={data.scale120?.avgNPK} 
                scale={120} 
                ranges={ranges120} 
              />

              <div className="text-xs text-slate-500 italic mt-2 border-t border-purple-100 pt-2">
                * Skala diperluas hingga 120 untuk performa istimewa (role model).
              </div>
            </div>

            {/* Tool 2 (Scale 100) */}
            <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h4 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                     Tool 2 (Skala 100)
                   </h4>
                   <p className="text-xs text-blue-600 mt-1">Standar Penilaian Perilaku (7 Aspek)</p>
                </div>
                <div className="text-right">
                   <div className="text-3xl font-bold text-blue-700">{data.scale100?.avgNPK?.toFixed(2) || '0.00'}</div>
                   <div className="text-xs font-medium text-slate-500">Rata-rata NPK</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 mb-4 border border-blue-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Jumlah Evaluasi</span>
                  <span className="font-bold text-slate-900">{data.scale100?.count || 0}</span>
                </div>
              </div>

              {/* Graphic Chart */}
              <IntervalChart 
                score={data.scale100?.avgNPK} 
                scale={100} 
                ranges={ranges100} 
              />
              
              <div className="text-xs text-slate-500 italic mt-2 border-t border-blue-100 pt-2">
                * Rentang predikat lebih ketat dengan interval 2 poin pada level atas.
              </div>
            </div>
          </div>
          
          {/* Summary / Insight */}
          <div className="mt-8 bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Insight Perbandingan
            </h5>
            <p className="text-sm text-slate-600 leading-relaxed">
              Perbedaan skala (100 vs 120) mempengaruhi distribusi predikat. 
              Tool 1 memberikan ruang lebih besar di area "Di Atas Ekspektasi" (>100), 
              sementara Tool 2 memiliki interval yang lebih padat di area 90-100. 
              Pastikan konversi nilai memperhatikan konteks skala masing-masing.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Tutup Perbandingan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScaleComparisonModal;