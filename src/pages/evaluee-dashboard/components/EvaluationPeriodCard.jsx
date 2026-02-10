import React from 'react';
import Icon from '../../../components/AppIcon';

const EvaluationPeriodCard = ({ evaluationPeriod }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'active':
        return {
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          label: 'Aktif',
          icon: 'PlayCircle'
        };
      case 'upcoming':
        return {
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          label: 'Akan Datang',
          icon: 'Clock'
        };
      case 'completed':
        return {
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-600',
          borderColor: 'border-slate-200',
          label: 'Selesai',
          icon: 'CheckCircle'
        };
      default:
        return {
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-500',
          borderColor: 'border-slate-200',
          label: 'Tidak Aktif',
          icon: 'XCircle'
        };
    }
  };

  const statusConfig = getStatusConfig(evaluationPeriod?.status);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/40 hover:shadow-2xl transition-all duration-500">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Icon name="Calendar" size={32} color="white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h2 className="text-2xl font-bold text-slate-900">
                {evaluationPeriod?.name}
              </h2>
              <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-semibold ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                <Icon name={statusConfig.icon} size={16} color="currentColor" />
                <span>{statusConfig.label}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-600">
                <Icon name="CalendarDays" size={16} color="currentColor" />
                <span>Periode: {evaluationPeriod?.startDate} - {evaluationPeriod?.endDate}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Icon name="Clock" size={16} color="currentColor" />
                <span>Batas: {evaluationPeriod?.submissionDeadline}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl p-6 border border-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Progress Evaluasi</h3>
            <p className="text-sm text-slate-600">Kelengkapan pengisian formulir</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{evaluationPeriod?.completionPercentage}%</div>
            <div className="text-sm text-slate-600">Selesai</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200/60 rounded-full h-4 shadow-inner overflow-hidden mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg relative"
            style={{ width: `${evaluationPeriod?.completionPercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white/60 rounded-xl border border-slate-200/50">
            <div className="text-2xl font-bold text-emerald-600">{evaluationPeriod?.daysRemaining}</div>
            <div className="text-xs text-slate-600 mt-1">Hari Tersisa</div>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-xl border border-slate-200/50">
            <div className="text-2xl font-bold text-blue-600">{Math.round(evaluationPeriod?.completionPercentage / 10)}</div>
            <div className="text-xs text-slate-600 mt-1">Formulir Lengkap</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationPeriodCard;