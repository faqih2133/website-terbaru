import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const EvaluatorCategorySection = ({
  category,
  title,
  description,
  evaluators,
  employeeOptions = [], // Default to empty array
  minRequired = 0,
  maxAllowed = 5,
  isExpanded,
  onToggleExpand,
  onUpdateEvaluator,
  onAddEvaluator,
  onRemoveEvaluator
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Safe filtering with default empty array
  const filteredOptions = (employeeOptions || []).filter(option =>
    option && option.label && option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option && option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getAvailableOptions = () => {
    const usedIds = evaluators.map(e => e.employeeId).filter(id => id);
    return (filteredOptions || []).filter(option => option && !usedIds.includes(option.value));
  };

  const canAddMore = evaluators.length < maxAllowed;
  const hasMinimum = evaluators.length >= minRequired;
  const hasErrors = evaluators.some(evaluator => 
    !evaluator.employeeId || 
    !evaluator.justification || 
    evaluator.justification.length < 50
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-lg">
              {category === 'supervisors' ? '👔' : 
               category === 'peers' ? '🤝' : '👥'}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">
              {title}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {description}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-xs text-slate-500">
                {evaluators.length} evaluator{evaluators.length !== 1 ? 's' : ''}
              </span>
              {minRequired > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  hasMinimum 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  Min {minRequired} required
                </span>
              )}
              {hasErrors && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                  Has errors
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <svg 
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-slate-200">
          <div className="space-y-4 mt-6">
            {evaluators.map((evaluator, index) => (
              <EvaluatorItem
                key={evaluator.id}
                evaluator={evaluator}
                index={index}
                availableOptions={getAvailableOptions()}
                onUpdate={(field, value) => onUpdateEvaluator(evaluator.id, field, value)}
                onRemove={() => onRemoveEvaluator(evaluator.id)}
                canRemove={evaluators.length > minRequired}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            ))}
          </div>

          {/* Add Button */}
          {canAddMore && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={onAddEvaluator}
                disabled={!canAddMore}
                className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah {title.toLowerCase()}
              </button>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Maksimal {maxAllowed} evaluator per kategori
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Sub-component for individual evaluator
const EvaluatorItem = ({ 
  evaluator, 
  index, 
  availableOptions, 
  onUpdate, 
  onRemove, 
  canRemove,
  searchTerm,
  onSearchChange 
}) => {
  const selectedEmployee = availableOptions.find(opt => opt && opt.value === evaluator.employeeId);
  
  return (
    <div className="bg-slate-50 rounded-lg p-4 space-y-4 border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-slate-900">
          Evaluator {index + 1}
        </h4>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 011-1v1z" />
            </svg>
          </button>
        )}
      </div>

      {/* Employee Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Pilih Pegawai
        </label>
        <Select
          value={evaluator.employeeId}
          onChange={(value) => onUpdate('employeeId', value)}
          placeholder="Cari dan pilih pegawai..."
          error={evaluator.errors?.employeeId}
          options={availableOptions || []}
          searchable={true}
          searchPlaceholder="Cari nama atau jabatan..." // ❌ REMOVE THIS PROP
        />
        {selectedEmployee && (
          <div className="mt-2 p-3 bg-white rounded border border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                {selectedEmployee.label.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-slate-900">{selectedEmployee.label}</p>
                <p className="text-sm text-slate-500">{selectedEmployee.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Justification */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Alasan Pemilihan
        </label>
        <textarea
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-colors"
          rows={4}
          placeholder="Jelaskan alasan pemilihan evaluator ini (minimal 50 karakter)..."
          value={evaluator.justification}
          onChange={(e) => onUpdate('justification', e.target.value)}
        />
        <div className="flex justify-between mt-1">
          <span className={`text-xs ${
            evaluator.errors?.justification ? 'text-red-600' : 'text-slate-500'
          }`}>
            {evaluator.errors?.justification || `${evaluator.justification.length}/50 karakter minimum`}
          </span>
          {evaluator.justification.length >= 50 && (
            <span className="text-xs text-green-600 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              ✓ Memenuhi syarat
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluatorCategorySection;