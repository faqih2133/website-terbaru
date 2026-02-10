import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import CoreValueSection from './components/CoreValueSection';
import VerificationModal from './components/VerificationModal';
import SuccessNotificationModal from './components/SuccessNotificationModal';
import evaluationService from '../../services/evaluationService';
import { usersAPI, npkAPI } from '../../lib/api';

const BehavioralAssessment = () => {
  const { employeeId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [assessmentScale, setAssessmentScale] = useState(100);
  const [scores100, setScores100] = useState({});
  const [comments100, setComments100] = useState({});
  const [scores120, setScores120] = useState({});
  const [comments120, setComments120] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successNotificationData, setSuccessNotificationData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [isSupervisory, setIsSupervisory] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // State untuk data evaluee dan evaluator
  const [evalueeData, setEvalueeData] = useState(null);
  const [evaluatorData, setEvaluatorData] = useState(null);

  // ✅ Helper functions for role detection
  const getJobLevel = (pos) => {
    const p = (pos || '').toLowerCase();
    // Level 5: Administrator (Super User) - Always Supervisor
    if (p === 'admin' || p === 'administrator') return 5;
    
    // Level 4: High-level Structural (Eselon I/II)
    if (p.includes('direktur') || p.includes('kepala pusat') || p.includes('kepala badan') || p.includes('sekretaris')) return 4;
    
    // Level 3: Mid-level Structural / Supervisory / Team Lead
    if (p.includes('kepala') || p.includes('manajer') || (p.includes('supervisi') && !p.includes('tanpa supervisi')) || p.includes('ketua') || p.includes('koordinator')) return 3;
    
    // Level 2: Functional Experts (Ahli/Penyelia/Senior)
    if (p.includes('fungsional') || p.includes('ahli') || p.includes('penyelia') || p.includes('senior') || p.includes('muda') || p.includes('madya') || p.includes('utama')) return 2;
    
    return 1;
  };

  const getRelationshipRole = (evaluator, evalueeTarget) => {
    if (!evaluator || !evalueeTarget) return 'peer';
    
    const evalPos = (evaluator.jabatan || evaluator.position || evaluator.role || '').toLowerCase();
    const evalueePos = (evalueeTarget.jabatan || evalueeTarget.position || '').toLowerCase();
    
    const evalSupervised = (evalPos.includes('supervisi') && !evalPos.includes('tanpa supervisi')) || evalPos.includes('kepala') || evalPos.includes('manajer') || evalPos.includes('direktur') || evalPos.includes('ketua') || evalPos.includes('koordinator');
    const evalueeSupervised = (evalueePos.includes('supervisi') && !evalueePos.includes('tanpa supervisi')) || evalueePos.includes('kepala') || evalueePos.includes('manajer') || evalueePos.includes('direktur') || evalueePos.includes('ketua') || evalueePos.includes('koordinator');
    
    if (evalSupervised && !evalueeSupervised) return 'supervisor';
    if (!evalSupervised && evalueeSupervised) return 'subordinate';
    
    const myLevel = getJobLevel(evalPos); 
    const targetLevel = getJobLevel(evalueePos);
    if (myLevel > targetLevel) return 'supervisor';
    if (myLevel < targetLevel) return 'subordinate';
    return 'peer';
  };

  const checkIsSupervisory = (pos) => {
    const p = (pos || '').toLowerCase();
    return (p.includes('supervisi') && !p.includes('tanpa supervisi')) || 
           p.includes('kepala') || 
           p.includes('manajer') || 
           p.includes('direktur') ||
           p.includes('ketua') ||
           p.includes('koordinator') ||
           p === 'admin' ||
           p === 'administrator';
  };

  // Load data evaluee berdasarkan employeeId
  useEffect(() => {
    const loadEvalueeData = async () => {
      console.log('👤 Loading evaluee data for ID:', employeeId);
      
      let evaluee = null;
      
      // 1. Try Local Storage first
      try {
        const employees = JSON.parse(localStorage.getItem('employees') || '[]');
        // Use String() for robust ID comparison
        evaluee = employees.find(emp => String(emp.id) === String(employeeId));
      } catch (e) {
        console.warn("Error reading local storage:", e);
      }
      
      // 2. If not found locally, try API fallback
      if (!evaluee) {
        try {
          console.log("⚠️ User not found in localStorage, fetching from API...");
          const response = await usersAPI.getProfile(employeeId);
          if (response.success && response.data) {
            evaluee = response.data;
          }
        } catch (error) {
          console.error("❌ Failed to fetch user from API:", error);
        }
      }
      
      if (evaluee) {
        const evalueeInfo = {
          id: evaluee.id,
          name: evaluee.nama || evaluee.name,
          nip: evaluee.nip,
          position: evaluee.jabatan || evaluee.position,
          department: evaluee.department || 'Kementerian Keuangan'
        };
        
        setEvalueeData(evalueeInfo);
        
        // Calculate isSupervisory based on evaluee position
        const isSupervisoryRole = checkIsSupervisory(evalueeInfo.position);
        setIsSupervisory(isSupervisoryRole);
        
        console.log('✅ Evaluee loaded:', evalueeInfo);
        console.log('ℹ️ Is Supervisory Target:', isSupervisoryRole);
        
        // Set evaluator data dari user yang login
        if (user) {
          // Note: user object might use different field names depending on source
          const evaluatorPosition = user.jabatan || user.position || user.role;
          const evalueePosition = evalueeInfo.position;
          
          // Helper dummy objects for role check
          const evaluatorObj = { ...user, jabatan: evaluatorPosition };
          const evalueeObj = { ...evalueeInfo, jabatan: evalueePosition };
          
          const relationshipRole = getRelationshipRole(evaluatorObj, evalueeObj);
          console.log('🔄 Relationship Role:', relationshipRole);

          setEvaluatorData({
            id: user.id || user.employee_id, 
            name: user.name || user.nama,
            nip: user.nip || user.employee_id,
            position: evaluatorPosition,
            department: user.department,
            evaluatorRole: relationshipRole
          });
        }
      } else {
        console.error('❌ Evaluee not found for ID:', employeeId);
        alert('Data pegawai tidak ditemukan!');
        navigate(user?.role === 'admin' ? '/admin-dashboard' : '/evaluator-dashboard');
      }
    };
    
    if (employeeId) {
      loadEvalueeData();
    }
  }, [employeeId, user, navigate]);

  // Set initial scale jika datang dari Dashboard (Tool 1 / Tool 2)
  useEffect(() => {
    const initialScale = location.state?.initialScale;
    if (initialScale === 100 || initialScale === 120) {
      setAssessmentScale(initialScale);
    }
  }, [location.state]);

  // ✅ ASPEK UNTUK SKALA 100 (TOOL 2 - 6 ASPEK MERGED)
  const aspectsScale100 = [
    {
      id: 'a1',
      title: 'Berorientasi Pelayanan',
      description: 'Komitmen memberikan pelayanan prima demi kepuasan masyarakat',
      coreValues: [
        'Memberikan layanan tepat waktu sesuai standar',
        'Bersikap ramah dan sopan kepada pengguna layanan',
        'Menanggapi keluhan dengan cepat dan tepat',
        'Memberikan solusi atas permasalahan layanan',
        'Mengutamakan kepentingan masyarakat/organisasi',
        'Menjaga kualitas hasil layanan',
        'Terbuka terhadap masukan untuk perbaikan layanan'
      ]
    },
    {
      id: 'a2',
      title: 'Kompeten',
      description: 'Terus belajar dan mengembangkan kapabilitas',
      coreValues: [
        'Menguasai tugas dan fungsi jabatan',
        'Menyelesaikan pekerjaan sesuai target',
        'Terus meningkatkan pengetahuan dan keterampilan',
        'Menggunakan metode kerja yang efektif',
        'Mampu memecahkan masalah pekerjaan',
        'Bekerja sesuai prosedur dan ketentuan',
        'Menghasilkan output kerja yang berkualitas'
      ]
    },
    {
      id: 'a3',
      title: 'Kolaboratif & Harmonis',
      description: 'Membangun kerja sama dan lingkungan kondusif',
      coreValues: [
        'Bekerja sama dengan rekan kerja secara efektif',
        'Menghargai perbedaan pendapat',
        'Menjaga hubungan kerja yang harmonis',
        'Bersedia membantu rekan kerja',
        'Berkomunikasi secara terbuka dan konstruktif',
        'Menghindari konflik yang tidak perlu',
        'Membangun sinergi dalam tim kerja'
      ]
    },
    {
      id: 'a4',
      title: 'Adaptif',
      description: 'Terus berinovasi dan antusias dalam menggerakkan serta menghadapi perubahan',
      coreValues: [
        'Cepat menyesuaikan diri dengan perubahan',
        'Terbuka terhadap cara kerja baru',
        'Mampu bekerja di bawah tekanan',
        'Menggunakan teknologi pendukung pekerjaan',
        'Responsif terhadap kebijakan baru',
        'Fleksibel dalam menyelesaikan tugas',
        'Tetap produktif dalam situasi perubahan'
      ]
    },
    {
      id: 'a5',
      title: 'Akuntabel & Loyal',
      description: 'Bertanggung jawab dan berdedikasi tinggi',
      coreValues: [
        'Melaksanakan tugas sesuai aturan dan etika',
        'Bertanggung jawab atas hasil pekerjaan',
        'Menjaga integritas dalam bekerja',
        'Menggunakan sumber daya secara tepat',
        'Menjaga rahasia jabatan dan organisasi',
        'Setia pada Pancasila, UUD 1945, dan pemerintah',
        'Menghindari penyalahgunaan wewenang'
      ]
    },
    {
      id: 'a6',
      title: 'Kepemimpinan',
      description: 'Kemampuan memimpin dan mengelola tim',
      coreValues: [
        'Memberikan arahan kerja yang jelas',
        'Mengambil keputusan secara objektif',
        'Menjadi teladan dalam perilaku kerja',
        'Membina dan mengembangkan bawahan',
        'Mendorong kinerja tim',
        'Mengelola konflik secara adil',
        'Bertanggung jawab atas kinerja unit kerja'
      ]
    }
  ];

  // Scale 120 uses same structure per user requirement "Struktur Penilaian (TIDAK BOLEH DIUBAH)"
  const aspectsScale120 = aspectsScale100;

  const getDraftKey = useCallback((scale) => {
    const evaluatorId = String(evaluatorData?.id || '');
    const nip = String(evalueeData?.nip || '');
    return `draft_assessment_${nip}_${evaluatorId}_${scale}`;
  }, [evalueeData, evaluatorData]);

  const writeDraftSnapshot = useCallback((scale, nextScores, nextComments) => {
    if (!evalueeData || !evaluatorData) return;
    const key = getDraftKey(scale);
    const payload = {
      evaluee_nip: evalueeData.nip,
      evaluator_id: evaluatorData.id,
      scale,
      scores: nextScores || (scale === 100 ? scores100 : scores120),
      comments: nextComments || (scale === 100 ? comments100 : comments120),
      updatedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {}
  }, [evalueeData, evaluatorData, getDraftKey, scores100, scores120, comments100, comments120]);

  // Load existing assessment data
  useEffect(() => {
    const loadExistingAssessments = async () => {
      if (!evalueeData) return;
      
      console.log('🔍 Loading existing assessments for:', evalueeData.nip);
      const evaluatorId = String(evaluatorData?.id || '');
      const nip = String(evalueeData?.nip || '');
      const draftKey100 = `draft_assessment_${nip}_${evaluatorId}_100`;
      const draftKey120 = `draft_assessment_${nip}_${evaluatorId}_120`;
      let draft100 = null;
      let draft120 = null;
      try {
        draft100 = JSON.parse(localStorage.getItem(draftKey100) || 'null');
        draft120 = JSON.parse(localStorage.getItem(draftKey120) || 'null');
      } catch (e) {}
      const storedEvaluations = JSON.parse(localStorage.getItem(evaluationService.storageKey) || '[]');
      
      // Load 100 scale data
      const existingAssessment100 = storedEvaluations.find(ev => 
        ev.evaluee_nip === evalueeData.nip && ev.scale === 100
      );
      
      if (draft100) {
        setScores100(draft100.scores || {});
        setComments100(draft100.comments || {});
      } else if (existingAssessment100) {
        setScores100(existingAssessment100.scores || {});
        setComments100(existingAssessment100.comments || {});
      } else {
        const defaultScores100 = {};
        try {
          (aspectsScale100 || []).forEach(aspect => {
            const key = aspect?.coreValues?.[0];
            if (key) defaultScores100[key] = 0;
          });
        } catch (e) {}
        setScores100(defaultScores100);
        setComments100({});
      }

      // Load 120 scale data
      const existingAssessment120 = storedEvaluations.find(ev => 
        ev.evaluee_nip === evalueeData.nip && ev.scale === 120
      );
      
      if (draft120) {
        setScores120(draft120.scores || {});
        setComments120(draft120.comments || {});
      } else if (existingAssessment120) {
        setScores120(existingAssessment120.scores || {});
        setComments120(existingAssessment120.comments || {});
      } else {
        const defaultScores120 = {};
        try {
          (aspectsScale120 || []).forEach(aspect => {
            const key = aspect?.coreValues?.[0];
            if (key) defaultScores120[key] = 0;
          });
        } catch (e) {}
        setScores120(defaultScores120);
        setComments120({});
      }

      // 🔁 MIGRATION: Prefill Tool 2 (100) from Tool 1 if 100 empty and 120 exists
      try {
        const hasDraft100 = !!draft100;
        const hasExisting100 = !!existingAssessment100;
        const canMigrate = !hasDraft100 && !hasExisting100 && !!existingAssessment120;
        if (canMigrate) {
          const srcScores = existingAssessment120.scores || {};
          const details = existingAssessment120.npk_calculation?.aspectDetails || [];
          const detailMap = {};
          details.forEach(d => {
            const k = (d.coreValue || d.name || d.aspect || '').toLowerCase().replace(/\s+/g, '_').replace(/&/g, '_').replace(/_+/g, '_');
            detailMap[k] = Number(d.indeksCapaian || 0);
          });
          const resolve = (key) => {
            if (srcScores[key] !== undefined) return Number(srcScores[key]);
            if (detailMap[key] !== undefined) return Number(detailMap[key]);
            // Combined fallbacks
            if (key === 'akuntabel' || key === 'loyal') {
              if (srcScores['akuntabel_loyal'] !== undefined) return Number(srcScores['akuntabel_loyal']);
              if (detailMap['akuntabel_loyal'] !== undefined) return Number(detailMap['akuntabel_loyal']);
            }
            if (key === 'kolaboratif' || key === 'harmonis') {
              if (srcScores['kolaboratif_harmonis'] !== undefined) return Number(srcScores['kolaboratif_harmonis']);
              if (detailMap['kolaboratif_harmonis'] !== undefined) return Number(detailMap['kolaboratif_harmonis']);
            }
            return 0;
          };
          const migrated = {};
          (aspectsScale100 || []).forEach(aspect => {
            const title = (aspect.title || '').toLowerCase();
            let k = '';
            if (title.includes('berorientasi')) k = 'berorientasi_pelayanan';
            else if (title.includes('akuntabel') || title.includes('loyal')) k = 'akuntabel_loyal';
            else if (title.includes('kompeten')) k = 'kompeten';
            else if (title.includes('kolaboratif') || title.includes('harmonis')) k = 'kolaboratif_harmonis';
            else if (title.includes('adaptif')) k = 'adaptif';
            else if (title.includes('kepemimpinan')) k = 'kepemimpinan';
            const v = resolve(k);
            const firstKey = aspect?.coreValues?.[0];
            if (firstKey) migrated[firstKey] = v > 0 ? v : 0;
          });
          setScores100(migrated);
          setComments100({});
        }
      } catch (e) {
        console.warn('Migration Tool1 -> Tool2 failed', e);
      }
      
      // Expand all sections if any data exists, otherwise just first
      if (existingAssessment100 || existingAssessment120) {
        const sections = {};
        aspectsScale100.forEach(aspect => {
          sections[aspect.id] = true;
        });
        setExpandedSections(sections);
      } else {
        setExpandedSections({ a1: true });
      }

      // 🔒 Check submitted status per tool from Backend history
      try {
        if (evaluatorData?.id) {
          const history = await npkAPI.getEvaluatorHistory(evaluatorData.id);
          if (history?.success && Array.isArray(history.data)) {
            const submittedThisTool = history.data.some(item => {
              const matchEvaluee = String(item.evaluee_id) === String(evalueeData.id) || String(item.evaluee_nip) === String(evalueeData.nip);
              const matchScale = Number(item.scale || 120) === Number(assessmentScale);
              return matchEvaluee && matchScale;
            });
            if (submittedThisTool) {
              setIsSubmitted(true);
              setShowVerificationModal(false);
            }
          }
        }
      } catch (e) {
        console.warn('History check failed', e);
      }
    };
    
    loadExistingAssessments();
  }, [evalueeData, evaluatorData, assessmentScale]); // Only run when evaluee changes

  useEffect(() => {
    const handler = () => {
      writeDraftSnapshot(100);
      writeDraftSnapshot(120);
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [writeDraftSnapshot]);

  // Get current aspects based on scale
  const getAspects = useCallback(() => {
    return assessmentScale === 100 ? aspectsScale100 : aspectsScale120;
  }, [assessmentScale]);

  // Get current scores and comments
  const getCurrentScores = useCallback(() => {
    return assessmentScale === 100 ? scores100 : scores120;
  }, [assessmentScale, scores100, scores120]);

  const getCurrentComments = useCallback(() => {
    return assessmentScale === 100 ? comments100 : comments120;
  }, [assessmentScale, comments100, comments120]);

  // moved getDraftKey & writeDraftSnapshot above to avoid temporal dead zone

  // Toggle section expansion
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, []);

  // Handle score changes
  const handleScoreChange = useCallback((aspectId, coreValue, score) => {
    console.log('📊 Score changed:', aspectId, coreValue, score);
    
    if (assessmentScale === 100) {
      setScores100(prev => {
        const next = { ...prev, [coreValue]: score };
        writeDraftSnapshot(100, next, comments100);
        return next;
      });
    } else {
      setScores120(prev => {
        const next = { ...prev, [coreValue]: score };
        writeDraftSnapshot(120, next, comments120);
        return next;
      });
    }
  }, [assessmentScale, writeDraftSnapshot, comments100, comments120]);

  // Handle comment changes
  const handleCommentChange = useCallback((aspectId, coreValue, comment) => {
    console.log('💬 Comment changed:', aspectId, coreValue, comment);
    
    if (assessmentScale === 100) {
      setComments100(prev => {
        const next = { ...prev, [coreValue]: comment };
        writeDraftSnapshot(100, scores100, next);
        return next;
      });
    } else {
      setComments120(prev => {
        const next = { ...prev, [coreValue]: comment };
        writeDraftSnapshot(120, scores120, next);
        return next;
      });
    }
  }, [assessmentScale, writeDraftSnapshot, scores100, scores120]);

  // Calculate completion percentage
  const getTotalCompleted = useCallback(() => {
    const aspects = getAspects();
    const scores = getCurrentScores();
    
    let totalFields = 0;
    let completedFields = 0;
    
    aspects.forEach(aspect => {
      aspect.coreValues.forEach(coreValue => {
        totalFields += 2; // Score + Comment
        if (scores[coreValue] && scores[coreValue] > 0) completedFields++;
        if (getCurrentComments()[coreValue] && getCurrentComments()[coreValue].trim()) completedFields++;
      });
    });
    
    return { completed: completedFields, total: totalFields };
  }, [getAspects, getCurrentScores, getCurrentComments]);

  const getOverallCompletion = useCallback(() => {
    const { completed, total } = getTotalCompleted();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [getTotalCompleted]);

  const hasInvalidScores = useCallback(() => {
    const aspects = getAspects();
    const scores = getCurrentScores();
    for (let i = 0; i < aspects.length; i++) {
      const aspect = aspects[i];
      const key = aspect?.coreValues?.[0];
      const val = key ? scores[key] : null;
      if (val === null || val === undefined || Number(val) === 0) {
        return true;
      }
    }
    return false;
  }, [getAspects, getCurrentScores]);

  // Calculate scale comparison
  const calculateScaleComparison = useCallback(() => {
    if (!evalueeData) return null;
    
    // Helper to calculate stats for a scale
    const calculateStats = (scores, scale) => {
      const scoreValues = Object.values(scores).filter(v => v !== null && v !== undefined);
      if (scoreValues.length === 0) return null;
      
      const total = scoreValues.reduce((a, b) => a + b, 0);
      const average = total / scoreValues.length;
      const percentage = (average / scale) * 100;
      
      // Determine predicate/status based on average score (Rentang Nilai)
      // Gunakan centralized logic dari evaluationService
      const ratingInfo = evaluationService.calculateOverallRating(average, [], scale);
      
      return {
        count: scoreValues.length,
        average: average.toFixed(2),
        percentage: percentage.toFixed(1) + '%',
        status: ratingInfo.rating,
        rating: ratingInfo.rating,
        totalScore: total,
        description: ratingInfo.description // Add description if needed
      };
    };

    const stats100 = calculateStats(scores100, 100);
    const stats120 = calculateStats(scores120, 120);

    return {
      scale100: stats100,
      scale120: stats120
    };
  }, [evalueeData, scores100, scores120]);

  // Reusable save function
  const saveAssessmentDraft = useCallback(async (scaleToSave) => {
    // 🛑 Prevent saving if currently submitting or already submitted to avoid race conditions
    if (isSaving || isSubmitted) return;

    if (!evalueeData || !evaluatorData) return;

    const currentScores = scaleToSave === 100 ? scores100 : scores120;
    const currentComments = scaleToSave === 100 ? comments100 : comments120;
    
    // Check if there is any data to save
    const hasData = Object.keys(currentScores).length > 0 || Object.keys(currentComments).length > 0;
    if (!hasData) return;

    try {
        console.log(`💾 Saving Draft Scale ${scaleToSave}...`);
        const assessmentData = {
            evaluee_id: evalueeData.id,
            evaluee_name: evalueeData.name,
            evaluee_nip: evalueeData.nip,
            evaluee_position: evalueeData.position,
            evaluator_id: evaluatorData.id,
            evaluator_name: evaluatorData.name,
            evaluation_period: '2026-Semester-I',
            is_supervisory: isSupervisory,
            scale: scaleToSave,
            scores: currentScores,
            comments: currentComments,
            isDraft: true,
            evaluators: [{
                id: evaluatorData.id,
                name: evaluatorData.name,
                role: evaluatorData.evaluatorRole,
                category: evaluatorData.evaluatorRole,
                scores: currentScores
            }]
        };
        await evaluationService.saveBehavioralAssessment(assessmentData);
        console.log(`✅ Draft Scale ${scaleToSave} saved.`);
    } catch (error) {
        console.error(`❌ Error saving draft scale ${scaleToSave}:`, error);
    }
  }, [evalueeData, evaluatorData, isSupervisory, scores100, comments100, scores120, comments120, isSaving, isSubmitted]);

  // Auto-save for Scale 100
  useEffect(() => {
    const timeoutId = setTimeout(() => {
        saveAssessmentDraft(100);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [scores100, comments100, saveAssessmentDraft]);

  // Auto-save for Scale 120
  useEffect(() => {
    const timeoutId = setTimeout(() => {
        saveAssessmentDraft(120);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [scores120, comments120, saveAssessmentDraft]);

  // Handle show comparison
  const handleShowComparison = useCallback(() => {
    const comparison = calculateScaleComparison();
    if (comparison) {
      setComparisonData(comparison);
      setShowComparisonModal(true);
    }
  }, [calculateScaleComparison]);

  // Handle verify and submit
  const handleVerifyAndSubmit = useCallback(async () => {
    if (!evalueeData || !evaluatorData) {
      alert('Data evaluee atau evaluator tidak lengkap!');
      return;
    }
    if (hasInvalidScores()) {
      alert('Tidak bisa submit: terdapat nilai indikator yang kosong atau bernilai 0. Harap isi semua nilai (>0).');
      return;
    }
    
    // Get current values
    const scores = getCurrentScores();
    const comments = getCurrentComments();
    const completion = getOverallCompletion();
    
    // Allow submission without full completion as requested
    // if (completion < 100) { ... }
    
    try {
      setIsSaving(true);

      // ✅ AGGREGATE SCORES FOR SERVICE
      // Calculate average score per aspect to match evaluationService expectations
      const currentAspects = getAspects();
      const aggregatedScores = {};
      
      currentAspects.forEach(aspect => {
        let keys = [];
        const t = aspect.title.toLowerCase();
        
        // Logic untuk menentukan key berdasarkan title aspek (COMBINED SESUAI REQUEST)
        // FIX: Tambahkan key individual agar perhitungan NPK yang mencari key tunggal tetap jalan
        if (t.includes('berorientasi')) keys = ['berorientasi_pelayanan'];
        else if (t.includes('akuntabel') || t.includes('loyal')) keys = ['akuntabel_loyal', 'akuntabel', 'loyal'];
        else if (t.includes('kompeten')) keys = ['kompeten'];
        else if (t.includes('kolaboratif') || t.includes('harmonis')) keys = ['kolaboratif_harmonis', 'kolaboratif', 'harmonis'];
        else if (t.includes('adaptif')) keys = ['adaptif'];
        else if (t.includes('kepemimpinan')) keys = ['kepemimpinan'];
        
        if (keys.length > 0) {
          const indicators = aspect.coreValues;
          let sum = 0;
          let count = 0;
          indicators.forEach(ind => {
            if (scores[ind]) {
              sum += scores[ind];
              count++;
            }
          });
          
          if (count > 0) {
            const avg = parseFloat((sum / count).toFixed(2));
            keys.forEach(k => {
              aggregatedScores[k] = avg;
            });
          }
        }
      });

      const finalScores = { ...scores, ...aggregatedScores };
      
      // Prepare assessment data
      const assessmentData = {
        evaluee_id: evalueeData.id,
        evaluee_name: evalueeData.name,
        evaluee_nip: evalueeData.nip,
        evaluee_position: evalueeData.position,
        evaluator_id: evaluatorData.id,
        evaluator_name: evaluatorData.name,
        evaluation_period: '2026-Semester-I',
        is_supervisory: isSupervisory,
        scale: assessmentScale,
        scores: finalScores, // Use merged scores
        comments: comments,
        evaluators: [{
          id: evaluatorData.id,
          name: evaluatorData.name,
          role: evaluatorData.evaluatorRole,
          category: evaluatorData.evaluatorRole,
          scores: finalScores // Use merged scores
        }]
      };
      
      console.log('📋 Submitting assessment:', assessmentData);
      
      // Save to localStorage
      await evaluationService.saveBehavioralAssessment(assessmentData);

      // ✅ SUBMIT TO BACKEND (Sync to DB for Dashboard)
      console.log('🚀 Syncing to Backend...');
      
      // Calculate NPK Details for Backend
      const npkDetails = evaluationService.calculateNPKDetails(assessmentData, assessmentScale);
      
      const backendResp = await npkAPI.submitBehavioralAssessmentV2({
        evaluation_period_id: 1, 
        evaluator_id: evaluatorData.id,
        evaluee_id: evalueeData.id,
        is_supervisory: isSupervisory,
        scores: aggregatedScores, // Use aggregated scores (per core value)
        comments: comments,
        feedback_learning: "Penilaian profesional", // Default feedback if not collected in this UI
        feedback_obstacles: "Tidak ada kendala signifikan",
        scale: assessmentScale,
        aspect_details: npkDetails?.aspectDetails,
        weighting_condition: npkDetails?.condition,
        npk_score: npkDetails?.npkPeriodik
      });
      if (backendResp && backendResp.status === 409) {
        alert('Penilaian untuk tool ini sudah terkirim. Anda tetap dapat melakukan penilaian di tool lainnya.');
      }
      
      // ✅ Set submitted flag to prevent auto-save overwrite
      setIsSubmitted(true);
      
      // Show success notification
      setSuccessNotificationData({
        evalueeName: evalueeData.name,
        evalueeNip: evalueeData.nip,
        npkScore: 0, // Will be calculated
        completionPercentage: completion
      });
      
      setShowSuccessNotification(true);
      setShowVerificationModal(false);
      
      try {
        const all = JSON.parse(localStorage.getItem(evaluationService.storageKey) || '[]');
        const filtered = all.filter(ev => {
          const samePair = String(ev.evaluee_nip) === String(evalueeData.nip) && String(ev.evaluator_id) === String(evaluatorData.id);
          const isDraft = (ev.status || '').toLowerCase() === 'draft' || ev.isDraft === true;
          return !(samePair && isDraft);
        });
        localStorage.setItem(evaluationService.storageKey, JSON.stringify(filtered));
        
        const evaluatorId = String(evaluatorData.id);
        const nip = String(evalueeData.nip);
        const draftKey100 = `draft_assessment_${nip}_${evaluatorId}_100`;
        const draftKey120 = `draft_assessment_${nip}_${evaluatorId}_120`;
        localStorage.removeItem(draftKey100);
        localStorage.removeItem(draftKey120);
      } catch (e) {}
      
    } catch (error) {
      const isConflict = (error && error.response && error.response.status === 409) || (String(error?.message || '').includes('Penilaian sudah terkirim'));
      if (isConflict) {
        alert('Penilaian untuk tool ini sudah terkirim. Anda tetap dapat melakukan penilaian di tool lainnya.');
        setIsSubmitted(true);
        setShowVerificationModal(false);
      } else {
        console.error('❌ Error saving assessment:', error);
        alert('Terjadi kesalahan saat menyimpan penilaian: ' + (error?.message || 'Unknown error'));
      }
    } finally {
      setIsSaving(false);
    }
  }, [evalueeData, evaluatorData, getCurrentScores, getCurrentComments, getOverallCompletion, isSupervisory, assessmentScale]);

  // Show verification modal
  const handleShowVerification = useCallback(() => {
    if (hasInvalidScores()) {
      alert('Tidak bisa lanjut verifikasi: terdapat nilai indikator yang kosong atau bernilai 0. Harap isi semua nilai (>0).');
      return;
    }
    setShowVerificationModal(true);
  }, [hasInvalidScores]);

  // Loading state
  if (isLoading && !evalueeData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data penilaian...</p>
        </div>
      </div>
    );
  }

  const completionPercentage = getOverallCompletion();
  const currentAspects = getAspects();

  const handleBack = async () => {
    // Force save before navigating back
    await saveAssessmentDraft(100);
    await saveAssessmentDraft(120);
    navigate('/evaluator-dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <Icon name="ArrowLeft" size={18} />
                <span className="hidden sm:inline">Kembali</span>
              </button>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <h1 className="text-xl font-bold text-slate-800">Penilaian Perilaku Kerja</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-500">Progress</p>
                <p className="text-sm font-bold text-blue-600">{completionPercentage}%</p>
              </div>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Info Cards */}
        <div className="mb-8">
          {/* Evaluee Info */}
          {evalueeData && (
            <div className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Icon name="User" size={24} className="text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-slate-900">Pegawai yang Dinilai</h3>
                    <p className="text-sm text-slate-500">Informasi pegawai yang sedang dinilai</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Nama</p>
                    <p className="font-semibold text-slate-900 truncate" title={evalueeData.name}>{evalueeData.name}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">NIP</p>
                    <p className="font-mono font-medium text-slate-700">{evalueeData.nip}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg sm:col-span-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Jabatan</p>
                    <p className="text-sm text-slate-700">{evalueeData.position}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Progress Indicator - Removed standalone since it's in sticky header now */}
        {/* <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Progress Penilaian</h3>
            <span className="text-sm font-medium text-slate-700">{completionPercentage}% Selesai</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div> */}

        {/* Assessment Guide Image */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Panduan Penilaian</h3>
          <div className="w-full overflow-hidden rounded-lg border border-slate-200">
            <img 
              src={assessmentScale === 100 ? "/assets/images/tabel100.png" : "/assets/images/tabel120.png"} 
              alt="Panduan Penilaian" 
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Assessment Form */}
        <div className="space-y-6 mb-8">
          {currentAspects.map((aspect, aspectIndex) => (
            <CoreValueSection
              key={aspect.id}
              coreValue={aspect}
              score={getCurrentScores()[aspect.coreValues[0]]}
              comment={getCurrentComments()[aspect.coreValues[0]]}
              onScoreChange={(coreValue, score) => handleScoreChange(aspect.id, coreValue, score)}
              onCommentChange={(coreValue, comment) => handleCommentChange(aspect.id, coreValue, comment)}
              isExpanded={expandedSections[aspect.id] || false}
              onToggle={() => toggleSection(aspect.id)}
              scale={assessmentScale}
              index={aspectIndex}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-lg z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-4 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  onClick={handleShowComparison}
                  disabled={!evalueeData}
                  className="w-full sm:w-auto justify-center"
                >
                  📊 Perbandingan Tool
                </Button>
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                {isSubmitted ? (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/evaluator-dashboard')}
                    className="flex-1 sm:flex-none justify-center"
                  >
                    Detail
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleShowVerification}
                    disabled={!evalueeData || hasInvalidScores()}
                    className="flex-1 sm:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform transition-all active:scale-95"
                  >
                    Verifikasi & Submit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showVerificationModal && evalueeData && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          evalueeData={evalueeData}
          completionPercentage={completionPercentage}
          isSubmitting={isSaving}
          onConfirm={handleVerifyAndSubmit}
        />
      )}

      {showSuccessNotification && (
        <SuccessNotificationModal
          isOpen={showSuccessNotification}
          onClose={() => {
            setShowSuccessNotification(false);
            navigate('/evaluator-dashboard');
          }}
          data={successNotificationData}
        />
      )}

      {showComparisonModal && comparisonData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-slate-900">Perbandingan Hasil Penilaian</h3>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Scale 120 (Tool 1) */}
                <div className="space-y-4">
                   <div className="flex items-center space-x-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">Tool 1</span>
                   </div>
                   {comparisonData.scale120 ? (
                     <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <div className="text-center mb-6">
                          <div className="text-4xl font-bold text-slate-900 mb-1">{comparisonData.scale120.average}</div>
                          <div className="text-sm text-slate-500">Rata-rata Nilai</div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between p-3 bg-white rounded-lg border border-slate-100">
                            <span className="text-slate-600">Predikat</span>
                            <span className={`font-bold ${
                              comparisonData.scale120.status === 'Di Atas Ekspektasi' ? 'text-blue-600' : 
                              comparisonData.scale120.status === 'Sesuai Ekspektasi' ? 'text-yellow-600' : 'text-red-600'
                            }`}>{comparisonData.scale120.status}</span>
                          </div>
                        </div>
                     </div>
                   ) : (
                     <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                       <Icon name="ClipboardList" size={32} className="mb-2" />
                       <p>Belum ada data penilaian</p>
                     </div>
                   )}
                </div>

                {/* Scale 100 (Tool 2) */}
                <div className="space-y-4">
                   <div className="flex items-center space-x-2 mb-4">
                      <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">Tool 2</span>
                   </div>
                   {comparisonData.scale100 ? (
                     <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <div className="text-center mb-6">
                          <div className="text-4xl font-bold text-slate-900 mb-1">{comparisonData.scale100.average}</div>
                          <div className="text-sm text-slate-500">Rata-rata Nilai</div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between p-3 bg-white rounded-lg border border-slate-100">
                            <span className="text-slate-600">Predikat</span>
                            <span className={`font-bold ${
                              comparisonData.scale100.status === 'Di Atas Ekspektasi' ? 'text-green-600' : 
                              comparisonData.scale100.status === 'Sesuai Ekspektasi' ? 'text-yellow-600' : 'text-red-600'
                            }`}>{comparisonData.scale100.status}</span>
                          </div>
                        </div>
                     </div>
                   ) : (
                     <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                       <Icon name="ClipboardList" size={32} className="mb-2" />
                       <p>Belum ada data penilaian</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
              <Button onClick={() => setShowComparisonModal(false)}>Tutup</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehavioralAssessment;
