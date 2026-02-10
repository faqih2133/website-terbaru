import React from 'react';
import Icon from '../../../components/AppIcon';
import BehavioralIndicatorCard from './BehavioralIndicatorCard';

const CoreValueSection = ({ 
  coreValue, 
  score, 
  comment, 
  onScoreChange, 
  onCommentChange, 
  isExpanded, 
  onToggle, 
  scale, 
  index 
}) => {
  const isCompleted = score !== undefined && score !== null && score !== '';
  const indicators = (coreValue.coreValues || []).slice(0, 7);
  const primaryScoreKey =
    indicators[0] ||
    coreValue?.coreValues?.[0] ||
    coreValue?.title ||
    coreValue?.id;
  // const completionPercentage = isCompleted ? 100 : 0; // Dihapus karena tidak digunakan

  // Color schemes based on index
  const colorSchemes = [
    { bg: 'from-blue-500 to-indigo-600', border: 'border-blue-200', bgLight: 'bg-blue-50/50' },
    { bg: 'from-emerald-500 to-teal-600', border: 'border-emerald-200', bgLight: 'bg-emerald-50/50' },
    { bg: 'from-purple-500 to-violet-600', border: 'border-purple-200', bgLight: 'bg-purple-50/50' },
    { bg: 'from-amber-500 to-orange-600', border: 'border-amber-200', bgLight: 'bg-amber-50/50' },
    { bg: 'from-rose-500 to-pink-600', border: 'border-rose-200', bgLight: 'bg-rose-50/50' },
    { bg: 'from-cyan-500 to-blue-600', border: 'border-cyan-200', bgLight: 'bg-cyan-50/50' },
    { bg: 'from-lime-500 to-green-600', border: 'border-lime-200', bgLight: 'bg-lime-50/50' }
  ];
  
  const colorScheme = colorSchemes[index % colorSchemes.length];

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition-all duration-300 ${
      isCompleted ? `border-l-4 ${colorScheme.border.replace('border', 'border-l')}` : ''
    }`}>
      
      {/* Modern Header */}
      <div 
        className="p-6 cursor-pointer group"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Icon & Number */}
            <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-br ${colorScheme.bg} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300`}>
              <span className="text-white font-bold text-lg">{index + 1}</span>
              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Icon name="Check" size={12} className="text-emerald-500" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-bold transition-colors duration-300 ${
                isCompleted ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'
              }`}>
                {coreValue.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed line-clamp-2 group-hover:text-slate-600 transition-colors">
                {coreValue.description}
              </p>
              
              {/* Indicators Count */}
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Icon name="Target" size={12} color="currentColor" />
                  <span>{indicators.length} Indikator</span>
                </div>
                {scale && (
                  <div className="flex items-center space-x-1 text-xs text-slate-500">
                    <Icon name="BarChart3" size={12} color="currentColor" />
                    <span>Skala {scale}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center space-x-3 ml-4">
            {/* Completion Badge */}
            {isCompleted ? (
              <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                <Icon name="CheckCircle" size={12} color="currentColor" />
                <span>Selesai</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                <Icon name="Clock" size={12} color="currentColor" />
                <span>Belum Dinilai</span>
              </div>
            )}

            {/* Score Display */}
            {isCompleted && (
              <div className={`px-3 py-1 rounded-lg text-sm font-bold ${
                scale === 120 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {score}/{scale || 100}
              </div>
            )}

            {/* Expand Icon */}
            <div className={`p-2 rounded-full hover:bg-slate-100 transition-all duration-300 ${isExpanded ? 'bg-slate-100 rotate-180' : ''}`}>
              <Icon name="ChevronDown" size={20} className="text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50">
          <div className="p-6 space-y-6">
            
            {/* Indicators List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Icon name="List" size={14} />
                7 Indikator Perilaku Kunci
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {indicators.map((indicator, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                    <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-100">
                      <span className="text-xs font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{indicator}</p>
                  </div>
                )) || (
                  <p className="text-sm text-slate-500 italic">Tidak ada core values yang tersedia</p>
                )}
              </div>
              {indicators.length > 0 && indicators.length < 7 && (
                <p className="text-xs text-amber-600 mt-2">
                  Catatan: indikator yang tersedia saat ini {indicators.length} dari 7.
                </p>
              )}
            </div>

            {/* Behavioral Assessment Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <BehavioralIndicatorCard
                coreValueId={coreValue.id}
                score={score}
                comment={comment}
                onScoreChange={(val) => onScoreChange(primaryScoreKey, val)}
                onCommentChange={(val) => onCommentChange(primaryScoreKey, val)}
                scale={scale}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoreValueSection;