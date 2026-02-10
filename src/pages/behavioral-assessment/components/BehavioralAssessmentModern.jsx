import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { npkAPI } from '../../../lib/api';
import RoleBasedHeader from '../../../components/ui/RoleBasedHeader';
import Icon from '../../../components/AppIcon';
import evaluationService from '../../../services/evaluationService';

const BehavioralAssessmentModern = () => {
  const { user } = useAuth();
  const { id: evalueeId } = useParams();
  const navigate = useNavigate();
  const [evaluee, setEvaluee] = useState(null);
  const [aspects, setAspects] = useState([]);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeAspect, setActiveAspect] = useState(null);
  const [progress, setProgress] = useState(0);
  const [celebration, setCelebration] = useState(false);
  const [formLocked, setFormLocked] = useState(false);

  const [verificationStep1, setVerificationStep1] = useState(false);
  const [verificationStep2, setVerificationStep2] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [crossToolZeroScales, setCrossToolZeroScales] = useState([]);
  
  const [feedbackLearning, setFeedbackLearning] = useState('');
  const [feedbackObstacles, setFeedbackObstacles] = useState('');

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { initialScale } = location.state || {};
  
  // 🛑 FIX CRITICAL: Prioritaskan URL Parameter untuk mencegah "lompat tool" saat refresh
  // Jika URL punya ?scale=120, paksa gunakan 120. Jangan fallback ke default 100.
  const urlScale = searchParams.get('scale');
  const [assessmentScale, setAssessmentScale] = useState(urlScale ? parseInt(urlScale) : (initialScale || 100));

  // STRICT RESET: Pastikan tidak ada kebocoran skor/komentar antar evaluee
  // Reset segera ketika evalueeId berubah untuk mencegah prefill tidak diinginkan
  useEffect(() => {
    setScores({});
    setComments({});
    setProgress(0);
  }, [evalueeId]);

  // Update scale jika URL berubah (untuk navigasi langsung)
  useEffect(() => {
    const s = searchParams.get('scale');
    if (s) {
      setAssessmentScale(parseInt(s));
    }
  }, [searchParams]);

  // Gunakan data dari evaluationService untuk mendukung pemisahan aspek (pisah satu satu)
  const [aspectsData, setAspectsData] = useState([]);

  useEffect(() => {
    // Load aspects dynamically based on scale
    const mapping = evaluationService.getKeyBehaviorsForScale(assessmentScale);
    const formattedAspects = mapping.map(item => ({
      id: item.key,
      name: item.name,
      keyBehaviors: item.behaviors.map((desc, idx) => ({
        id: String(idx + 1),
        description: desc
      }))
    }));
    setAspectsData(formattedAspects);
  }, [assessmentScale]);

  // Effect untuk inisialisasi aspects saat aspectsData berubah
  useEffect(() => {
    if (aspectsData.length > 0) {
      setAspects(aspectsData);
      if (!activeAspect) {
        setActiveAspect(aspectsData[0].id);
      }
      setLoading(false);
      
      if (Object.keys(scores).length === 0) {
        const init = {};
        aspectsData.forEach(a => {
          (a.keyBehaviors || []).forEach(b => { init[`${a.id}_${b.id}`] = 0; });
        });
        setScores(init);
      }
      
      // ✅ MIGRATION: Auto-migrate combined scores to separated scores if needed
      // This handles the case where user previously input data using the "Combined" keys (due to previous bug)
      // but now we are using "Separated" keys for Scale 120.
      setScores(prevScores => {
        const newScores = { ...prevScores };
        let hasChanges = false;
        
        // Helper to migrate
        const migrate = (sourceKey, targetKey) => {
          if (newScores[sourceKey] !== undefined && newScores[targetKey] === undefined) {
            newScores[targetKey] = newScores[sourceKey];
            hasChanges = true;
          }
        };

        // Helper to merge separate keys into combined (Separated -> Combined)
        // e.g. akuntabel + loyal -> akuntabel_loyal
        const mergeToCombined = (key1, key2, combinedKey) => {
            const v1 = newScores[key1];
            const v2 = newScores[key2];
            // Only merge if target doesn't exist and at least one source exists
            if (newScores[combinedKey] === undefined && (v1 !== undefined || v2 !== undefined)) {
                const validValues = [v1, v2].filter(v => v !== undefined && v !== null).map(Number);
                if (validValues.length > 0) {
                    const avg = validValues.reduce((a, b) => a + b, 0) / validValues.length;
                    newScores[combinedKey] = avg;
                    hasChanges = true;
                }
            }
        };

        // Helper to split combined keys into separate (Combined -> Separated)
        // e.g. akuntabel_loyal -> akuntabel, loyal
        const splitToSeparate = (combinedKey, key1, key2) => {
             const val = newScores[combinedKey];
             if (val !== undefined) {
                 if (newScores[key1] === undefined) { newScores[key1] = val; hasChanges = true; }
                 if (newScores[key2] === undefined) { newScores[key2] = val; hasChanges = true; }
             }
        };

        // 1. Handle "Per-Behavior" migration (Legacy specific keys)
        // Migrate Akuntabel & Loyal (6 items -> 3 + 3)
        // AL_1..3 -> Akuntabel_1..3
        for (let i = 1; i <= 3; i++) migrate(`akuntabel_loyal_${i}`, `akuntabel_${i}`);
        for (let i = 1; i <= 3; i++) migrate(`akuntabel_loyal_${i+3}`, `loyal_${i}`);
        // Migrate Kolaboratif & Harmonis (5 items -> 3 + 3)
        for (let i = 1; i <= 2; i++) migrate(`kolaboratif_harmonis_${i}`, `kolaboratif_${i}`);
        for (let i = 1; i <= 3; i++) migrate(`kolaboratif_harmonis_${i+2}`, `harmonis_${i}`);

        // 2. Handle "Core Value Score" migration (For Resume/Pre-fill)
        // Separated -> Combined (Tool 1 Data -> Tool 2 View)
        mergeToCombined('akuntabel', 'loyal', 'akuntabel_loyal');
        mergeToCombined('kolaboratif', 'harmonis', 'kolaboratif_harmonis');

        // Combined -> Separated (Tool 2 Data -> Tool 1 View)
        splitToSeparate('akuntabel_loyal', 'akuntabel', 'loyal');
        splitToSeparate('kolaboratif_harmonis', 'kolaboratif', 'harmonis');
        
        // Also handle comments migration
        const newComments = { ...comments };
        let commentChanges = false;
        const migrateComment = (src, tgt) => {
            if (newComments[src] && !newComments[tgt]) {
                newComments[tgt] = newComments[src];
                commentChanges = true;
            }
        };
        
        // Migrate comments for core values
        migrateComment('akuntabel_loyal', 'akuntabel');
        migrateComment('akuntabel_loyal', 'loyal');
        migrateComment('kolaboratif_harmonis', 'kolaboratif');
        migrateComment('kolaboratif_harmonis', 'harmonis');

        if (commentChanges) setComments(newComments);

        return hasChanges ? newScores : prevScores;
      });
    }
  }, [aspectsData]);

  /* Hardcoded aspects removed to favor evaluationService source of truth */
  /*
  const aspectsData = [ ... ];
  */

  useEffect(() => {
    // ✅ RESET STATE IMMEDIATELY when evalueeId changes to prevent data leakage
    setScores({});
    setComments({});
    setLoading(true);
    setEvaluee(null);
    setCelebration(false);
    setProgress(0);
    setVerificationStep1(false);
    setVerificationStep2(false);
    
    if (evalueeId) {
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      const found = storedEmployees.find(e => String(e.id) === String(evalueeId));
      if (found) {
        setEvaluee(found);
      } else {
        console.error("Evaluee not found:", evalueeId);
        setLoading(false); // Stop loading if not found
      }
    }
  }, [evalueeId]);

  useEffect(() => {
    const loadExistingData = async () => {
      if (evaluee && user) {
        try {
          const targetNip = evaluee.nip || evaluee.id;
          const evaluatorId = user.id || user.employee_id;
          const currentScale = Number(assessmentScale);
          
          // 1. Coba load dari LocalStorage via Service
          const allEvaluations = evaluationService.getAllEvaluations();
          let existingEval = allEvaluations.find(ev => 
            (String(ev.evaluee_nip) === String(targetNip) || String(ev.evaluee_id) === String(evaluee.id)) &&
            String(ev.evaluator_id) === String(evaluatorId) &&
            Number(ev.scale) === currentScale
          );
          
          // STRICT CHECK: Ensure evaluator_id is valid and matches current user
          if (existingEval) {
             if (!existingEval.evaluator_id || existingEval.evaluator_id === 'undefined' || String(existingEval.evaluator_id) !== String(evaluatorId)) {
                console.warn("⚠️ Found assessment with invalid/mismatched evaluator_id. Ignoring.", existingEval);
                existingEval = null;
             }
             // STRICT CHECK: Ensure evaluee matches (prevent undefined/null matching)
             else if (!targetNip || targetNip === 'undefined' || targetNip === 'null') {
                 // If target identifiers are invalid, we can't trust the match
                 console.warn("⚠️ Target NIP/ID invalid. Ignoring match.");
                 existingEval = null;
             }
             else {
                 // Double check evaluee match
                 const matchNip = String(existingEval.evaluee_nip) === String(targetNip);
                 const matchId = String(existingEval.evaluee_id) === String(evaluee.id);
                 
                 // If neither matches (and we are not dealing with loose legacy data), ignore
                 if (!matchNip && !matchId) {
                     console.warn("⚠️ Mismatched evaluee in found assessment. Ignoring.", existingEval);
                     existingEval = null;
                 }
             }
          }

          // 2. Jika tidak ada di LocalStorage, coba load dari API (Backend Source of Truth)
          if (!existingEval) {
            console.log('🌐 Fetching existing assessment from API...');
            try {
              // Gunakan getEvaluatorHistory karena getEvaluatorAssessments tidak ada di API client
              const apiResponse = await npkAPI.getEvaluatorHistory(evaluatorId);
              
              // Response dari getEvaluatorHistory biasanya array of assessments (atau object dengan key data)
              const assessmentsList = Array.isArray(apiResponse) ? apiResponse : (apiResponse?.data || []);

              if (assessmentsList.length > 0) {
                 // Cari yang cocok EXACT match (Scale & Evaluee)
                 let remoteEval = assessmentsList.find(ev => 
                    (String(ev.evaluee_nip) === String(targetNip) || String(ev.evaluee_id) === String(evaluee.id)) &&
                    String(ev.evaluator_id) === String(evaluatorId) && // Ensure backend returned correct owner
                    Number(ev.scale) === currentScale
                 );
                 
                 // ✅ FALLBACK: Jika tidak ada exact match scale, cari ANY match untuk evaluee ini
                 // Ini menangani kasus user sudah menilai (misal di Tool 1/Legacy) tapi ingin buka di Tool 2.
                 // Kita load datanya dan biarkan logic migrasi di useEffect menangani konversi skor.
                 if (!remoteEval) {
                    const anyEval = assessmentsList.find(ev => 
                        (String(ev.evaluee_nip) === String(targetNip) || String(ev.evaluee_id) === String(evaluee.id)) &&
                        String(ev.evaluator_id) === String(evaluatorId)
                    );
                    if (anyEval) {
                        console.log(`⚠️ No exact scale match (${currentScale}). Loading data from Scale ${anyEval.scale} to adapt.`);
                        remoteEval = anyEval;
                    }
                 }

                 if (remoteEval) {
                   console.log('✅ Found assessment in Backend:', remoteEval);
                   // Transform remote data to match local structure if needed
                   // Backend raw_scores might be stored in 'raw_scores' field (JSON)
                   existingEval = {
                     ...remoteEval,
                     scores: remoteEval.raw_scores || remoteEval.scores, // Prefer raw scores for editing
                     comments: remoteEval.comments
                   };
                 }
              }
            } catch (apiErr) {
              console.warn('⚠️ Failed to fetch from API:', apiErr);
            }
          }

          if (existingEval) {
            console.log("🔒 Existing submission found. Locking form for view-only.", existingEval);
            setFormLocked(true);
            setScores({});
            setComments({});
          } else {
            console.log("ℹ️ No existing assessment found. Starting fresh (default 0s).");
            setFormLocked(false);
            setScores({});
            setComments({});
          }
        } catch (err) {
          console.error("Error loading existing assessment:", err);
        }
      }
    };

    loadExistingData();
  }, [evaluee, user, assessmentScale]);

  useEffect(() => {
    const checkCrossToolZeros = async () => {
      if (!evaluee || !user) return;
      try {
        const evaluatorId = user.id || user.employee_id;
        const resp = await npkAPI.getEvaluatorHistory(evaluatorId);
        const list = Array.isArray(resp) ? resp : (resp?.data || []);
        const targetId = evaluee.id;
        const targetNip = evaluee.nip;
        const scalesWithZero = [];
        list.forEach(item => {
          const match = String(item.evaluee_id) === String(targetId) || String(item.evaluee_nip) === String(targetNip);
          const differentScale = Number(item.scale) !== Number(assessmentScale);
          if (match && differentScale) {
            const raw = item.raw_scores;
            let granular = raw && (raw.scores || raw);
            let hasZero = false;
            if (granular && typeof granular === 'object') {
              for (const v of Object.values(granular)) {
                const num = typeof v === 'number' ? v : parseFloat(v);
                if (!isNaN(num) && Number(num) === 0) { hasZero = true; break; }
              }
            }
            if (hasZero) {
              scalesWithZero.push(Number(item.scale));
            }
          }
        });
        setCrossToolZeroScales(scalesWithZero);
      } catch (e) {
        setCrossToolZeroScales([]);
      }
    };
    checkCrossToolZeros();
  }, [evaluee, user, assessmentScale]);

  // TAMBAHAN: Auto-save ke localStorage (Draft)
  useEffect(() => {
    if (evaluee && user) {
      const targetNip = evaluee.nip || evaluee.id;
      const evaluatorId = user.id || user.employee_id;
      const draftKey = `draft_assessment_${targetNip}_${evaluatorId}_${assessmentScale}`;
      
      const draftData = {
        scores,
        comments,
        feedbackLearning,
        feedbackObstacles,
        verificationStep1,
        verificationStep2,
        activeAspect,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      
      // Also update the main evaluations array in localStorage to persist across sessions
      // This ensures 'Resume' functionality works even if we don't rely on separate draft keys
      const allEvaluations = JSON.parse(localStorage.getItem(evaluationService.storageKey) || '[]');
      const evalIndex = allEvaluations.findIndex(ev => 
        (String(ev.evaluee_nip) === String(targetNip) || String(ev.evaluee_id) === String(evaluee.id)) &&
        String(ev.evaluator_id) === String(evaluatorId) &&
        Number(ev.scale) === Number(assessmentScale)
      );

      if (evalIndex !== -1) {
        allEvaluations[evalIndex] = {
          ...allEvaluations[evalIndex],
          scores: scores,
          comments: comments,
          // Don't change status to Selesai yet, just update content
          updated_at: new Date().toISOString()
        };
        localStorage.setItem(evaluationService.storageKey, JSON.stringify(allEvaluations));
      }
    }
  }, [scores, comments, feedbackLearning, feedbackObstacles, verificationStep1, verificationStep2, evaluee, user, assessmentScale]);

  // Load draft on mount if exists and no existing completed evaluation
  useEffect(() => {
    if (evaluee && user) {
      const targetNip = evaluee.nip || evaluee.id;
      
      // Safety check: Don't load draft for undefined identifier
      if (!targetNip || targetNip === 'undefined') return;

      const evaluatorId = user.id || user.employee_id;
      const draftKey = `draft_assessment_${targetNip}_${evaluatorId}_${assessmentScale}`;
      
      const draftJson = localStorage.getItem(draftKey);
      if (draftJson) {
        try {
          const draft = JSON.parse(draftJson);
          if (!formLocked && draft.scores) {
            setScores(draft.scores);
            if (draft.comments) setComments(draft.comments);
            if (typeof draft.feedbackLearning === 'string') setFeedbackLearning(draft.feedbackLearning);
            if (typeof draft.feedbackObstacles === 'string') setFeedbackObstacles(draft.feedbackObstacles);
            if (typeof draft.verificationStep1 === 'boolean') setVerificationStep1(draft.verificationStep1);
            if (typeof draft.verificationStep2 === 'boolean') setVerificationStep2(draft.verificationStep2);
            if (typeof draft.activeAspect === 'string') setActiveAspect(draft.activeAspect);
          }
        } catch (e) {
          console.error("Error loading draft", e);
        }
      }
    }
  }, [evaluee, user, assessmentScale]); // Run when identity is established

  useEffect(() => {
    calculateProgress();
  }, [scores, aspects]);

  useEffect(() => {
    if (progress === 100 && !celebration) {
      setCelebration(true);
      setTimeout(() => setCelebration(false), 3000);
    }
  }, [progress, celebration]);

  // ✅ CALCULATE MISSING ASPECTS FOR WARNING
  const incompleteAspects = aspects.filter(aspect => {
    if (!aspect.keyBehaviors) return false;
    return aspect.keyBehaviors.some(behavior => {
      const scoreKey = `${aspect.id}_${behavior.id}`;
      return !scores[scoreKey] || scores[scoreKey] === 0;
    });
  });

  const isCurrentAspectComplete = !incompleteAspects.some(a => a.id === activeAspect);

  // WARNING: Prevent accidental exit if assessment is incomplete
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (progress > 0 && progress < 100) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [progress]);

  // Removed loadAspects since we use useEffect
  /* 
  const loadAspects = async () => {
    // Simulate loading - in future, this could come from API
    setTimeout(() => {
      setAspects(aspectsData);
      if (aspectsData.length > 0) {
        setActiveAspect(aspectsData[0].id);
      }
      setLoading(false);
    }, 500);
  };
  */

  const calculateProgress = () => {
    if (aspects.length === 0) return;

    let totalBehaviors = 0;
    let completedBehaviors = 0;

    aspects.forEach(aspect => {
      if (aspect.keyBehaviors) {
        aspect.keyBehaviors.forEach(behavior => {
          totalBehaviors++;
          const scoreKey = `${aspect.id}_${behavior.id}`;
          if (scores[scoreKey] && scores[scoreKey] > 0) {
            completedBehaviors++;
          }
        });
      }
    });

    const progressPercent = totalBehaviors > 0 ? Math.round((completedBehaviors / totalBehaviors) * 100) : 0;
    setProgress(progressPercent);
  };

  const handleScoreChange = (aspectId, behaviorId, value) => {
    // Validasi input 0-assessmentScale
    const score = Math.max(0, Math.min(assessmentScale, parseFloat(value) || 0));
    const key = `${aspectId}_${behaviorId}`;
    setScores(prev => ({
      ...prev,
      [key]: score
    }));
  };

  // TAMBAHAN: Fungsi handleCommentChange yang hilang
  const handleCommentChange = (aspectId, behaviorId, comment) => {
    const key = `${aspectId}_${behaviorId}`;
    setComments(prev => ({
      ...prev,
      [key]: comment
    }));
  };

  const submitAssessment = async () => {
    if (formLocked) { alert('Penilaian sudah terkirim. Form dikunci. Silakan lihat Histori Evaluator.'); return; }
    // 1. Check Score Completeness
    if (progress < 100) {
      // Find missing aspects
      const missingAspects = aspects.filter(aspect => {
        if (!aspect.keyBehaviors) return false;
        return aspect.keyBehaviors.some(behavior => {
          const scoreKey = `${aspect.id}_${behavior.id}`;
          return !scores[scoreKey] || scores[scoreKey] === 0;
        });
      }).map(a => a.name);

      const evalueeName = evaluee?.name || evaluee?.nama || 'Pegawai ini';
      alert(`⚠️ Penilaian untuk ${evalueeName} belum lengkap!\n\nAnda wajib menilai seluruh aspek dan perilaku kunci (7 perilaku per aspek).\n\nMohon lengkapi penilaian untuk aspek berikut:\n- ${missingAspects.join('\n- ')}\n\nPastikan semua indikator telah dinilai sebelum mengirim.`);
      return;
    }

    // 2. Check Comment Completeness (MANDATORY PER USER REQUEST)
    const missingComments = [];
    aspects.forEach(aspect => {
      if (aspect.keyBehaviors) {
        aspect.keyBehaviors.forEach(behavior => {
           const scoreKey = `${aspect.id}_${behavior.id}`;
           const score = scores[scoreKey];
           const comment = comments[scoreKey];
           
           // If score exists, check comment
           if (score > 0 && (!comment || comment.trim() === '')) {
              missingComments.push(`${aspect.name} (Item ${behavior.id})`);
           }
        });
      }
    });

    if (missingComments.length > 0) {
       alert(`⚠️ Komentar Wajib Diisi!\n\nAnda wajib memberikan komentar/catatan untuk SETIAP perilaku yang dinilai.\n\nBerikut beberapa item yang belum dikomentari:\n- ${missingComments.slice(0, 5).join('\n- ')}\n${missingComments.length > 5 ? `...dan ${missingComments.length - 5} lainnya.` : ''}`);
       return;
    }
    
    // TAMPILKAN MODAL VERIFIKASI
    setShowVerificationModal(true);
  };

  const getJobLevel = (pos) => {
    const p = (pos || '').toLowerCase();
    if (p.includes('direktur') || p.includes('kepala pusat') || p.includes('kepala badan') || p.includes('sekretaris')) return 4;
    if (p.includes('kepala') || p.includes('manajer') || (p.includes('supervisi') && !p.includes('tanpa supervisi')) || p.includes('ketua') || p.includes('koordinator')) return 3;
    if (p.includes('fungsional') || p.includes('ahli') || p.includes('penyelia') || p.includes('senior') || p.includes('muda') || p.includes('madya') || p.includes('utama')) return 2;
    return 1;
  };

  const getRelationshipRole = (evaluator, evalueeTarget) => {
    if (!evaluator || !evalueeTarget) return 'peer';
    
    const evalPos = (evaluator.jabatan || evaluator.position || '').toLowerCase();
    const evalueePos = (evalueeTarget.jabatan || evalueeTarget.position || '').toLowerCase();
    
    const isEvalSupervised = evalPos.includes('supervisi') && !evalPos.includes('tanpa supervisi');
    const isEvalueeSupervised = evalueePos.includes('supervisi') && !evalueePos.includes('tanpa supervisi');
    
    if (isEvalSupervised && !isEvalueeSupervised) return 'supervisor';
    if (!isEvalSupervised && isEvalueeSupervised) return 'subordinate';
    
    const myLevel = getJobLevel(evalPos);
    const targetLevel = getJobLevel(evalueePos);
    if (myLevel > targetLevel) return 'supervisor';
    if (myLevel < targetLevel) return 'subordinate';
    return 'peer';
  };

  const isEvalueeSupervisory = (target) => {
      if (!target) return false;
      const pos = (target.jabatan || target.position || '').toLowerCase();
      // Logic: Jika jabatan mengandung 'supervisi' tapi BUKAN 'tanpa supervisi'
      // ATAU jabatan-jabatan struktural lainnya (kepala, manajer, direktur)
      
      // Jika eksplisit 'tanpa supervisi' -> false
      if (pos.includes('tanpa supervisi')) return false;
      
      // Jika eksplisit 'supervisi' (dan tidak kena filter atas) -> true
      if (pos.includes('supervisi')) return true;
      
      // Jabatan struktural umum -> true
      return pos.includes('kepala') || 
             pos.includes('manajer') || 
             pos.includes('direktur') ||
             pos.includes('ketua') ||
             pos.includes('koordinator');
  };

  const handleFinalSubmit = async () => {
    if (!verificationStep1 || !verificationStep2) {
      alert('❌ Harap lengkapi verifikasi sebelum mengirim penilaian.');
      return;
    }

    if (feedbackLearning.length < 100) {
      alert('❌ "Pembelajaran yang diperoleh" minimal 100 karakter.');
      return;
    }

    if (feedbackObstacles.length < 100) {
      alert('❌ "Kendala yang dialami" minimal 100 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      // ✅ PREPARE DATA FOR V2 API (Core Value Based)
      // The backend now expects aggregated scores per Core Value, not individual behaviors
      const coreValueScores = {};
      const coreValueComments = {};
      const isSupervisory = isEvalueeSupervisory(evaluee);

      aspects.forEach((aspect) => {
        const behaviors = aspect.keyBehaviors || [];
        const vals = behaviors
          .map((b) => scores[`${aspect.id}_${b.id}`])
          .filter((v) => typeof v === 'number' && v > 0);
        
        // Calculate average score for the Core Value
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        
        // Use fixed precision matching backend (e.g. 1 decimal)
        coreValueScores[aspect.id] = parseFloat(avg.toFixed(1));
        
        // Collect comments from behaviors and join them
        const aspectComments = behaviors
          .map(b => comments[`${aspect.id}_${b.id}`])
          .filter(c => c && c.trim() !== '')
          .join('; ');
        
        // Use empty string if no comments (avoid null/undefined issues)
        coreValueComments[aspect.id] = aspectComments || '';
      });

      // ✅ FIX: Split combined scores for compatibility with detailed calculation (Tool 1 / Scale 120)
      // This ensures that when calculateNPKDetails looks for 'akuntabel' or 'loyal', it finds the value.
      // Support multiple key formats for robustness
      const findScore = (keys) => {
        for (const k of keys) {
          if (coreValueScores[k] !== undefined) return coreValueScores[k];
        }
        return undefined;
      };

      const alScore = findScore(['akuntabel_loyal', 'akuntabel_&_loyal', 'Akuntabel & Loyal']);
      if (alScore !== undefined) {
        if (coreValueScores['akuntabel'] === undefined) coreValueScores['akuntabel'] = alScore;
        if (coreValueScores['loyal'] === undefined) coreValueScores['loyal'] = alScore;
      }

      const khScore = findScore(['kolaboratif_harmonis', 'kolaboratif_&_harmonis', 'Kolaboratif & Harmonis']);
      if (khScore !== undefined) {
        if (coreValueScores['kolaboratif'] === undefined) coreValueScores['kolaboratif'] = khScore;
        if (coreValueScores['harmonis'] === undefined) coreValueScores['harmonis'] = khScore;
      }

      // ✅ FIX: Define scores100 alias for backward compatibility and usage below
      const scores100 = coreValueScores;

      const relationshipRole = getRelationshipRole(user, evaluee);

      // ✅ ROBUST ID SYNC: Resolve Canonical Evaluator ID
      // Ensures compatibility with Admin Dashboard which syncs IDs by NIP
      let effectiveEvaluatorId = user.id || user.employee_id;
      try {
        const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
        const cleanNip = (n) => String(n || '').replace(/\s+/g, '').trim();
        if (user.nip) {
          const myNip = cleanNip(user.nip);
          const canonicalEmployee = storedEmployees.find(e => cleanNip(e.nip) === myNip);
          if (canonicalEmployee && canonicalEmployee.id) {
            console.log(`🔄 Syncing ID for submission: ${effectiveEvaluatorId} -> ${canonicalEmployee.id}`);
            effectiveEvaluatorId = canonicalEmployee.id;
          }
        }
      } catch (err) {
        console.warn('⚠️ ID Sync warning:', err);
      }

      // ✅ CALCULATE NPK DETAILS (Sinkronisasi Tampilan & Pembobotan)
      // Gunakan evaluationService untuk menghitung detail NPK berdasarkan data saat ini
      // Ini memastikan data yang dikirim ke backend sudah matang (processed)
      
      // 1. Construct temporary evaluator object for calculation
      const tempEvaluator = {
        id: effectiveEvaluatorId,
        role: relationshipRole,
        category: relationshipRole,
        scores: scores100
      };

      // 2. Fetch existing evaluations (optional, if we want to include others)
      // For now, we assume we are submitting *our* part. 
      // Ideally, the backend should re-aggregate. But if we want instant feedback on *this* view:
      const assessmentData = {
        evaluators: [tempEvaluator],
        scores: scores100,
        is_supervisory: isSupervisory
      };

      const npkDetails = evaluationService.calculateNPKDetails(assessmentData, assessmentScale);
      
      console.log('📊 Calculated NPK Details:', npkDetails);

      console.log('🚀 Submitting Assessment V2 (Aggregated):', {
        scores: coreValueScores,
        comments: coreValueComments,
        is_supervisory: isSupervisory,
        evaluator_id: effectiveEvaluatorId,
        feedback_learning: feedbackLearning,
        feedback_obstacles: feedbackObstacles,
        npk_details: npkDetails
      });

      // ✅ SUBMIT TO BACKEND V2 (Writes to core_value_assessments & npk_calculations)
      // This ensures data appears in Admin Dashboard immediately
      const submitResp = await npkAPI.submitBehavioralAssessmentV2({
        evaluation_period_id: 1, // Default period
        evaluator_id: effectiveEvaluatorId,
        evaluee_id: evaluee?.id || evalueeId,
        is_supervisory: isSupervisory,
        scores: coreValueScores,
        comments: coreValueComments,
        feedback_learning: feedbackLearning,
        feedback_obstacles: feedbackObstacles,
        scale: assessmentScale, // ✅ SEND SCALE TO BACKEND (Crucial for Tool 1 vs Tool 2)
        // ✅ NEW: Send calculated details for sync
        aspect_details: npkDetails?.aspectDetails,
        weighting_condition: npkDetails?.condition,
        weights: npkDetails?.weights, // ✅ SEND WEIGHTS TO BACKEND
        npk_score: npkDetails?.npkPeriodik,
        raw_scores: scores // ✅ SEND RAW SCORES for perfect resume
      });
      if (submitResp && submitResp.status === 409) {
        alert('Penilaian sudah terkirim sebelumnya. Form akan dikunci.');
        setFormLocked(true);
      }

      // ✅ LOCAL SYNC (Keep for fallback/UI consistency)
      // scores100 is already defined above

      evaluationService.saveBehavioralAssessment({
        evaluee_id: evaluee?.id || evalueeId,
        evaluee_name: evaluee?.name || evaluee?.nama || 'Unknown',
        evaluee_nip: evaluee?.nip || 'N/A',
        evaluee_position: evaluee?.jabatan || evaluee?.position || 'Tidak Diketahui',
        evaluator_id: effectiveEvaluatorId,
        evaluator_name: user?.name || user?.nama || 'Evaluator',
        evaluation_period: 'Periode 1',
        is_supervisory: isSupervisory,
        scores: scores100,
        raw_scores: scores, // ✅ Kirim skor mentah untuk disimpan di local/draft
        comments: comments,
        evaluators: [{ 
            id: effectiveEvaluatorId, 
            name: user?.name || user?.nama || 'Evaluator', 
            role: relationshipRole, 
            category: relationshipRole,
            scores: scores100 
        }],
        scale: assessmentScale 
      });

      alert('✅ Penilaian berhasil dikirim!');
      setCelebration(true);
      setFormLocked(true);
      
      try {
        const targetNip = evaluee?.nip || evalueeId;
        const evaluatorId = user?.id || user?.employee_id;
        const draftKey = `draft_assessment_${targetNip}_${evaluatorId}_${assessmentScale}`;
        localStorage.removeItem(draftKey);
      } catch (e) {}
      
      // Delay redirect to allow celebration
      setTimeout(() => {
        navigate('/evaluator-dashboard');
      }, 2000);

    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert('❌ Gagal mengirim penilaian. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
      setShowVerificationModal(false);
      setVerificationStep1(false);
      setVerificationStep2(false);
    }
  };

  const getScoreColor = (score) => {
    if (score === 0) return 'from-gray-100 to-gray-50';
    if (score >= 90) return 'from-emerald-400 to-green-500';
    if (score >= 70) return 'from-amber-400 to-yellow-500';
    if (score >= 50) return 'from-orange-400 to-red-400';
    return 'from-red-400 to-red-600';
  };

  const getScoreLabel = (score) => {
    if (score === 0) return 'Belum Dinilai';
    if (score >= 100) return 'SANGAT BAIK';
    if (score >= 80) return 'BAIK';
    if (score >= 60) return 'CUKUP';
    return 'PERLU DIPERBAIKI';
  };

  const getScoreDescription = (score) => {
    if (score === 0) return '';
    if (score >= 100) return 'Melampaui ekspektasi';
    if (score >= 80) return 'Memenuhi ekspektasi';
    if (score >= 60) return 'Memenuhi standar minimum';
    return 'Di bawah ekspektasi';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <RoleBasedHeader hideUserLabel={true} />
        <div className="pt-20 flex items-center justify-center min-h-[60vh] relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
          
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Memuat Data Penilaian</h2>
            <p className="text-white/70">Mohon tunggu sebentar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <RoleBasedHeader hideUserLabel={true} />
      
      {/* Evaluee Info Header */}
      <div className="pt-24 px-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-4 drop-shadow-md">Penilaian Perilaku Kerja</h1>
        <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl px-8 py-6 border border-white/20 shadow-xl max-w-3xl mx-auto transform hover:scale-105 transition-transform duration-300">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg border-2 border-white/30">
              {(evaluee?.name || evaluee?.nama || '?').charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {evaluee?.name || evaluee?.nama || 'Memuat Data Pegawai...'}
            </h2>
            <div className="flex items-center space-x-2 text-white/90 text-sm font-medium bg-black/20 px-4 py-1 rounded-full">
              <span>{evaluee?.nip || 'NIP Tidak Tersedia'}</span>
              <span>•</span>
              <span>{evaluee?.jabatan || evaluee?.position || 'Jabatan Tidak Tersedia'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Indicator */}
      <div className="pt-8 pb-2 text-center">
        <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-white shadow-lg backdrop-blur-sm border ${
          assessmentScale === 120 
            ? 'bg-purple-600/90 border-purple-400 shadow-purple-900/50' 
            : 'bg-blue-600/90 border-blue-400 shadow-blue-900/50'
        }`}>
          <Icon name={assessmentScale === 120 ? 'Star' : 'Award'} size={20} />
          {assessmentScale === 120 ? 'TOOL 1 (Skala 0-120)' : 'TOOL 2 (Skala 0-100)'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="pt-4 px-6">
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Progress Penilaian</h2>
              <span className="text-4xl font-bold text-white">{progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-4 mb-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-white/80 text-sm">Lengkapi semua indicator untuk melanjutkan</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Aspects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {aspects.map((aspect, index) => {
              const isActive = activeAspect === aspect.id;
              const aspectProgress = aspect.keyBehaviors ? aspect.keyBehaviors.filter(behavior => {
                const scoreKey = `${aspect.id}_${behavior.id}`;
                return scores[scoreKey] && scores[scoreKey] > 0;
              }).length / (aspect.keyBehaviors.length || 1) * 100 : 0;

              return (
                <button
                  key={aspect.id}
                  onClick={() => setActiveAspect(aspect.id)}
                  className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-2xl shadow-blue-500/25'
                      : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center font-bold text-2xl transition-all duration-300 ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <h3 className={`font-bold text-sm leading-tight ${
                      isActive ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {aspect.name}
                    </h3>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isActive ? 'bg-blue-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${aspectProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs mt-2 text-gray-500">
                      {Math.round(aspectProgress)}% selesai
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Assessment Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 overflow-hidden">
            <div className="p-8">
              {formLocked && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <p className="text-red-800 font-bold">Form Dikunci</p>
                  <p className="text-red-700 text-sm">Anda sudah mengirim penilaian untuk pegawai ini. Penilaian sebelumnya hanya dapat dilihat di Histori Evaluator dan Pembobotan Admin.</p>
                </div>
              )}
              {!formLocked && crossToolZeroScales.length > 0 && (
                <div className="mb-6 bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                  <p className="text-purple-800 font-bold">Peringatan Nilai 0 di Tool Lain</p>
                  <p className="text-purple-700 text-sm">Teridentifikasi indikator bernilai 0 pada skala {crossToolZeroScales.join(', ')}. Pastikan semua indikator terisi lengkap di kedua skala.</p>
                </div>
              )}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-white">
                  {aspects.find(aspect => aspect.id === activeAspect)?.name}
                </h3>
                <div className="text-right">
                  <p className="text-white/80 text-sm">Skala Penilaian</p>
                  <p className="text-white font-bold text-lg">0 - {assessmentScale}</p>
                </div>
              </div>

              {/* ⚠️ LOCAL WARNING: ASPEK INI BELUM LENGKAP */}
              {!isCurrentAspectComplete && (
                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg animate-pulse">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon name="AlertTriangle" size={24} className="text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 font-bold">
                        Aspek ini belum lengkap!
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Mohon isi nilai untuk semua perilaku kunci di bawah ini sebelum melanjutkan.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {aspects.find(aspect => aspect.id === activeAspect)?.keyBehaviors?.map((behavior, index) => {
                  const scoreKey = `${activeAspect}_${behavior.id}`;
                  const currentScore = scores[scoreKey] || 0;

                  return (
                    <div key={behavior.id} className="group relative bg-gradient-to-r from-gray-50 to-white border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl hover:border-purple-200/50 transition-all duration-300 hover:-translate-y-1">
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                              currentScore > 0
                                ? `bg-gradient-to-br ${getScoreColor(currentScore)} text-white shadow-lg`
                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 font-medium text-lg mb-1">{behavior.description}</p>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-semibold px-2 py-0.5 rounded-md ${
                                  currentScore > 0 
                                    ? `bg-gradient-to-r ${getScoreColor(currentScore)} bg-opacity-10 text-transparent bg-clip-text` 
                                    : 'text-gray-400'
                                }`}>
                                  {getScoreLabel(currentScore)}
                                </span>
                                {currentScore > 0 && (
                                  <span className="text-xs text-gray-500">
                                    • {getScoreDescription(currentScore)}
                                  </span>
                                )}
                              </div>

                              {/* Comment Input */}
                              <div className="mt-4">
                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                  Komentar / Catatan <span className="text-red-500">*</span>:
                                </label>
                                <textarea
                                  value={comments[scoreKey] || ''}
                                  onChange={(e) => handleCommentChange(activeAspect, behavior.id, e.target.value)}
                                  disabled={formLocked}
                                  readOnly={formLocked}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/50"
                                  rows="2"
                                  placeholder="Tambahkan catatan..."
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2 ml-4">
                            <label className="text-xs font-bold text-gray-500">
                              Nilai (0-{assessmentScale}) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={assessmentScale}
                              disabled={formLocked}
                              value={currentScore}
                              onChange={(e) => handleScoreChange(activeAspect, behavior.id, e.target.value)}
                              onWheel={(e) => e.target.blur()}
                              onKeyDown={(e) => {
                                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                  e.preventDefault();
                                }
                              }}
                              className={`w-24 px-3 py-2 border-2 rounded-lg font-bold text-center text-lg transition-all duration-300 ${
                                currentScore > 0
                                  ? `border-transparent bg-gradient-to-r ${getScoreColor(currentScore)} text-white`
                                  : 'border-gray-300 bg-white text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                              }`}
                              placeholder="0"
                            />
                            <span className="text-xs text-gray-400">max: {assessmentScale}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ⚠️ GLOBAL WARNING: DAFTAR ASPEK BELUM LENGKAP */}
              {incompleteAspects.length > 0 && (
                <div className="mt-12 mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <Icon name="AlertTriangle" size={24} className="text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-yellow-800 mb-2">
                        Penilaian Belum Lengkap ({incompleteAspects.length} Aspek Tersisa)
                      </h4>
                      <p className="text-sm text-yellow-700 mb-4">
                        Anda wajib mengisi nilai untuk semua aspek berikut sebelum dapat mengirim penilaian:
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {incompleteAspects.map(aspect => (
                          <li key={aspect.id} className="flex items-center text-sm text-yellow-800 bg-yellow-100 px-3 py-2 rounded-lg">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            {aspect.name}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 text-xs text-yellow-600 font-medium">
                        * Pastikan tidak ada nilai 0 (Belum Dinilai)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={submitAssessment}
                  disabled={progress < 100 || submitting || formLocked}
                  className={`px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform ${
                    progress === 100 && !submitting && !formLocked
                      ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:scale-105 hover:shadow-2xl shadow-green-500/50 cursor-pointer'
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  {submitting ? (
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Mengirim...</span>
                    </div>
                  ) : (
                    `Kirim Penilaian (${progress}%)`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CELEBRATION EFFECT */}
      {celebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center animate-bounce">
            <div className="text-8xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-white mb-2">Penilaian Berhasil!</h2>
            <p className="text-white/80">Terima kasih atas penilaian yang objektif</p>
          </div>
        </div>
      )}

      {/* VERIFICATION MODAL */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Verifikasi Penilaian
            </h3>
            
            <div className="space-y-6">
              {/* Feedback Inputs */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Pembelajaran yang diperoleh <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={feedbackLearning}
                  onChange={(e) => setFeedbackLearning(e.target.value)}
                  disabled={formLocked}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px] text-sm"
                  placeholder="Tulis ilmu/pembelajaran yang diperoleh (minimal 100 karakter)..."
                />
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${feedbackLearning.length < 100 ? 'text-red-500' : 'text-green-600'}`}>
                    {feedbackLearning.length}/100 karakter
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Kendala yang dialami <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={feedbackObstacles}
                  onChange={(e) => setFeedbackObstacles(e.target.value)}
                  disabled={formLocked}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px] text-sm"
                  placeholder="Tulis kendala/hambatan yang dialami (minimal 100 karakter)..."
                />
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${feedbackObstacles.length < 100 ? 'text-red-500' : 'text-green-600'}`}>
                    {feedbackObstacles.length}/100 karakter
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2 border-t border-gray-200">
                <input
                  type="checkbox"
                  id="verification1"
                  checked={verificationStep1}
                  onChange={(e) => setVerificationStep1(e.target.checked)}
                  disabled={formLocked}
                  className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="verification1" className="text-gray-700 font-medium">
                  Saya telah melakukan penilaian secara profesional dan objektif
                </label>
              </div>
              
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="verification2"
                  checked={verificationStep2}
                  onChange={(e) => setVerificationStep2(e.target.checked)}
                  disabled={formLocked}
                  className="mt-1 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="verification2" className="text-gray-700 font-medium">
                  Saya memastikan semua data penilaian akurat dan sesuai fakta
                </label>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={!verificationStep1 || !verificationStep2 || submitting || feedbackLearning.length < 100 || feedbackObstacles.length < 100}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                  verificationStep1 && verificationStep2 && feedbackLearning.length >= 100 && feedbackObstacles.length >= 100 && !submitting
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Mengirim...' : (feedbackLearning.length < 100 || feedbackObstacles.length < 100 ? 'Lengkapi Feedback (Min 100)' : 'Kirim Penilaian')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehavioralAssessmentModern;
