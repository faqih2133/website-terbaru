import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const PhaseActionCard = ({ phaseAction }) => {
  const navigate = useNavigate();

  const getPhaseIcon = (phaseId) => {
    switch (phaseId) {
      case 'proposal':
        return 'FileEdit';
      case 'assessment':
        return 'ClipboardCheck';
      case 'review':
        return 'Award';
      default:
        return 'FileText';
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          color: 'emerald',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          label: 'Selesai'
        };
      case 'in_progress':
        return {
          color: 'blue',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          label: 'Sedang Berlangsung'
        };
      case 'pending':
        return {
          color: 'amber',
          bgColor: 'bg-amber-50',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-200',
          label: 'Menunggu'
        };
      case 'locked':
        return {
          color: 'slate',
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-500',
          borderColor: 'border-slate-200',
          label: 'Terkunci'
        };
      default:
        return {
          color: 'slate',
          bgColor: 'bg-slate-50',
          textColor: 'text-slate-500',
          borderColor: 'border-slate-200',
          label: 'Tidak Aktif'
        };
    }
  };

  const handleAction = () => {
    if (phaseAction?.actionRoute && phaseAction?.status !== 'locked') {
      navigate(phaseAction?.actionRoute);
    }
  };

  const statusConfig = getStatusConfig(phaseAction?.status);

  return (
    <div className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border transition-all duration-500 overflow-hidden ${
      phaseAction?.status === 'locked' ? 'opacity-60' : 'hover:shadow-2xl hover:-translate-y-1'
    } ${statusConfig.borderColor} ${phaseAction?.status === 'in_progress' ? 'ring-2 ring-blue-400/50' : ''}`}>

      {/* Background gradient overlay */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${
        phaseAction?.gradient || 'from-slate-500 to-slate-600'
      }`}></div>

      <div className="relative z-10">

        {/* Header */}
        <div className="flex items-start space-x-4 mb-6">
          <div className={`w-14 h-14 bg-gradient-to-br ${phaseAction?.gradient || 'from-slate-500 to-slate-600'} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon name={getPhaseIcon(phaseAction?.id)} size={28} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                {phaseAction?.title}
              </h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}>
                {statusConfig.label}
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm">
              {phaseAction?.description}
            </p>
          </div>
        </div>

        {/* Metrics */}
        {phaseAction?.metrics && phaseAction?.metrics.length > 0 && (
          <div className="space-y-3 mb-6 p-4 bg-slate-50/50 rounded-2xl">
            {phaseAction?.metrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name={metric?.icon} size={16} color="var(--color-slate-600)" />
                  <span className="text-sm text-slate-600 font-medium">
                    {metric?.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {metric?.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pending Actions */}
        {phaseAction?.pendingActions && phaseAction?.pendingActions.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50/50 rounded-2xl border border-amber-200/50">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="AlertCircle" size={16} color="var(--color-amber)" />
              <span className="text-sm font-semibold text-amber-800">Tindakan Diperlukan:</span>
            </div>
            <ul className="space-y-2">
              {phaseAction?.pendingActions.map((action, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-xs text-amber-700 leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Button */}
        {phaseAction?.actionLabel && phaseAction?.status !== 'locked' && (
          <button
            onClick={handleAction}
            disabled={phaseAction?.status === 'locked'}
            className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-2xl font-semibold transition-all duration-300 ${
              phaseAction?.status === 'completed'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                : phaseAction?.status === 'in_progress'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
            }`}
          >
            <Icon
              name={phaseAction?.status === 'completed' ? 'Eye' : 'ArrowRight'}
              size={18}
              color={phaseAction?.status === 'completed' ? 'currentColor' : 'white'}
            />
            <span>{phaseAction?.actionLabel}</span>
          </button>
        )}

        {/* Locked State */}
        {phaseAction?.status === 'locked' && (
          <div className="w-full flex items-center justify-center space-x-2 py-3 px-6 bg-slate-100 text-slate-500 rounded-2xl font-medium border-2 border-dashed border-slate-300">
            <Icon name="Lock" size={18} color="currentColor" />
            <span>Tahap Terkunci</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhaseActionCard;