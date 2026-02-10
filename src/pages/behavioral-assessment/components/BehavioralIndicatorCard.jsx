import React from 'react';
import Icon from '../../../components/AppIcon';

const BehavioralIndicatorCard = ({
  coreValueId,
  score,
  comment,
  onScoreChange,
  onCommentChange,
  scale = 100 // Default scale 100
}) => {
  // ✅ RATING SYSTEM BARU UNTUK SKALA 100 & 120 BERDASARKAN KRITERIA USER
  const getRatingInfo = (score) => {
    if (score === null || score === undefined) return null;

    // TOOL 1 (Scale 120)
    if (scale === 120) {
      if (score > 115) {
        return {
          level: "Di Atas Ekspektasi",
          description: "Menerapkan minimal 4 perilaku kunci dan mampu menjadi teladan yang memberi pengaruh positif",
          color: "bg-green-500",
          textColor: "text-green-700",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: "🌟",
          range: "> 115 - 120"
        };
      } else if (score > 105) {
        return {
          level: "Di Atas Ekspektasi",
          description: "Menerapkan minimal 4 perilaku kunci",
          color: "bg-blue-500",
          textColor: "text-blue-700",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          icon: "⭐",
          range: "> 105 - 115"
        };
      } else if (score > 100) {
        return {
          level: "Di Atas Ekspektasi",
          description: "Menerapkan minimal 3 perilaku kunci",
          color: "bg-cyan-500",
          textColor: "text-cyan-700",
          bgColor: "bg-cyan-50",
          borderColor: "border-cyan-200",
          icon: "⭐",
          range: "> 100 - 105"
        };
      } else if (score >= 95) {
        return {
          level: "Sesuai Ekspektasi",
          description: "Menerapkan minimal 2 perilaku kunci",
          color: "bg-yellow-500",
          textColor: "text-yellow-700",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          icon: "✅",
          range: "95 - 100"
        };
      } else if (score >= 90) {
        return {
          level: "Sesuai Ekspektasi",
          description: "Menerapkan minimal 1 perilaku kunci",
          color: "bg-orange-500",
          textColor: "text-orange-700",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          icon: "✅",
          range: "90 - < 95"
        };
      } else if (score >= 70) {
        return {
          level: "Di Bawah Ekspektasi",
          description: "Tidak ada perilaku kunci yang diterapkan",
          color: "bg-red-500",
          textColor: "text-red-700",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: "⚠️",
          range: "70 - < 90"
        };
      } else {
        return {
          level: "Di Bawah Ekspektasi",
          description: "Terdapat hukuman disiplin",
          color: "bg-purple-500",
          textColor: "text-purple-700",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          icon: "🚫",
          range: "< 70"
        };
      }
    } 
    // TOOL 2 (Scale 100)
    else {
      if (score >= 98) {
        return {
          level: "Di Atas Ekspektasi",
          description: "Menerapkan minimal 7 perilaku kunci dan mendapatkan penghargaan",
          color: "bg-green-500",
          textColor: "text-green-700",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: "🌟",
          range: "98 - 100"
        };
      } else if (score >= 96) {
        return {
          level: "Di Atas Ekspektasi",
          description: "Menerapkan minimal 6 perilaku kunci",
          color: "bg-blue-500",
          textColor: "text-blue-700",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          icon: "⭐",
          range: "96 - < 98"
        };
      } else if (score >= 94) {
        return {
          level: "Di Atas Ekspektasi",
          description: "Menerapkan minimal 5 perilaku kunci",
          color: "bg-cyan-500",
          textColor: "text-cyan-700",
          bgColor: "bg-cyan-50",
          borderColor: "border-cyan-200",
          icon: "⭐",
          range: "94 - < 96"
        };
      } else if (score >= 92) {
        return {
          level: "Sesuai Ekspektasi",
          description: "Menerapkan minimal 4 perilaku kunci",
          color: "bg-yellow-500",
          textColor: "text-yellow-700",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          icon: "✅",
          range: "92 - < 94"
        };
      } else if (score >= 90) {
        return {
          level: "Sesuai Ekspektasi",
          description: "Menerapkan minimal 3 perilaku kunci",
          color: "bg-orange-500",
          textColor: "text-orange-700",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          icon: "✅",
          range: "90 - < 92"
        };
      } else if (score >= 70) {
        return {
          level: "Di Bawah Ekspektasi",
          description: "Menerapkan minimal 2 perilaku kunci",
          color: "bg-red-500",
          textColor: "text-red-700",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: "⚠️",
          range: "70 - < 90"
        };
      } else {
        return {
          level: "Di Bawah Ekspektasi",
          description: "Dijatuhi hukuman disiplin",
          color: "bg-purple-500",
          textColor: "text-purple-700",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          icon: "🚫",
          range: "< 70"
        };
      }
    }
  };

  const ratingInfo = getRatingInfo(score);

  // ✅ VALIDASI INPUT: HANYA INTEGER 0-SCALE
  const handleScoreChange = (e) => {
    const inputValue = e.target.value;

    // Jika input kosong, set null
    if (inputValue === '') {
      onScoreChange(null);
      return;
    }

    // Parse sebagai integer
    const numericValue = parseInt(inputValue, 10);

    // Validasi: harus angka, 0-scale, tidak desimal
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= scale && inputValue === numericValue.toString()) {
      onScoreChange(numericValue);
    }
    // Jika tidak valid, jangan update
  };

  return (
    <div className="space-y-6">

      {/* ✅ INPUT NILAI - ANGKA 0-SCALE INTEGER */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
          Input Nilai ({0}-{scale})
        </label>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative">
            <input
              type="number"
              min="0"
              max={scale}
              step="1"
              value={score !== null && score !== undefined ? score : ''}
              onChange={handleScoreChange}
              onWheel={(e) => e.target.blur()}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault();
                }
              }}
              className="w-32 px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-center font-bold text-xl text-slate-900 transition-all outline-none appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-slate-300"
              placeholder="0"
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key) &&
                    e.key !== 'Backspace' &&
                    e.key !== 'Delete' &&
                    e.key !== 'Tab' &&
                    e.key !== 'Escape' &&
                    e.key !== 'Enter') {
                  e.preventDefault();
                }
              }}
            />
            <div className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none text-slate-400 text-xs font-medium">
              / {scale}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-2 flex justify-between">
              <span>Sangat Kurang (0)</span>
              <span>Sangat Baik ({scale})</span>
            </div>
            {/* Custom Range Slider Look (Visual only since we use input) */}
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out ${
                   score >= 90 ? 'bg-green-500' :
                   score >= 80 ? 'bg-blue-500' :
                   score >= 70 ? 'bg-yellow-500' :
                   score > 0 ? 'bg-red-500' : 'bg-slate-300'
                }`}
                style={{ width: `${score ? (score / scale) * 100 : 0}%` }}
              ></div>
            </div>
            {Number(score) === 0 && (
              <div className="mt-2 text-xs text-red-600 font-medium">
                Nilai tidak boleh 0. Harap isi nilai lebih dari 0 sebelum submit.
              </div>
            )}
          </div>
        </div>

        {/* Visual Rating Indicator - MENGGUNAKAN LOGIC DARI RATING INFO */}
        {ratingInfo && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
            <div className="flex items-center space-x-2">
              <span className="text-lg">
               {ratingInfo.icon}
              </span>
              <span className={`font-medium ${ratingInfo.textColor}`}>
                {ratingInfo.level} - {ratingInfo.description}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ✅ RATING DISPLAY BERDASARKAN KRITERIA BARU (Detail) */}
      {ratingInfo && (
        <div className={`p-4 rounded-lg border-2 ${ratingInfo.bgColor} ${ratingInfo.borderColor}`}>
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ratingInfo.color} text-white font-bold text-sm`}>
              {ratingInfo.icon}
            </div>
            <div className="flex-1">
              <h6 className={`font-semibold text-sm ${ratingInfo.textColor} mb-1`}>
                Rating: {ratingInfo.level}
              </h6>
              <p className="text-xs text-slate-600 leading-relaxed">
                {ratingInfo.description}
              </p>
              <div className="mt-2 text-xs font-medium text-slate-700">
                Rentang Nilai: {ratingInfo.range}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Komentar (Opsional) */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
           <Icon name="MessageSquare" size={16} className="text-slate-400" />
           Komentar (Opsional)
        </label>
        <textarea
          value={comment || ''}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Berikan komentar atau contoh perilaku yang diamati untuk melengkapi penilaian ini..."
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 resize-none transition-all"
          rows={3}
        />
      </div>
    </div>
  );
};

export default BehavioralIndicatorCard;
