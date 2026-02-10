import React from 'react';
import evaluationService from '../../../../services/evaluationService';

const ComparisonModal = ({ isOpen, onClose, evaluation, allEvaluations = [] }) => {
  if (!isOpen || !evaluation) return null;

  // ✅ Helper: Get Rating Info (Predicate) - Synchronized with AdminDashboard
  const getRatingInfo = (score, scale) => {
    const s = Number(score);
    const sc = Number(scale);
    if (s === null || s === undefined) return { level: '-', color: 'bg-slate-100', textColor: 'text-slate-600' };

    if (sc === 120) {
      if (s > 115) return { level: 'Di Atas Ekspektasi', color: 'bg-green-100', textColor: 'text-green-700' };
      if (s > 105) return { level: 'Di Atas Ekspektasi', color: 'bg-blue-100', textColor: 'text-blue-700' };
      if (s > 100) return { level: 'Di Atas Ekspektasi', color: 'bg-cyan-100', textColor: 'text-cyan-700' };
      if (s >= 95) return { level: 'Sesuai Ekspektasi', color: 'bg-yellow-100', textColor: 'text-yellow-700' };
      if (s >= 90) return { level: 'Sesuai Ekspektasi', color: 'bg-orange-100', textColor: 'text-orange-700' };
      if (s >= 70) return { level: 'Di Bawah Ekspektasi', color: 'bg-red-100', textColor: 'text-red-700' };
      return { level: 'Di Bawah Ekspektasi', color: 'bg-purple-100', textColor: 'text-purple-700' };
    } else {
      if (s >= 98) return { level: 'Di Atas Ekspektasi', color: 'bg-green-100', textColor: 'text-green-700' };
      if (s >= 96) return { level: 'Di Atas Ekspektasi', color: 'bg-blue-100', textColor: 'text-blue-700' };
      if (s >= 94) return { level: 'Di Atas Ekspektasi', color: 'bg-cyan-100', textColor: 'text-cyan-700' };
      if (s >= 92) return { level: 'Sesuai Ekspektasi', color: 'bg-yellow-100', textColor: 'text-yellow-700' };
      if (s >= 90) return { level: 'Sesuai Ekspektasi', color: 'bg-orange-100', textColor: 'text-orange-700' };
      if (s >= 70) return { level: 'Di Bawah Ekspektasi', color: 'bg-red-100', textColor: 'text-red-700' };
      return { level: 'Di Bawah Ekspektasi', color: 'bg-purple-100', textColor: 'text-purple-700' };
    }
  };

  // ✅ Helper: Get Evaluator Counts
  const getEvaluatorCounts = () => {
    const bd = evaluation.npk_calculation?.aspectDetails?.[0]?.breakdown;
    if (bd) {
      const totalAtasan = bd.totalAtasan !== undefined ? bd.totalAtasan : bd.countAtasan;
      const totalPeers = bd.totalPeers !== undefined ? bd.totalPeers : bd.countPeers;
      const totalBawahan = bd.totalBawahan !== undefined ? bd.totalBawahan : bd.countBawahan;
      return {
        supervisor: { completed: bd.countAtasan || 0, total: totalAtasan || 0 },
        peers: { completed: bd.countPeers || 0, total: totalPeers || 0 },
        subordinate: { completed: bd.countBawahan || 0, total: totalBawahan || 0 }
      };
    }
    // Fallback: derive from evaluators list when breakdown is missing
    const evals = Array.isArray(evaluation.evaluators) ? evaluation.evaluators : [];
    if (evals.length === 0) return null;
    const norm = (r) => String(r || '').toLowerCase();
    const sup = evals.filter(e => {
      const r = norm(e.role || e.category);
      return r === 'supervisor' || r === 'atasan' || r === 'admin' || r.includes('supervi');
    }).length;
    const peer = evals.filter(e => {
      const r = norm(e.role || e.category);
      return r === 'peer' || r === 'rekan' || r === 'sejawat' || r.includes('peer');
    }).length;
    const sub = evals.filter(e => {
      const r = norm(e.role || e.category);
      return r === 'subordinate' || r === 'bawahan' || r === 'staf' || r.includes('subordinat');
    }).length;
    return {
      supervisor: { completed: sup, total: sup },
      peers: { completed: peer, total: peer },
      subordinate: { completed: sub, total: sub }
    };
  };

  // ✅ Helper: Get Participation Color
  const getParticipationColor = (completed, total) => {
    if (total === 0 && completed === 0) return 'bg-slate-100 text-slate-500 border-slate-200'; // No evaluators assigned
    if (completed >= total && total > 0) return 'bg-green-100 text-green-700 border-green-200'; // All completed
    if (completed > 0) return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Partial
    return 'bg-red-100 text-red-700 border-red-200'; // None completed
  };

  // ✅ Helper: Get Aspect Color (for consistent UI styling)
  const getAspectColor = (index) => {
    const colors = [
      'bg-blue-50 border border-blue-100',
      'bg-purple-50 border border-purple-100',
      'bg-emerald-50 border border-emerald-100',
      'bg-amber-50 border border-amber-100',
      'bg-rose-50 border border-rose-100',
      'bg-cyan-50 border border-cyan-100',
      'bg-indigo-50 border border-indigo-100'
    ];
    return colors[index % colors.length];
  };

  const counts = getEvaluatorCounts();
  const npkPredicate = getRatingInfo(evaluation.npk_calculation?.npkPeriodik, Number(evaluation.scale));

  // Determine status (Supervisory vs Non-Supervisory)
  const isSupervisory = (evaluation.is_supervisory !== undefined) 
    ? evaluation.is_supervisory 
    : (evaluation.evaluee_position && !evaluation.evaluee_position.toLowerCase().includes('tanpa supervisi') && 
       (evaluation.evaluee_position.toLowerCase().includes('supervisi') || 
        evaluation.evaluee_position.toLowerCase().includes('kepala') || 
        evaluation.evaluee_position.toLowerCase().includes('manajer')));

  // Determine Condition Label based on weighting_condition code
  const getConditionLabel = (code) => {
    const labels = {
      'complete': 'Lengkap',
      'complete_supervisory': 'Lengkap (Supervisi)',
      'complete_non_supervisory': 'Lengkap (Non-Supervisi)',
      'noSupervisor': 'Tanpa Atasan',
      'noPeers': 'Tanpa Rekan (Peers)',
      'noSubordinates': 'Tanpa Bawahan',
      'noSupervisorPeers': 'Hanya Bawahan',
      'noSupervisorSubordinates': 'Hanya Rekan',
      'noPeersSubordinates': 'Hanya Atasan'
    };
    return labels[code] || code || 'Normal';
  };

  const conditionLabel = getConditionLabel(evaluation.npk_calculation?.kondisi || evaluation.weighting_condition);

  // ✅ Prepare Distribution Data for Chart (Predicate Distribution)
  const getDistributionData = () => {
    if (!allEvaluations || allEvaluations.length === 0) return [];

    // Filter evaluations: Same Period, Same Scale, Completed Status (optional, but cleaner)
    const relevantEvaluations = allEvaluations.filter(ev => 
      ev.evaluation_period === evaluation.evaluation_period && 
      Number(ev.scale) === Number(evaluation.scale)
    );

    // Initialize counts for standard predicates
    const distribution = {
      'Di Bawah Ekspektasi': 0,
      'Sesuai Ekspektasi': 0,
      'Di Atas Ekspektasi': 0
    };

    relevantEvaluations.forEach(ev => {
      const score = ev.npk_calculation?.npkPeriodik ?? ev.nilai_nkp ?? 0;
      const info = getRatingInfo(score, Number(ev.scale));
      // Normalize predicate names to match keys
      let key = info.level;
      if (key.includes('Di Atas')) key = 'Di Atas Ekspektasi';
      else if (key.includes('Sesuai')) key = 'Sesuai Ekspektasi';
      else if (key.includes('Di Bawah')) key = 'Di Bawah Ekspektasi';
      
      if (distribution[key] !== undefined) {
        distribution[key]++;
      }
    });

    // Convert to array for chart
    return Object.entries(distribution).map(([label, count]) => ({
      label,
      count,
      isCurrent: label === npkPredicate.level // Exact match to avoid partial matching issues
    }));
  };

  const distributionData = getDistributionData();
  const maxCount = Math.max(...distributionData.map(d => d.count), 1); // Avoid div by zero

  // Chart Dimensions
  const CHART_WIDTH = 600;
  const CHART_HEIGHT = 250;
  const PADDING_X = 60;
  const PADDING_Y = 40;
  const BAR_WIDTH = 80;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Detail Penilaian Perilaku</h3>
            <p className="text-sm text-slate-500">Periode {evaluation.evaluation_period} • Skala {evaluation.scale}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Informasi Dasar & Evaluator Counts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Info Evaluasi */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                Informasi Evaluasi
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Evaluee</span>
                  <span className="font-semibold text-slate-900">{evaluation.evaluee_name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">NIP</span>
                  <span className="font-mono font-medium text-slate-700">{evaluation.evaluee_nip}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Unit</span>
                  <span className="font-medium text-slate-900 text-right">{evaluation.evaluee_department}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-500">Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    evaluation.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {evaluation.status}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right Column: Hasil Penilaian & Counts */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                  Hasil Penilaian
                </h4>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-sm text-slate-500">NPK Periodik</span>
                  <span className="text-3xl font-bold text-slate-900">
                    {evaluation.npk_calculation?.npkPeriodik?.toFixed(2)}
                  </span>
                </div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${npkPredicate.color} ${npkPredicate.textColor}`}>
                  Predikat: {npkPredicate.level}
                </div>
                {(() => {
                  const scale = Number(evaluation.scale);
                  const periodik = Number(evaluation.npk_calculation?.npkPeriodik || 0);
                  let minReq = '';
                  if (scale === 120) {
                    if (periodik > 115) minReq = '≥ 4';
                    else if (periodik > 105) minReq = '≥ 4';
                    else if (periodik > 100) minReq = '≥ 3';
                    else if (periodik >= 95) minReq = '≥ 2';
                    else if (periodik >= 90) minReq = '≥ 1';
                    else if (periodik >= 70) minReq = '≥ 0';
                    else minReq = '≥ 0';
                  } else {
                    if (periodik >= 98) minReq = '≥ 7';
                    else if (periodik >= 96) minReq = '≥ 6';
                    else if (periodik >= 94) minReq = '≥ 5';
                    else if (periodik >= 92) minReq = '≥ 4';
                    else if (periodik >= 90) minReq = '≥ 3';
                    else if (periodik >= 70) minReq = '≥ 2';
                    else minReq = '≥ 0';
                  }
                  const aspects = evaluation.npk_calculation?.aspectDetails || [];
                  
                  const topNames = aspects.slice()
                    .filter(d => d.name && !d.name.toLowerCase().includes('memimpin'))
                    .sort((a,b)=>Number(b.indeksCapaian||0)-Number(a.indeksCapaian||0))
                    .slice(0,2)
                    .map(d=>d.name);

                  const w = aspects[0]?.breakdown?.weights || 
                            evaluation.npk_calculation?.weights || {};
                  
                  let wSup = Number(w.supervisor || 0);
                  let wPeers = Number(w.peers || w.peer || 0);
                  let wSub = Number(w.subordinates || w.subordinate || 0);

                  // ✅ Auto-fix for zero weights if participation exists (Display only)
                  // Check if weights are all zero OR effectively zero/invalid
                  if ((wSup <= 0 && wPeers <= 0 && wSub <= 0) && counts) {
                    // Prioritize detecting "Only Peers" case which is most common issue
                    if (counts.peers.completed > 0 && counts.supervisor.completed === 0 && counts.subordinate.completed === 0) {
                      wPeers = 100; // Assume Peers Only
                      wSup = 0;
                      wSub = 0;
                    } else if (counts.supervisor.completed > 0 && counts.peers.completed === 0 && counts.subordinate.completed === 0) {
                      wSup = 100; // Assume Supervisor Only
                      wPeers = 0;
                      wSub = 0;
                    } else if (counts.supervisor.completed > 0 && counts.peers.completed > 0 && counts.subordinate.completed === 0) {
                       // Supervisor + Peers
                       wSup = 60; wPeers = 40; wSub = 0;
                    } else if (counts.subordinate.completed > 0 && counts.supervisor.completed === 0 && counts.peers.completed === 0) {
                       // Only Subordinates
                       wSub = 100; wSup = 0; wPeers = 0;
                    }
                  }

                  let cond = 'balanced';
                  if (wSup > 0 && wPeers === 0 && wSub === 0) cond = 'supervisorOnly';
                  else if (wSup === 0 && wPeers > 0 && wSub === 0) cond = 'peersOnly';
                  else if (wSup === 0 && wPeers === 0 && wSub > 0) cond = 'noSupervisorPeers';
                  else if (wSup > 0 && wPeers > 0 && wSub === 0) cond = 'noSubordinates';
                  else if (wSup > 0 && wPeers > 0 && wSub > 0) cond = 'complete';
                  
                  const weightText = `Atasan ${wSup}% • Peers ${wPeers}% • Bawahan ${wSub}%`;
                  const scaleLabel = scale === 120 ? 'Tool 1 (Skala 120)' : 'Tool 2 (Skala 100)';
                  const summaryText = `Predikat ${npkPredicate.level} karena NPK Periodik ${periodik.toFixed(2)} berada pada rentang panduan ${scaleLabel}. Kebutuhan minimal perilaku kunci: ${minReq}. Pembobotan kondisi: ${cond} (${weightText}). Kontribusi terbesar dari aspek: ${topNames && topNames.length ? topNames.join(', ') : '-'}.`;
                  return <p className="mt-3 text-xs text-slate-600">{summaryText}</p>;
                })()}
              </div>

              {counts && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Partisipasi Penilai</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {/* Atasan */}
                    <div className={`p-2 rounded-lg border shadow-sm ${getParticipationColor(counts.supervisor.completed, counts.supervisor.total)}`}>
                      <div className="text-xs opacity-80">Atasan</div>
                      <div className="font-bold">
                        {counts.supervisor.completed}
                        {counts.supervisor.total > 0 && <span className="text-xs opacity-70">/{counts.supervisor.total}</span>}
                      </div>
                    </div>
                    
                    {/* Rekan */}
                    <div className={`p-2 rounded-lg border shadow-sm ${getParticipationColor(counts.peers.completed, counts.peers.total)}`}>
                      <div className="text-xs opacity-80">Rekan</div>
                      <div className="font-bold">
                        {counts.peers.completed}
                        {counts.peers.total > 0 && <span className="text-xs opacity-70">/{counts.peers.total}</span>}
                      </div>
                    </div>
                    
                    {/* Bawahan */}
                    <div className={`p-2 rounded-lg border shadow-sm ${getParticipationColor(counts.subordinate.completed, counts.subordinate.total)}`}>
                      <div className="text-xs opacity-80">Bawahan</div>
                      <div className="font-bold">
                        {counts.subordinate.completed}
                        {counts.subordinate.total > 0 && <span className="text-xs opacity-70">/{counts.subordinate.total}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          
          {/* Indeks Capaian Per Core Value */}
          {evaluation.npk_calculation?.aspectDetails && (
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-lg">Indeks Capaian Per Core Value</h4>
              {(() => {
                const details = evaluation.npk_calculation.aspectDetails || [];
                const byKey = {};
                details.forEach(d => {
                  const rawKey = (d.coreValue || d.name || '').toLowerCase();
                  const normKey = rawKey.replace(/\s*&\s*/g, '_').replace(/\s+/g, '_');
                  byKey[normKey] = d;
                });
                const valOf = (k) => {
                  const v = byKey[k]?.indeksCapaian;
                  return v !== undefined && v !== null ? Number(v) : undefined;
                };
                const scaleNum = Number(evaluation.scale);
                const kh = valOf('kolaboratif_harmonis');
                const al = valOf('akuntabel_loyal');
                
                let orderedKeys = [];
                if (scaleNum === 120) {
                   orderedKeys = [
                    'berorientasi_pelayanan',
                    'akuntabel',
                    'kompeten',
                    'harmonis',
                    'loyal',
                    'adaptif',
                    'kolaboratif',
                    'kepemimpinan'
                  ];
                } else {
                  orderedKeys = [
                    'berorientasi_pelayanan',
                    'akuntabel_loyal', // Combined for Tool 2
                    'kompeten',
                    'kolaboratif_harmonis', // Combined for Tool 2
                    'adaptif',
                    'kepemimpinan'
                  ];
                }

                const display = orderedKeys.map(k => {
                  const original = byKey[k];
                  let val = valOf(k);
                  
                  // Fallback for Scale 120: If split value is missing, use combined
                  if (scaleNum === 120) {
                    if ((k === 'akuntabel' || k === 'loyal') && (val === undefined || val === 0) && al !== undefined) {
                      val = al;
                    }
                    if ((k === 'kolaboratif' || k === 'harmonis') && (val === undefined || val === 0) && kh !== undefined) {
                      val = kh;
                    }
                  }
                  
                  // For Scale 100, we expect combined keys, so valOf should work directly.
                  // If standard keys are used in data but we want combined, we might need reverse logic?
                  // But usually data is combined for Scale 100.
                  
                  const breakdown = original?.breakdown || {};
                  // If we fallback to combined, we should also try to get breakdown from combined if missing
                  if (scaleNum === 120 && (val === al || val === kh)) {
                     const source = (val === al) ? byKey['akuntabel_loyal'] : byKey['kolaboratif_harmonis'];
                     if (source && (!breakdown || !breakdown.npkAtasan)) {
                        // Copy breakdown from source
                        Object.assign(breakdown, source.breakdown || {});
                     }
                  }
                  
                  // Effective weights fallback: when weights are zero or missing, derive from counts and supervisory status
                  const wObj = breakdown.weights || {};
                  let wSup = Number(wObj.supervisor || 0);
                  let wPeers = Number(wObj.peers || wObj.peer || 0);
                  let wSub = Number(wObj.subordinates || wObj.subordinate || 0);
                  const sumW = wSup + wPeers + wSub;
                  
                  if (sumW === 0) {
                    // Derive weights based on participation counts and isSupervisory
                    const hasSup = counts ? (counts.supervisor.completed > 0) : false;
                    const hasPeers = counts ? (counts.peers.completed > 0) : false;
                    const hasSub = counts ? (counts.subordinate.completed > 0) : false;
                    
                    if (isSupervisory) {
                      if (hasSup && hasPeers && hasSub) { wSup = 60; wPeers = 15; wSub = 25; }
                      else if (!hasSup && hasPeers && hasSub) { wSup = 0; wPeers = 40; wSub = 60; }
                      else if (hasSup && !hasPeers && hasSub) { wSup = 70; wPeers = 0; wSub = 30; }
                      else if (hasSup && hasPeers && !hasSub) { wSup = 80; wPeers = 20; wSub = 0; }
                      else if (!hasSup && !hasPeers && hasSub) { wSup = 0; wPeers = 0; wSub = 100; }
                      else if (!hasSup && hasPeers && !hasSub) { wSup = 0; wPeers = 100; wSub = 0; }
                      else if (hasSup && !hasPeers && !hasSub) { wSup = 100; wPeers = 0; wSub = 0; }
                    } else {
                      if (hasSup && hasPeers) { wSup = 60; wPeers = 40; wSub = 0; }
                      else if (!hasSup && hasPeers) { wSup = 0; wPeers = 100; wSub = 0; }
                      else if (hasSup && !hasPeers) { wSup = 100; wPeers = 0; wSub = 0; }
                    }
                    
                    breakdown.weights = { supervisor: wSup, peers: wPeers, subordinates: wSub };
                  } else {
                    breakdown.weights = { supervisor: wSup, peers: wPeers, subordinates: wSub };
                  }

                  const aspectPredicate = getRatingInfo(val ?? 0, scaleNum);
                  return {
                    key: k,
                    name: evaluationService.getCoreValueName(k, scaleNum),
                    value: Number((val ?? 0).toFixed(2)),
                    breakdown
                  };
                });
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {display.map((row, idx) => {
                      const aspectPredicate = getRatingInfo(row.value, scaleNum);
                      return (
                        <div key={`${row.key}-${idx}`} className={`p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow ${getAspectColor(idx)}`}>
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-bold text-slate-900 text-lg">{row.name}</h5>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-slate-800">{row.value.toFixed(2)}</div>
                              <div className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 ${aspectPredicate.color} ${aspectPredicate.textColor}`}>
                                {aspectPredicate.level}
                              </div>
                            </div>
                          </div>
                          
                          {row.breakdown && (
                            <div className="mt-3 pt-3 border-t border-black/5">
                              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                <div className="bg-white/60 p-2 rounded-lg">
                                  <span className="block text-xs font-medium text-slate-500 mb-1">
                                    Atasan ({row.breakdown.weights?.supervisor}%)
                                  </span>
                                  <span className="font-bold text-slate-700">
                                    {(() => {
                                      const w = Number(row.breakdown.weights?.supervisor || 0);
                                      const val = Number(row.breakdown.npkAtasan || 0);
                                      const base = Number(row.value || 0);
                                      const out = val > 0 ? val : (w > 0 ? (base * w / 100) : 0);
                                      return Number(out).toFixed(2);
                                    })()}
                                  </span>
                                </div>
                                <div className="bg-white/60 p-2 rounded-lg">
                                  <span className="block text-xs font-medium text-slate-500 mb-1">
                                    Rekan ({row.breakdown.weights?.peers}%)
                                  </span>
                                  <span className="font-bold text-slate-700">
                                    {(() => {
                                      const w = Number(row.breakdown.weights?.peers || row.breakdown.weights?.peer || 0);
                                      const val = Number(row.breakdown.npkPeers || 0);
                                      const base = Number(row.value || 0);
                                      const out = val > 0 ? val : (w > 0 ? (base * w / 100) : 0);
                                      return Number(out).toFixed(2);
                                    })()}
                                  </span>
                                </div>
                                <div className="bg-white/60 p-2 rounded-lg">
                                  <span className="block text-xs font-medium text-slate-500 mb-1">
                                    Bawahan ({row.breakdown.weights?.subordinates}%)
                                  </span>
                                  <span className="font-bold text-slate-700">
                                    {(() => {
                                      const w = Number(row.breakdown.weights?.subordinates || row.breakdown.weights?.subordinate || 0);
                                      const val = Number(row.breakdown.npkBawahan || 0);
                                      const base = Number(row.value || 0);
                                      const out = val > 0 ? val : (w > 0 ? (base * w / 100) : 0);
                                      return Number(out).toFixed(2);
                                    })()}
                                  </span>
                                </div>
                              </div>
                               {Array.isArray(evaluation.evaluators) && evaluation.evaluators.length > 0 && (
                                 <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                   {evaluation.evaluators.map((ev, i) => {
                                     const r = String(ev.role || ev.category || '').toLowerCase();
                                     const roleText = r.includes('atasan') || r.includes('supervisor') ? 'Atasan' :
                                                      r.includes('bawahan') || r.includes('subordinate') ? 'Bawahan' : 'Rekan';
                                     const hasRated = Boolean(ev.has_rated) || Object.values(ev.scores || {}).some(v => Number(v) > 0);
                                     return (
                                       <div key={`${ev.id || i}-${roleText}`} className="flex items-center justify-between px-2 py-1 rounded-lg bg-white/50">
                                         <div className="text-xs text-slate-700">
                                           <span className="font-semibold">{ev.name || 'Anonim'}</span>
                                           <span className="ml-1 text-slate-500">({roleText})</span>
                                         </div>
                                         <div className={`text-xs font-semibold ${hasRated ? 'text-emerald-600' : 'text-slate-400'}`}>
                                           {hasRated ? 'Selesai' : 'Belum'}
                                         </div>
                                       </div>
                                     );
                                   })}
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Comments */}
          {evaluation.comments && Object.keys(evaluation.comments).length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-lg">Komentar Evaluator (Per Aspek)</h4>
              {(() => {
                const comments = evaluation.comments || {};
                const grouped = Object.entries(comments).reduce((acc, [key, comment]) => {
                  if (!comment) return acc;
                  let aspectKey = String(key).split('_')[0];
                  if (String(key).startsWith('berorientasi_pelayanan')) aspectKey = 'berorientasi_pelayanan';
                  
                  if (aspectKey === 'harmonis' || aspectKey === 'kolaboratif') aspectKey = 'kolaboratif_harmonis';
                  if (aspectKey === 'akuntabel' || aspectKey === 'loyal') aspectKey = 'akuntabel_loyal';
                  (acc[aspectKey] = acc[aspectKey] || []).push(comment);
                  return acc;
                }, {});
                const scaleNum = Number(evaluation.scale);
                return (
                  <div className="space-y-3">
                    {Object.entries(grouped).map(([aspectKey, list]) => {
                      return (
                        <div key={aspectKey} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="font-semibold text-slate-900 mb-1">{evaluationService.getCoreValueName(aspectKey, scaleNum)}</div>
                          <div className="space-y-1">
                            {list.map((c, i) => (
                              <div key={i} className="text-slate-600 italic text-sm">"{c}"</div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Calculation Details */}
          {evaluation.npk_calculation?.calculation && (
            <div>
              <h4 className="font-bold text-slate-900 mb-4 text-lg">Detail Perhitungan NPK</h4>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm space-y-2">
                <p><span className="font-semibold text-slate-700">Formula:</span> <span className="text-slate-600">{evaluation.npk_calculation.calculation.formula}</span></p>
                <p><span className="font-semibold text-slate-700">Deskripsi:</span> <span className="text-slate-600">{evaluation.npk_calculation.calculation.description}</span></p>
                <p><span className="font-semibold text-slate-700">Jumlah Indeks:</span> <span className="text-slate-600">{evaluation.npk_calculation.calculation.sum?.toFixed(2)}</span></p>
                <p><span className="font-semibold text-slate-700">Jumlah Core Values:</span> <span className="text-slate-600">{evaluation.npk_calculation.calculation.aspectIndices?.length}</span></p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex justify-end z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
