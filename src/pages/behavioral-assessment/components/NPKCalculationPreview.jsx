import React from 'react';
import Icon from '../../../components/AppIcon';
import evaluationService from '../../../services/evaluationService';

const NPKCalculationPreview = ({ 
  coreValues, 
  scores, 
  evaluatorCategory = 'peer', 
  evalueePosition = 'structural',
  allEvaluatorScores = {},
  scale = 100
}) => {
  // ✅ Calculate NPK Details using Service (Source of Truth)
  const calculatePreview = () => {
    // 1. Construct temporary evaluators list from allEvaluatorScores
    // allEvaluatorScores structure: { 'supervisor_1': { score_id: val }, 'peer_1': { ... } }
    const evaluators = [];
    
    Object.entries(allEvaluatorScores).forEach(([key, evalScores]) => {
      let role = 'peer';
      if (key.includes('supervisor')) role = 'supervisor';
      else if (key.includes('subordinate')) role = 'subordinate';
      
      evaluators.push({
        id: key,
        role: role,
        category: role,
        scores: evalScores
      });
    });

    // 2. Prepare Assessment Data
    const assessmentData = {
      evaluators: evaluators,
      scores: scores, // Current user's scores
      is_supervisory: evalueePosition === 'structural'
    };

    // 3. Calculate using Service
    return evaluationService.calculateNPKDetails(assessmentData, scale);
  };

  const calculation = calculatePreview();
  const weights = calculation?.weights || { supervisor: 0, peers: 0, subordinates: 0 };
  const periodicNPK = calculation?.npkPeriodik || 0;
  const rating = evaluationService.calculateOverallRating(periodicNPK, [], scale);

  const getGroupedAspectDetails = () => {
    const details = calculation?.aspectDetails || [];
    const byKey = {};
    details.forEach(d => {
      const k = (d.coreValue || d.name || '').toLowerCase();
      byKey[k] = d;
    });
    const get = (k) => byKey[k] || { indeksCapaian: 0, breakdown: { npkAtasan: 0, npkPeers: 0, npkBawahan: 0 } };
    const getWithCombinedFallback = (singleKey, combinedKeys) => {
      const d = get(singleKey);
      const hasSingle = d && d.indeksCapaian !== undefined && d.indeksCapaian !== null && Number(d.indeksCapaian) !== 0;
      if (hasSingle) return d;

      // Support array of keys or single string
      const keys = Array.isArray(combinedKeys) ? combinedKeys : [combinedKeys];
      
      for (const k of keys) {
        const c = get(k.toLowerCase());
        const hasCombined = c && c.indeksCapaian !== undefined && c.indeksCapaian !== null && Number(c.indeksCapaian) !== 0;
        if (hasCombined) {
          return {
            coreValue: singleKey,
            name: evaluationService.getCoreValueName(singleKey, scale),
            indeksCapaian: Number(c.indeksCapaian),
            breakdown: c.breakdown
          };
        }
      }
      return d;
    };
    const combineAvg = (a, b, name) => {
      const hasA = a && a.indeksCapaian !== undefined;
      const hasB = b && b.indeksCapaian !== undefined;
      const vA = Number(a?.indeksCapaian || 0);
      const vB = Number(b?.indeksCapaian || 0);
      const val = hasA && hasB ? ((vA + vB) / 2) : (hasA ? vA : (hasB ? vB : 0));
      const ba = a?.breakdown || {};
      const bb = b?.breakdown || {};
      const bAtasan = hasA && hasB ? ((Number(ba.npkAtasan || 0) + Number(bb.npkAtasan || 0)) / 2) : (hasA ? Number(ba.npkAtasan || 0) : Number(bb.npkAtasan || 0));
      const bPeers = hasA && hasB ? ((Number(ba.npkPeers || 0) + Number(bb.npkPeers || 0)) / 2) : (hasA ? Number(ba.npkPeers || 0) : Number(bb.npkPeers || 0));
      const bBawahan = hasA && hasB ? ((Number(ba.npkBawahan || 0) + Number(bb.npkBawahan || 0)) / 2) : (hasA ? Number(ba.npkBawahan || 0) : Number(bb.npkBawahan || 0));
      return {
        coreValue: name.toLowerCase(),
        name,
        indeksCapaian: Number(val.toFixed(2)),
        breakdown: {
          npkAtasan: Number(bAtasan.toFixed(2)),
          npkPeers: Number(bPeers.toFixed(2)),
          npkBawahan: Number(bBawahan.toFixed(2))
        }
      };
    };
    if (scale === 120) {
      // Scale 120: Display 8 Aspects Separately
      return [
        { ...get('berorientasi_pelayanan'), name: evaluationService.getCoreValueName('berorientasi_pelayanan', scale), coreValue: 'berorientasi_pelayanan' },
        { ...getWithCombinedFallback('akuntabel', ['akuntabel_loyal', 'akuntabel_&_loyal', 'Akuntabel & Loyal']), name: evaluationService.getCoreValueName('akuntabel', scale), coreValue: 'akuntabel' },
        { ...get('kompeten'), name: evaluationService.getCoreValueName('kompeten', scale), coreValue: 'kompeten' },
        { ...getWithCombinedFallback('harmonis', ['kolaboratif_harmonis', 'kolaboratif_&_harmonis', 'Kolaboratif & Harmonis']), name: evaluationService.getCoreValueName('harmonis', scale), coreValue: 'harmonis' },
        { ...getWithCombinedFallback('loyal', ['akuntabel_loyal', 'akuntabel_&_loyal', 'Akuntabel & Loyal']), name: evaluationService.getCoreValueName('loyal', scale), coreValue: 'loyal' },
        { ...get('adaptif'), name: evaluationService.getCoreValueName('adaptif', scale), coreValue: 'adaptif' },
        { ...getWithCombinedFallback('kolaboratif', ['kolaboratif_harmonis', 'kolaboratif_&_harmonis', 'Kolaboratif & Harmonis']), name: evaluationService.getCoreValueName('kolaboratif', scale), coreValue: 'kolaboratif' },
        { ...get('kepemimpinan'), name: evaluationService.getCoreValueName('kepemimpinan', scale), coreValue: 'kepemimpinan' }
      ];
    }

    // Scale 100: Standard BerAKHLAK (Combined)
    return [
      { ...get('berorientasi_pelayanan'), name: evaluationService.getCoreValueName('berorientasi_pelayanan', scale), coreValue: 'berorientasi_pelayanan' },
      { ...get('kompeten'), name: evaluationService.getCoreValueName('kompeten', scale), coreValue: 'kompeten' },
      combineAvg(
        getWithCombinedFallback('kolaboratif', ['kolaboratif_harmonis', 'kolaboratif_&_harmonis', 'Kolaboratif & Harmonis']),
        getWithCombinedFallback('harmonis', ['kolaboratif_harmonis', 'kolaboratif_&_harmonis', 'Kolaboratif & Harmonis']),
        evaluationService.getCoreValueName('kolaboratif_harmonis', scale)
      ),
      { ...get('adaptif'), name: evaluationService.getCoreValueName('adaptif', scale), coreValue: 'adaptif' },
      combineAvg(
        getWithCombinedFallback('akuntabel', ['akuntabel_loyal', 'akuntabel_&_loyal', 'Akuntabel & Loyal']),
        getWithCombinedFallback('loyal', ['akuntabel_loyal', 'akuntabel_&_loyal', 'Akuntabel & Loyal']),
        evaluationService.getCoreValueName('akuntabel_loyal', scale)
      ),
      { ...get('kepemimpinan'), name: evaluationService.getCoreValueName('kepemimpinan', scale), coreValue: 'kepemimpinan' }
    ];
  };

  // Helper: Get Completion Status
  const getCompletionStatus = (coreValueId) => {
    // This is purely UI helper, can stay local or move to service if needed
    // But for preview, we might just count keys in scores
    const indicators = coreValues?.find(cv => cv?.id === coreValueId)?.indicators || [];
    const completedCount = indicators?.filter(ind => scores?.[ind?.id] > 0)?.length;
    return {
      completed: completedCount,
      total: indicators?.length,
      percentage: (completedCount / indicators?.length) * 100
    };
  };

  return (
    <div className="card bg-primary/5">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon name="Calculator" size={24} color="var(--color-primary)" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Preview Perhitungan NPK
          </h3>
          <p className="text-sm caption text-muted-foreground">
            Kategori: {evaluatorCategory === 'supervisor' ? 'Atasan' : evaluatorCategory === 'peer' ? 'Rekan Sejawat' : 'Bawahan'}
          </p>
        </div>
      </div>

      {/* Hasil Akhir NPK Periodik */}
      <div className="bg-white rounded-lg p-4 border-2 border-primary mb-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm caption text-muted-foreground mb-1">
              NPK Periodik (Estimasi)
            </div>
            <div className="text-3xl font-bold data-text text-primary">
              {periodicNPK?.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold px-3 py-1 rounded-full bg-slate-100 ${rating?.color}`}>
              {rating?.rating}
            </div>
          </div>
        </div>
        <p className="text-xs caption text-muted-foreground mt-2 border-t pt-2 border-slate-100">
          {calculation?.condition ? `Kondisi: ${evaluationService.getConditionDescription(calculation.condition, evalueePosition === 'structural')}` : 'Estimasi berdasarkan penilaian saat ini.'}
        </p>
      </div>

      {/* Informasi Bobot */}
      <div className="mb-4 p-3 bg-muted/30 rounded-lg">
        <p className="text-sm font-medium text-foreground mb-2">Skenario Bobot: {evaluationService.getConditionDescription(calculation?.condition || 'complete', evalueePosition === 'structural')}</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium text-primary">{weights.supervisor}%</div>
            <div className="text-muted-foreground">Atasan</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-primary">{weights.peers}%</div>
            <div className="text-muted-foreground">Peers</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-primary">{weights.subordinates}%</div>
            <div className="text-muted-foreground">Bawahan</div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {(getGroupedAspectDetails())?.map((aspect, index) => {
          // Find original core value definition for completion status
          // Matching by name/key might be tricky, but aspectDetails has coreValue key
          const originalCV = coreValues?.find(cv => 
            cv.name.toLowerCase() === aspect.name.toLowerCase() || 
            (aspect.coreValue && cv.id === aspect.coreValue)
          );
          
          const completionStatus = getCompletionStatus(originalCV?.id);
          const predicate = evaluationService.calculateAspectRating(aspect.indeksCapaian, scale);

          // Aspect Color Helper
          const colors = [
            'border-l-4 border-blue-500 bg-blue-100',
            'border-l-4 border-green-500 bg-green-100',
            'border-l-4 border-purple-500 bg-purple-100',
            'border-l-4 border-orange-500 bg-orange-100',
            'border-l-4 border-teal-500 bg-teal-100',
            'border-l-4 border-indigo-500 bg-indigo-100',
            'border-l-4 border-pink-500 bg-pink-100',
          ];
          const colorClass = colors[index % colors.length];

          return (
            <div key={index} className={`rounded-lg p-4 mb-3 ${colorClass}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 capitalize">
                    {aspect.name}
                  </h4>
                  {originalCV && (
                    <p className="text-xs caption text-muted-foreground mt-1">
                      {completionStatus?.completed}/{completionStatus?.total} indikator dinilai
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold data-text text-slate-900">
                    {Number(aspect.indeksCapaian).toFixed(2)}
                  </div>
                  <div className={`text-xs font-bold ${predicate.color}`}>
                    {predicate.rating}
                  </div>
                </div>
              </div>
              
              {/* Evaluator Counts Display */}
              <div className="flex gap-2 mb-3 text-[10px] text-slate-500">
                <span className="bg-white px-2 py-0.5 rounded border">Atasan: {aspect.breakdown?.countAtasan || 0}</span>
                <span className="bg-white px-2 py-0.5 rounded border">Peers: {aspect.breakdown?.countPeers || 0}</span>
                <span className="bg-white px-2 py-0.5 rounded border">Bawahan: {aspect.breakdown?.countBawahan || 0}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/60 rounded p-2">
                  <div className="caption text-muted-foreground">Atasan</div>
                  <div className="font-medium data-text text-foreground mt-1">
                    {aspect.breakdown?.npkAtasan?.toFixed(2)} ({weights.supervisor}%)
                  </div>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <div className="caption text-muted-foreground">Peers</div>
                  <div className="font-medium data-text text-foreground mt-1">
                    {aspect.breakdown?.npkPeers?.toFixed(2)} ({weights.peers}%)
                  </div>
                </div>
                <div className="bg-muted/50 rounded p-2">
                  <div className="caption text-muted-foreground">Bawahan</div>
                  <div className="font-medium data-text text-foreground mt-1">
                    {aspect.breakdown?.npkBawahan?.toFixed(2)} ({weights.subordinates}%)
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NPKCalculationPreview;
