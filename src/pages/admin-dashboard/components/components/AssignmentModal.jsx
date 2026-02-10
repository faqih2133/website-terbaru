import React, { useState, useEffect, useMemo } from 'react';
import Button from '../../../../components/ui/Button';
import Icon from '../../../../components/AppIcon';
import evaluationService from '../../../../services/evaluationService';
import { npkAPI } from '../../../../lib/api'; // Backend API

const AssignmentModal = ({ isOpen, onClose, evaluator, allEmployees, allEvaluations = [], onSave }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load existing assignments when modal opens or evaluator changes
  useEffect(() => {
    const fetchAssignments = async () => {
      if (isOpen && evaluator) {
        // Don't set loading true immediately to avoid flickering if cached, 
        // but since it's a modal open, a small spinner or just waiting is fine.
        // But we have 'loading' state used for Save button. 
        // Let's add a specific loading state for fetching if we want to show a spinner, 
        // or just let it populate asynchronously.
        
        try {
          console.log(`📡 Fetching assignments for ${evaluator.name} from Backend...`);
          const response = await npkAPI.getEvaluatorAssignments(evaluator.id);
          
          if (response.success && Array.isArray(response.data)) {
             console.log(`✅ Loaded ${response.data.length} assignments from Backend`);
             // Map backend assignments to IDs
             const backendIds = response.data.map(item => String(item.evaluee_id));
             setSelectedIds(backendIds);
          } else {
             console.log("⚠️ No assignments from backend, checking localStorage fallback...");
             const assignedIds = evaluationService.getAssignmentsForEvaluator(evaluator.id);
             setSelectedIds(assignedIds || []);
          }
        } catch (error) {
          console.warn("⚠️ Failed to fetch assignments from Backend, using LocalStorage fallback:", error);
          const assignedIds = evaluationService.getAssignmentsForEvaluator(evaluator.id);
          setSelectedIds(assignedIds || []);
        }
        
        setSearchQuery('');
      }
    };

    fetchAssignments();
  }, [isOpen, evaluator]);

  const filteredEmployees = useMemo(() => {
    if (!allEmployees) return [];
    return allEmployees.filter(emp => {
      // Exclude self
      if (evaluator && String(emp.id) === String(evaluator.id)) return false;
      
      // Exclude admin if needed (optional, user said admin adds inputs, maybe admin shouldn't be evaluated?)
      // Let's keep it flexible.

      // Filter by search
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return (
        (emp.nama || emp.name || '').toLowerCase().includes(lowerQuery) ||
        (emp.nip || '').includes(lowerQuery) ||
        (emp.jabatan || emp.position || '').toLowerCase().includes(lowerQuery)
      );
    });
  }, [allEmployees, evaluator, searchQuery]);

  const handleToggle = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    // If filtering by selected only, select all doesn't make much sense to toggle "all" of them 
    // but we can keep behavior consistent with visible list or just filtered list.
    // Let's keep it simple: Select/Deselect all *currently visible* (filtered by search)
    if (selectedIds.length === filteredEmployees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmployees.map(e => String(e.id)));
    }
  };

  const displayedEmployees = useMemo(() => {
    return filteredEmployees.filter(emp => {
      if (showSelectedOnly) {
        return selectedIds.includes(String(emp.id));
      }
      return true;
    });
  }, [filteredEmployees, showSelectedOnly, selectedIds]);

  const handleSave = () => {
    setLoading(true);
    // Simulate delay for UX
    setTimeout(() => {
      onSave(evaluator.id, selectedIds);
      setLoading(false);
      onClose();
    }, 500);
  };

  if (!isOpen || !evaluator) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Atur Penugasan Evaluee</h3>
            <p className="text-sm text-slate-500">
              Pilih pegawai yang akan dinilai oleh <span className="font-semibold text-blue-600">{evaluator.nama || evaluator.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Search & Stats */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="flex gap-4 items-center mb-3">
            <div className="relative flex-1">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari pegawai (Nama, NIP, Jabatan)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-2 rounded-lg whitespace-nowrap">
              Terpilih: <span className="text-blue-600 font-bold">{selectedIds.length}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3 px-1">
             <label className="flex items-center gap-2 cursor-pointer select-none group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showSelectedOnly ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-blue-400'}`}>
                   {showSelectedOnly && <Icon name="Check" size={14} className="text-white" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={showSelectedOnly}
                  onChange={(e) => setShowSelectedOnly(e.target.checked)}
                />
                <span className={`text-sm font-medium ${showSelectedOnly ? 'text-blue-700' : 'text-slate-600 group-hover:text-slate-800'}`}>
                  Tampilkan hanya yang terpilih
                </span>
             </label>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="text-slate-500"></div>
            <button 
              onClick={handleSelectAll}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              {selectedIds.length === filteredEmployees.length ? 'Batalkan Semua' : 'Pilih Semua (Hasil Filter)'}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50">
          <div className="grid gap-2">
            {displayedEmployees.length > 0 ? (
              displayedEmployees.map(emp => {
                const isSelected = selectedIds.includes(String(emp.id));
                return (
                  <div 
                    key={emp.id}
                    onClick={() => handleToggle(String(emp.id))}
                    className={`
                      flex items-center p-3 rounded-lg border cursor-pointer transition-all
                      ${isSelected 
                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' 
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'}
                    `}
                  >
                    <div className={`
                      w-5 h-5 rounded border flex items-center justify-center mr-4 transition-colors
                      ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}
                    `}>
                      {isSelected && <Icon name="Check" size={14} className="text-white" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className={`font-semibold ${isSelected ? 'text-blue-800' : 'text-slate-800'}`}>
                          {emp.nama || emp.name}
                        </p>
                        <div className="flex items-center gap-2">
                          {isSelected && (() => {
                            const clean = (n) => String(n || '').replace(/\s+/g, '').trim();
                            const isEvaluated = allEvaluations.some(ev => {
                              const evalueeMatch = (String(ev.evaluee_id) === String(emp.id)) || (emp.nip && clean(ev.evaluee_nip) === clean(emp.nip));
                              
                              const evaluatorTopMatch = (String(ev.evaluator_id) === String(evaluator.id)) || (evaluator.nip && clean(ev.evaluator_nip) === clean(evaluator.nip));
                              const evaluatorNestedMatch = ev.evaluators?.some(eva => 
                                (String(eva.id) === String(evaluator.id)) || (evaluator.nip && clean(eva.nip) === clean(evaluator.nip))
                              );
                              
                              const hasRatedNested = ev.evaluators?.some(eva => 
                                ((String(eva.id) === String(evaluator.id)) || (evaluator.nip && clean(eva.nip) === clean(evaluator.nip))) &&
                                (eva.has_rated || (eva.scores && Object.keys(eva.scores).length > 0 && Object.values(eva.scores).some(v => Number(v) > 0)))
                              );
                              
                              const hasRawScores = ev.raw_scores && Object.values(ev.raw_scores).some(v => Number(v) > 0);
                              
                              return evalueeMatch && (
                                (evaluatorNestedMatch && hasRatedNested) ||
                                (evaluatorTopMatch && (ev.status === 'Selesai' || hasRawScores))
                              );
                            });
                            
                            if (isEvaluated) {
                              return (
                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                                  <Icon name="Check" size={10} /> Sudah Dinilai
                                </span>
                              );
                            } else {
                              return (
                                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                                  <Icon name="Clock" size={10} /> Belum Dinilai
                                </span>
                              );
                            }
                          })()}
                          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                            {emp.nip}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">{emp.jabatan || emp.position}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-slate-400">
                <Icon name="Search" size={48} className="mx-auto mb-2 opacity-20" />
                <p>Tidak ada pegawai ditemukan</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={loading} className="min-w-[100px]">
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default AssignmentModal;
