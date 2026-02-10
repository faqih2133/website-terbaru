import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, npkAPI } from '../../lib/api';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import evaluationService from '../../services/evaluationService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper: 7 Key Behavior Indicators per Core Value
const BEHAVIOR_INDICATORS = {
  'berorientasi_pelayanan': [
    'Memberikan layanan tepat waktu sesuai standar',
    'Bersikap ramah dan sopan kepada pengguna layanan',
    'Menanggapi keluhan dengan cepat dan tepat',
    'Memberikan solusi atas permasalahan layanan',
    'Mengutamakan kepentingan masyarakat/organisasi',
    'Menjaga kualitas hasil layanan',
    'Terbuka terhadap masukan untuk perbaikan layanan'
  ],
  'kompeten': [
    'Menguasai tugas dan fungsi jabatan',
    'Menyelesaikan pekerjaan sesuai target',
    'Terus meningkatkan pengetahuan dan keterampilan',
    'Menggunakan metode kerja yang efektif',
    'Mampu memecahkan masalah pekerjaan',
    'Bekerja sesuai prosedur dan ketentuan',
    'Menghasilkan output kerja yang berkualitas'
  ],
  'kolaboratif': [
    'Bekerja sama dengan rekan kerja secara efektif',
    'Menghargai perbedaan pendapat',
    'Menjaga hubungan kerja yang harmonis',
    'Bersedia membantu rekan kerja',
    'Berkomunikasi secara terbuka dan konstruktif',
    'Menghindari konflik yang tidak perlu',
    'Membangun sinergi dalam tim kerja'
  ],
  'harmonis': [
    'Bekerja sama dengan rekan kerja secara efektif',
    'Menghargai perbedaan pendapat',
    'Menjaga hubungan kerja yang harmonis',
    'Bersedia membantu rekan kerja',
    'Berkomunikasi secara terbuka dan konstruktif',
    'Menghindari konflik yang tidak perlu',
    'Membangun sinergi dalam tim kerja'
  ],
  'adaptif': [
    'Cepat menyesuaikan diri dengan perubahan',
    'Terbuka terhadap cara kerja baru',
    'Mampu bekerja di bawah tekanan',
    'Menggunakan teknologi pendukung pekerjaan',
    'Responsif terhadap kebijakan baru',
    'Fleksibel dalam menyelesaikan tugas',
    'Tetap produktif dalam situasi perubahan'
  ],
  'akuntabel': [
    'Melaksanakan tugas sesuai aturan dan etika',
    'Bertanggung jawab atas hasil pekerjaan',
    'Menjaga integritas dalam bekerja',
    'Menggunakan sumber daya secara tepat',
    'Menjaga rahasia jabatan dan organisasi',
    'Setia pada Pancasila, UUD 1945, dan pemerintah',
    'Menghindari penyalahgunaan wewenang'
  ],
  'loyal': [
    'Melaksanakan tugas sesuai aturan dan etika',
    'Bertanggung jawab atas hasil pekerjaan',
    'Menjaga integritas dalam bekerja',
    'Menggunakan sumber daya secara tepat',
    'Menjaga rahasia jabatan dan organisasi',
    'Setia pada Pancasila, UUD 1945, dan pemerintah',
    'Menghindari penyalahgunaan wewenang'
  ],
  'kepemimpinan': [
    'Memberikan arahan kerja yang jelas',
    'Mengambil keputusan secara objektif',
    'Menjadi teladan dalam perilaku kerja',
    'Membina dan mengembangkan bawahan',
    'Mendorong kinerja tim',
    'Mengelola konflik secara adil',
    'Bertanggung jawab atas kinerja unit kerja'
  ]
};

const EvaluatorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPredikatModal, setShowPredikatModal] = useState(false);
  const [predikatModalData, setPredikatModalData] = useState(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [hasCheckedPending, setHasCheckedPending] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    if (user && user.id) {
      try {
        sessionStorage.removeItem(`pendingNoticeShown_${user.id}`);
      } catch (_) {}
    }
    await logout();
    navigate('/');
    setShowLogoutModal(false);
  };

  const [activeTab, setActiveTab] = useState('all-employees');
  const [allEmployees, setAllEmployees] = useState([]);
  const [myEvaluationsHistory, setMyEvaluationsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for Detail Modal
  const [selectedEvaluationDetail, setSelectedEvaluationDetail] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // State for Comparison Mode (Side-by-side Tool 1 & Tool 2)
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [selectedEmployeeForComparison, setSelectedEmployeeForComparison] = useState(null);
  const [expandedIndicators, setExpandedIndicators] = useState({});

  const handleViewDetail = (evaluation) => {
    setSelectedEvaluationDetail(evaluation);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvaluationDetail(null);
  };

  // Pagination State (Optimasi Kinerja untuk Data Besar)
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Default 10 per halaman
  const [weightFilter, setWeightFilter] = useState('all');

  // Memoized Evaluations Map untuk Optimasi O(1) Lookup
  const evaluationsMap = React.useMemo(() => {
    const map = {};
    myEvaluationsHistory.forEach(ev => {
      // Gunakan composite key atau nested map jika perlu, tapi grouping by evaluee_id cukup
      const key = String(ev.evaluee_id);
      if (!map[key]) map[key] = [];
      map[key].push(ev);
      
      // Fallback untuk NIP jika ID tidak konsisten
      if (ev.evaluee_nip) {
         if (!map[ev.evaluee_nip]) map[ev.evaluee_nip] = [];
         map[ev.evaluee_nip].push(ev);
      }
    });
    return map;
  }, [myEvaluationsHistory]);

  const loadData = useCallback(async (currentEvaluatorId) => {
    setLoading(true);
    setError(null);

    if (!currentEvaluatorId) {
      console.error("❌ loadData called without currentEvaluatorId!");
      setMyEvaluationsHistory([]);
      setAllEmployees([]);
      setLoading(false);
      return;
    }

    try {
      // 1. Ambil semua karyawan dari API (Prioritas Utama) atau localStorage (Fallback)
      let storedEmployees = [];
      try {
        const usersResponse = await usersAPI.getAll();
        if (usersResponse.success && Array.isArray(usersResponse.data)) {
          storedEmployees = usersResponse.data;
          // Update localStorage untuk sinkronisasi
          localStorage.setItem('employees', JSON.stringify(storedEmployees));
          console.log("✅ Loaded employees from API:", storedEmployees.length);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (apiError) {
        console.warn("⚠️ Failed to fetch users from API, using localStorage:", apiError);
        storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      }
      
      // Debug: Cek struktur data employee pertama jika ada
      if (storedEmployees.length > 0) {
        console.log("🔍 Sample employee data:", storedEmployees[0]);
      }

      // 2. Cari data lengkap user saat ini untuk mengecek jabatan
      const currentUserData = storedEmployees.find(e => String(e.id) === String(currentEvaluatorId)) || user;

      let relevantEmployees = [];
      
      // ✅ LOGIC BARU (BACKEND FIRST): Fetch Assignments from API
      console.log(`📡 Fetching assignments for evaluator ${currentEvaluatorId} from Backend...`);
      try {
        const assignmentsResponse = await npkAPI.getEvaluatorAssignments(currentEvaluatorId);
        
        if (assignmentsResponse.success && Array.isArray(assignmentsResponse.data)) {
           console.log(`✅ Loaded ${assignmentsResponse.data.length} assignments from Backend`);
           
           // Map backend assignments to employee objects
           // Backend likely returns { evaluee_id, evaluee_name, evaluee_nip, ... } or just IDs
           // We'll try to match with storedEmployees first, then use data from assignment if available
           
           const backendAssignments = assignmentsResponse.data;
           const assignedIds = backendAssignments.map(a => String(a.evaluee_id));
           
           // Filter stored employees
           relevantEmployees = storedEmployees.filter(emp => assignedIds.includes(String(emp.id)));
           
           // If some are missing in storedEmployees (e.g. new users), try to use data from assignment response
           if (relevantEmployees.length < backendAssignments.length) {
             const missingAssignments = backendAssignments.filter(a => !relevantEmployees.some(re => String(re.id) === String(a.evaluee_id)));
             
             missingAssignments.forEach(ma => {
               if (ma.evaluee_id) {
                 relevantEmployees.push({
                   id: String(ma.evaluee_id),
                   nip: ma.evaluee_nip || '-',
                   nama: ma.evaluee_name || 'Unknown',
                   name: ma.evaluee_name || 'Unknown',
                   jabatan: ma.evaluee_position || '-',
                   department: ma.evaluee_department || '-'
                 });
               }
             });
           }
           
        } else {
           console.warn("⚠️ No assignments found from Backend or invalid format. Falling back to LocalStorage logic.");
           throw new Error("Backend assignments empty or invalid");
        }
      } catch (assignmentError) {
        console.warn("⚠️ Failed to fetch assignments from Backend, using LocalStorage fallback:", assignmentError);
        
        // FALLBACK TO LOCALSTORAGE LOGIC (Your existing robust sync)
        const allAssignments = evaluationService.getAllAssignments();
        const cleanNip = (n) => String(n || '').replace(/\s+/g, '').trim();
        const myNip = cleanNip(user.nip);
        
        // Kumpulkan semua ID yang mungkin milik user ini (berdasarkan NIP yang sama)
        const myPossibleIds = storedEmployees
          .filter(e => cleanNip(e.nip) === myNip)
          .map(e => String(e.id));
          
        // Tambahkan juga ID sesi saat ini & ID yang diminta
        const candidateIds = new Set([...myPossibleIds, String(user.id), String(currentEvaluatorId)]);
        
        console.log(`🔍 Robust Sync (Fallback): Searching assignments for NIP ${myNip} across IDs:`, Array.from(candidateIds));

        // Cari semua assignment yang evaluatorId-nya cocok dengan salah satu candidateId
        let allAssignedEvalueeIds = [];
        allAssignments.forEach(assign => {
          if (candidateIds.has(String(assign.evaluatorId))) {
             if (assign.evalueeIds && Array.isArray(assign.evalueeIds)) {
               allAssignedEvalueeIds = [...allAssignedEvalueeIds, ...assign.evalueeIds];
             }
          }
        });
        
        // Unique IDs
        const assignedEvalueeIds = [...new Set(allAssignedEvalueeIds)];
        
        if (assignedEvalueeIds && assignedEvalueeIds.length > 0) {
          console.log(`📋 Found ${assignedEvalueeIds.length} assigned evaluees (Robust Sync).`);
          const assignedStr = assignedEvalueeIds.map(id => String(id));
          relevantEmployees = storedEmployees.filter(emp => assignedStr.includes(String(emp.id)));
          if (relevantEmployees.length === 0) {
            const assignedNips = new Set(assignedStr.map(val => cleanNip(val)));
            relevantEmployees = storedEmployees.filter(emp => assignedNips.has(cleanNip(emp.nip)));
          }
          if (relevantEmployees.length === 0) {
            let snaps = [];
            allAssignments.forEach(assign => {
              if (candidateIds.has(String(assign.evaluatorId)) && Array.isArray(assign.evalueeSnaps)) {
                snaps = snaps.concat(assign.evalueeSnaps);
              }
            });
            if (snaps.length > 0) {
              const seen = new Set();
              const normalized = snaps.filter(s => {
                const key = s.id || cleanNip(s.nip || '');
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              }).map(s => ({
                id: s.id,
                nip: s.nip || '',
                name: s.nama || '',
                nama: s.nama || '',
                position: s.jabatan || '',
                jabatan: s.jabatan || ''
              }));
              relevantEmployees = normalized;
            }
          }
        } else {
          console.log(`⚠️ No assignments found for evaluator ${currentEvaluatorId}. Returning empty list per user request.`);
          relevantEmployees = []; 
        }
      }

      if (relevantEmployees.length > 0) {
        const missingInDb = relevantEmployees.filter(emp => 
          !storedEmployees.some(e => String(e.id) === String(emp.id))
        );
        if (missingInDb.length > 0) {
          const merged = [...storedEmployees];
          missingInDb.forEach(emp => {
            merged.push({
              id: String(emp.id),
              nip: emp.nip || '',
              nama: emp.nama || emp.name || '',
              name: emp.nama || emp.name || '',
              jabatan: emp.jabatan || emp.position || '',
              position: emp.jabatan || emp.position || '',
              department: emp.department || '',
              email: emp.email || ''
            });
          });
          localStorage.setItem('employees', JSON.stringify(merged));
        }
      }
      setAllEmployees(relevantEmployees);

      // 3. Fetch History from Backend (Source of Truth for Submitted Data)
      try {
        const historyResponse = await npkAPI.getEvaluatorHistory(currentEvaluatorId);
        if (historyResponse.success && Array.isArray(historyResponse.data)) {
          console.log("✅ Loaded history from Backend:", historyResponse.data.length);
          const backendHistory = historyResponse.data.map(item => {
            // Check if backend provided rich npk_calculation
            let npkCalc = item.npk_calculation;
            
            // If not (or if it's legacy data), construct a fallback
            if (!npkCalc || !npkCalc.aspectDetails) {
                 // Try to construct from flat fields if available
                 const wUsed = item.weights_used || {};
                 
                 // Split merged scores if present
                 const splitScores = [];
                 Object.entries(item.scores || {}).forEach(([key, val]) => {
                    if (key === 'akuntabel_loyal') {
                        splitScores.push({ key: 'akuntabel', val });
                        splitScores.push({ key: 'loyal', val });
                    } else if (key === 'kolaboratif_harmonis') {
                        splitScores.push({ key: 'kolaboratif', val });
                        splitScores.push({ key: 'harmonis', val });
                    } else {
                        splitScores.push({ key, val });
                    }
                 });

                 npkCalc = {
                   npkPeriodik: item.npk_score,
                   kondisi: item.weighting_condition || 'Normal', 
                   bobot: {
                      A: wUsed.supervisor || 0,
                      P: wUsed.peers || 0,
                      B: wUsed.subordinates || wUsed.subordinate || 0
                   },
                   aspectDetails: splitScores.map(({key, val}) => ({
                       coreValue: key,
                       name: key.replace(/_/g, ' '),
                       indeksCapaian: val,
                       predikat: val >= 90 ? 'Sangat Baik' : val >= 75 ? 'Baik' : val >= 60 ? 'Cukup' : 'Kurang'
                   }))
                 };
            } else {
               // Ensure bobot has A/P/B keys if it uses supervisor/peers/subordinates
               const wUsed = npkCalc.weights || item.weights_used || {};
               if (!npkCalc.bobot || (!npkCalc.bobot.A && wUsed.supervisor !== undefined)) {
                  npkCalc.bobot = {
                      A: wUsed.supervisor || 0,
                      P: wUsed.peers || 0,
                      B: wUsed.subordinates || wUsed.subordinate || 0
                  };
               }
               
               // Normalize aspectDetails to always include 8 core values
               try {
                 const existing = Array.isArray(npkCalc.aspectDetails) ? npkCalc.aspectDetails.slice() : [];
                 const mapByKey = {};
                 
                 existing.forEach(a => {
                   const key = (a.coreValue || '').toLowerCase();
                   const name = (a.name || a.aspect || '').toLowerCase();
                   const resolvedKey = key || name.replace(/\s+/g, '_');
                   const displayName = a.name || a.aspect || evaluationService.getCoreValueName(resolvedKey, item.scale);
                   mapByKey[resolvedKey] = { ...a, coreValue: resolvedKey, name: displayName };
                 });
                 
                 const keys = [
                   'berorientasi_pelayanan',
                   'akuntabel',
                   'kompeten',
                   'harmonis',
                   'loyal',
                   'adaptif',
                   'kolaboratif',
                   'kepemimpinan'
                 ];
                 
                 const scoresObj = item.scores || {};
                 const getScore = (k) => {
                   if (scoresObj[k] !== undefined) return scoresObj[k];
                   if (k === 'akuntabel' || k === 'loyal') {
                     if (scoresObj['akuntabel_loyal'] !== undefined) return scoresObj['akuntabel_loyal'];
                     if (scoresObj['akuntabel_&_loyal'] !== undefined) return scoresObj['akuntabel_&_loyal'];
                     if (scoresObj['Akuntabel & Loyal'] !== undefined) return scoresObj['Akuntabel & Loyal'];
                     if (mapByKey['akuntabel_loyal']?.indeksCapaian !== undefined) return mapByKey['akuntabel_loyal'].indeksCapaian;
                   }
                   if (k === 'kolaboratif' || k === 'harmonis') {
                     if (scoresObj['kolaboratif_harmonis'] !== undefined) return scoresObj['kolaboratif_harmonis'];
                     if (scoresObj['kolaboratif_&_harmonis'] !== undefined) return scoresObj['kolaboratif_&_harmonis'];
                     if (scoresObj['Kolaboratif & Harmonis'] !== undefined) return scoresObj['Kolaboratif & Harmonis'];
                     if (mapByKey['kolaboratif_harmonis']?.indeksCapaian !== undefined) return mapByKey['kolaboratif_harmonis'].indeksCapaian;
                   }
                   return undefined;
                 };
                 
                 const normalized = keys.map(k => {
                   if (mapByKey[k]) {
                     // Ensure name exists
                     const nm = mapByKey[k].name || evaluationService.getCoreValueName(k, item.scale);
                     return { ...mapByKey[k], coreValue: k, name: nm };
                   }
                   const val = getScore(k);
                   const scoreVal = val !== undefined && val !== null ? Number(val) : 0;
                   return {
                     coreValue: k,
                     name: evaluationService.getCoreValueName(k, item.scale),
                     indeksCapaian: scoreVal,
                     breakdown: mapByKey[k]?.breakdown || { npkAtasan: 0, npkPeers: 0, npkBawahan: 0, weights: npkCalc.bobot }
                   };
                 });
                 
                 npkCalc.aspectDetails = normalized;
               } catch (e) {
                 console.warn('Normalization aspectDetails failed', e);
               }
            }

            return {
             ...item,
             id: item.id,
             nama: item.evaluee_name,
             nip: item.evaluee_nip,
             jabatan: item.evaluee_position,
             department: item.evaluee_department,
             is_completed: true,
             scale: item.scale ? Number(item.scale) : 120, // Use scale from backend, default to 120
             scores: item.scores,
             nilai_nkp: item.npk_score,
             npk_calculation: npkCalc
            };
          });
          setMyEvaluationsHistory(backendHistory);
        } else {
           setMyEvaluationsHistory([]); 
        }
      } catch (historyError) {
         console.error("⚠️ Failed to fetch history from Backend:", historyError);
         setMyEvaluationsHistory([]);
      }

    } catch (err) {
      console.error("Gagal memuat data dashboard evaluator:", err);
      setError("Gagal memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'evaluator') {
      console.log('🔄 Initializing Evaluator Dashboard for:', user.name, user.nip);
      
      // ✅ RESOLVE CANONICAL ID (Match Submission Logic)
      // Ensures we query using the same ID that was used to save the assessment
      let targetId = user.id;
      try {
          const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
          const cleanNip = (n) => String(n || '').replace(/\s+/g, '').trim();
          if (user.nip) {
            const myNip = cleanNip(user.nip);
            const canonicalEmployee = storedEmployees.find(e => cleanNip(e.nip) === myNip);
            if (canonicalEmployee && canonicalEmployee.id) {
              console.log(`🔄 Resolved Canonical ID for Dashboard: ${targetId} -> ${canonicalEmployee.id}`);
              targetId = canonicalEmployee.id;
            }
          }
      } catch (e) { console.warn('ID Resolution failed', e); }

      // Backend-first: use resolved targetId. Assignment fetching is handled in loadData.
      if (targetId) {
        loadData(targetId);
      } else {
        setError("Gagal memuat data: Identitas pengguna tidak valid.");
        setLoading(false);
      }
    } else if (user && user.role !== 'evaluator') {
      navigate('/');
    }

    const handleStorageChange = () => {
      if (user?.id) loadData(user.id);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, navigate, loadData]);

  const handleStartAssessment = (employeeId, scale) => {
    navigate(`/behavioral-assessment/${employeeId}?scale=${scale}`, {
      state: { initialScale: scale }
    });
  };

  // ✅ EXPORT PDF FUNCTION (Matches Admin Format)
  const handleExportPDF = useCallback((scaleType) => {
    console.log(`📄 Exporting PDF for Scale ${scaleType}...`);
    
    // Filter evaluations
    const targetEvaluations = myEvaluationsHistory.filter(ev => 
      Number(ev.scale) === scaleType && 
      ev.is_completed
    );

    if (targetEvaluations.length === 0) {
      alert(`Tidak ada data evaluasi selesai untuk Tool ${scaleType === 120 ? '1' : '2'} untuk di-export PDF!`);
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape

    // Header
    const scaleLabel = scaleType === 120 ? 'Tool 1 (Skala 120)' : 'Tool 2 (Skala 100)';
    doc.setFontSize(18);
    doc.text(`Laporan Riwayat Penilaian - ${scaleLabel}`, 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Penilai: ${user?.name || '-'}`, 14, 30);
    doc.text(`NIP: ${user?.nip || '-'}`, 14, 36);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 42);

    // Prepare Headers
    const head = [['No', 'NIP', 'Nama', 'Predikat', 'NPK', 'Berorientasi', 'Akuntabel & Loyal', 'Kompeten', 'Kolaboratif & Harmonis', 'Adaptif', 'Kepemimpinan']];

    // Table Data
    const tableData = targetEvaluations.map((ev, index) => {
       const periodik = ev.npk_calculation?.npkPeriodik ?? ev.nilai_nkp ?? 0;
       const predikatInfo = evaluationService.calculateOverallRating(periodik, [], scaleType);
       const details = ev.npk_calculation?.aspectDetails || [];
       const valMap = {};
       details.forEach(d => {
         const rawKey = (d.coreValue || d.name || '').toLowerCase();
         const normKey = rawKey.replace(/\s*&\s*/g, '_').replace(/\s+/g, '_');
         valMap[normKey] = Number(d.indeksCapaian);
       });
       const scores = ev.scores || {};
       const scoreMap = {};
       Object.entries(scores).forEach(([k, v]) => {
         scoreMap[k] = Number(v);
       });
       const orderedKeys = [
         'berorientasi_pelayanan',
         'akuntabel_loyal',
         'kompeten',
         'kolaboratif_harmonis',
         'adaptif',
         'kepemimpinan'
       ];
       const aspects = orderedKeys.map(k => {
         let val = valMap[k];
         if (val === undefined || val === 0) {
           if (k === 'akuntabel_loyal') {
             val = valMap['akuntabel_loyal'] ?? ((valMap['akuntabel'] && valMap['loyal']) ? (valMap['akuntabel'] + valMap['loyal']) / 2 : undefined);
           }
           if (k === 'kolaboratif_harmonis') {
             val = valMap['kolaboratif_harmonis'] ?? ((valMap['kolaboratif'] && valMap['harmonis']) ? (valMap['kolaboratif'] + valMap['harmonis']) / 2 : undefined);
           }
         }
         if (val === undefined || val === 0) {
           val = scoreMap[k];
           if (val === undefined || val === 0) {
             if (k === 'akuntabel_loyal') {
               val = scoreMap['akuntabel_loyal'] ?? scoreMap['akuntabel_&_loyal'] ?? scoreMap['Akuntabel & Loyal'];
               if ((val === undefined || val === 0) && (scoreMap['akuntabel'] || scoreMap['loyal'])) {
                 val = ((Number(scoreMap['akuntabel'] || 0) + Number(scoreMap['loyal'] || 0)) / 2);
               }
             }
             if (k === 'kolaboratif_harmonis') {
               val = scoreMap['kolaboratif_harmonis'] ?? scoreMap['kolaboratif_&_harmonis'] ?? scoreMap['Kolaboratif & Harmonis'];
               if ((val === undefined || val === 0) && (scoreMap['kolaboratif'] || scoreMap['harmonis'])) {
                 val = ((Number(scoreMap['kolaboratif'] || 0) + Number(scoreMap['harmonis'] || 0)) / 2);
               }
             }
           }
         }
         return Number((val ?? 0).toFixed(2));
       });
       
       return [
         index + 1,
         ev.evaluee_nip || ev.nip || '-',
         ev.evaluee_name || ev.nama || '-',
         predikatInfo.rating,
         Number(periodik).toFixed(2),
         ...aspects.map(s => Number(s).toFixed(2))
       ];
    });

    // Generate Table
    doc.autoTable({
      startY: 50,
      head: head,
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], fontSize: 8, halign: 'center' },
      styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
      columnStyles: {
        2: { halign: 'left' }
      }
    });

    doc.save(`Riwayat_Penilaian_Tool_${scaleType}_${user?.nip}.pdf`);
  }, [myEvaluationsHistory, user]);

  // ✅ EXPORT EXCEL FOR EVALUATOR
  const handleExport = useCallback((scaleType) => {
    console.log(`📊 Exporting evaluation data to Excel for Scale ${scaleType}...`);
    
    // Filter evaluations: Must be this scale AND created by this evaluator
    const targetEvaluations = myEvaluationsHistory.filter(ev => 
      Number(ev.scale) === scaleType && 
      ev.is_completed // Only export completed ones
    );
    
    if (targetEvaluations.length === 0) {
      alert(`Tidak ada data evaluasi selesai untuk Tool ${scaleType === 120 ? '1' : '2'}!`);
      return;
    }

    const headers = [
      'NIP',
      'Nama',
      'Predikat',
      'NPK Periodik',
      'Berorientasi Pelayanan',
      'Akuntabel',
      'Kompeten',
      'Harmonis',
      'Loyal',
      'Adaptif',
      'Kolaboratif',
      'Kepemimpinan'
    ];

    // Use semicolon for better Excel compatibility in Indonesia/Europe
    const csvRows = [headers.join(';')];

    // Sort by Name
    const sortedEvaluations = targetEvaluations.sort((a, b) => {
        const nameA = (a.evaluee_name || a.nama || '').toLowerCase();
        const nameB = (b.evaluee_name || b.nama || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });

    sortedEvaluations.forEach(ev => {
       const scores = ev.scores || {};
       
       // Use individual scores if available, fallback to combined
       const aspects = [
           scores.berorientasi_pelayanan || 0,
           scores.akuntabel || scores.akuntabel_loyal || 0,
           scores.kompeten || 0,
           scores.harmonis || scores.kolaboratif_harmonis || 0,
           scores.loyal || scores.akuntabel_loyal || 0,
           scores.adaptif || 0,
           scores.kolaboratif || scores.kolaboratif_harmonis || 0,
           scores.kepemimpinan || 0
       ];

      // Format NIP to force string in Excel (using ="value" syntax)
      const nip = ev.evaluee_nip || ev.nip;
      const formattedNip = nip ? `="${nip}"` : '';

      // Use NPK Periodik for Predikat calculation
      const periodik = ev.npk_calculation?.npkPeriodik ?? ev.nilai_nkp;
      const predikatInfo = evaluationService.calculateOverallRating(periodik, [], scaleType);

      const rowData = [
        formattedNip,
        ev.evaluee_name || ev.nama,
        predikatInfo.rating,
        periodik || 0,
        ...aspects
      ];

      const rowString = rowData.map(cell => {
        const cellStr = cell === null || cell === undefined ? '' : String(cell);
        const cleanStr = cellStr.replace(/[\n\r]+/g, ' ').replace(/;/g, ',');
        return `"${cleanStr.replace(/"/g, '""')}"`;
      }).join(';');

      csvRows.push(rowString);
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Evaluasi_Saya_Tool_${scaleType === 120 ? '1' : '2'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [myEvaluationsHistory]);



  // Calculate Pending Assessments
  const pendingCount = React.useMemo(() => {
    // Count employees who have NO completed evaluations in history
    return allEmployees.filter(emp => {
      const completed = myEvaluationsHistory.some(ev => String(ev.evaluee_id) === String(emp.id) && ev.is_completed);
      return !completed;
    }).length;
  }, [allEmployees, myEvaluationsHistory]);

  // ✅ FORCE MANDATORY ENTRY: Check pending on load
  useEffect(() => {
    if (!loading && pendingCount > 0 && !hasCheckedPending) {
      const key = user && user.id ? `pendingNoticeShown_${user.id}` : null;
      let alreadyShown = false;
      if (key) {
        try {
          alreadyShown = sessionStorage.getItem(key) === 'true';
        } catch (_) {}
      }
      if (!alreadyShown) {
        setShowPendingModal(true);
        if (activeTab !== 'all-employees') {
          setActiveTab('all-employees');
        }
        if (key) {
          try {
            sessionStorage.setItem(key, 'true');
          } catch (_) {}
        }
        setHasCheckedPending(true);
      }
    }
  }, [loading, pendingCount, hasCheckedPending, activeTab, user]);

  const tabs = [
    { 
      id: 'all-employees', 
      label: 'Semua Karyawan', 
      icon: '👥',
      badge: pendingCount > 0 ? pendingCount : null 
    },
    { id: 'my-history', label: 'Histori Penilaian Saya', icon: '📋' },
  ];

  const currentEvaluatorInfo = user || { id: 'evaluator_001', nip: '198001012005011001', name: 'Evaluator Test', role: 'evaluator' };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg text-slate-700">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-lg text-red-800">{error}</p>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-50 pb-20">
        
        {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                <Icon name="UserCheck" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Dashboard Evaluator</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Kelola penilaian kinerja pegawai</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               {/* User Profile - Compact */}
               <div className="hidden md:flex items-center text-right mr-2">
                  <div className="mr-3">
                    <p className="text-sm font-bold text-slate-900">{currentEvaluatorInfo.name}</p>
                    <p className="text-xs text-slate-500">{currentEvaluatorInfo.nip}</p>
                  </div>
                  <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                    <span className="text-xs font-bold text-slate-600">{currentEvaluatorInfo.name?.charAt(0)}</span>
                  </div>
               </div>
               
               <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
              >
                <Icon name="LogOut" size={18} />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">


          {activeTab === 'all-employees' && !isComparisonMode && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Daftar Pegawai</h2>
                  <p className="text-sm text-slate-500">Pilih pegawai untuk mulai melakukan penilaian</p>
                </div>
                <div className="w-full sm:w-72">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Icon name="Search" size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Cari Nama, NIP, atau Jabatan..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); // Reset page on search
                      }}
                    />
                  </div>
                </div>
              </div>

              {allEmployees.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600">Tidak ada data pegawai.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allEmployees
                    .filter(emp => {
                      const q = searchQuery.toLowerCase();
                      return (
                        (emp.name || emp.nama || '').toLowerCase().includes(q) ||
                        (emp.nip || '').includes(q) ||
                        (emp.position || emp.jabatan || '').toLowerCase().includes(q)
                      );
                    })
                    .sort((a, b) => (a.name || a.nama || '').localeCompare(b.name || b.nama || ''))
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map(employee => {
                      // OPTIMIZED LOOKUP: O(1) complexity using Hash Map
                      const employeeEvals = [
                        ...(evaluationsMap[String(employee.id)] || []),
                        ...(evaluationsMap[employee.nip] || [])
                      ];
                      
                      const uniqueEvals = Array.from(new Set(employeeEvals));

                      const findBestEvaluation = (evals, scale) => {
                        const filtered = evals.filter(e => Number(e.scale) === scale);
                        if (filtered.length === 0) return null;
                        return filtered.sort((a, b) => {
                          if (a.is_completed !== b.is_completed) return b.is_completed ? 1 : -1;
                          return new Date(b.updated_at || b.submitted_at) - new Date(a.updated_at || a.submitted_at);
                        })[0];
                      };

                      const evalTool2 = findBestEvaluation(uniqueEvals, 100);
                      const evalTool1 = findBestEvaluation(uniqueEvals, 120);

                      return (
                        <div key={employee.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4 mb-6">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg border border-slate-200 shrink-0">
                              {(employee.name || employee.nama || '?').charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                  {employee.nip || '-'}
                                </span>
                                <h3 className="font-bold text-slate-900 text-lg">
                                  {employee.name || employee.nama || 'Nama Tidak Tersedia'}
                                </h3>
                              </div>
                              <p className="text-slate-600 text-sm mt-0.5">
                                {employee.position || employee.jabatan || '-'}
                              </p>
                              <div className="mt-1 text-xs text-slate-400">
                                {employee.email || '-'}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Mulai & Selesai */}
                          <div className="flex gap-3">
                            <Button
                              variant="primary"
                              size="md"
                              onClick={() => {
                                setSelectedEmployeeForComparison(employee);
                                setIsComparisonMode(true);
                              }}
                            >
                              ▶️ Mulai
                            </Button>
                            <Button
                              variant="outline"
                              size="md"
                              disabled
                            >
                              Selesai
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  
                  {/* Pagination Controls */}
                   <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between rounded-lg">
                      <div className="text-sm text-slate-500">
                        Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-medium">{Math.min(currentPage * itemsPerPage, allEmployees.filter(emp => {
                          const q = searchQuery.toLowerCase();
                          return (
                            (emp.name || emp.nama || '').toLowerCase().includes(q) ||
                            (emp.nip || '').includes(q) ||
                            (emp.position || emp.jabatan || '').toLowerCase().includes(q)
                          );
                        }).length)}</span> data
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                          Sebelumnya
                        </button>
                        <button
                          onClick={() => {
                             const total = allEmployees.filter(emp => {
                                const q = searchQuery.toLowerCase();
                                return (
                                  (emp.name || emp.nama || '').toLowerCase().includes(q) ||
                                  (emp.nip || '').includes(q) ||
                                  (emp.position || emp.jabatan || '').toLowerCase().includes(q)
                                );
                              }).length;
                             setCurrentPage(p => Math.min(Math.ceil(total / itemsPerPage), p + 1));
                          }}
                          disabled={currentPage >= Math.ceil(allEmployees.filter(emp => {
                            const q = searchQuery.toLowerCase();
                            return (
                              (emp.name || emp.nama || '').toLowerCase().includes(q) ||
                              (emp.nip || '').includes(q) ||
                              (emp.position || emp.jabatan || '').toLowerCase().includes(q)
                            );
                          }).length / itemsPerPage)}
                          className="px-3 py-1 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                          Selanjutnya
                        </button>
                      </div>
                    </div>
                </div>
              )}
            </div>
          )}

          {/* COMPARISON MODE: Side-by-side Tool 1 & Tool 2 - Mirroring Behavioral Assessment UI */}
          {activeTab === 'all-employees' && isComparisonMode && selectedEmployeeForComparison && (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-12">
              {/* Header */}
              <div className="sticky top-0 z-20 bg-white/10 backdrop-blur-xl border-b border-white/20 px-6 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">Perbandingan Penilaian</h1>
                    <p className="text-white/70 mt-1">
                      {selectedEmployeeForComparison.name || selectedEmployeeForComparison.nama} • NIP: {selectedEmployeeForComparison.nip || '-'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsComparisonMode(false);
                      setSelectedEmployeeForComparison(null);
                      setExpandedIndicators({});
                    }}
                    iconName="X"
                  >
                    Selesai
                  </Button>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Side-by-Side Tool Comparison - Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tool 1 Section */}
                <div className="space-y-6">
                  {(() => {
                    const evalTool1 = myEvaluationsHistory
                      .filter(e => String(e.evaluee_id) === String(selectedEmployeeForComparison.id) && Number(e.scale) === 120)
                      .sort((a, b) => (b.is_completed ? 1 : -1))
                      .sort((a, b) => new Date(b.updated_at || b.submitted_at) - new Date(a.updated_at || a.submitted_at))[0];

                    if (!evalTool1) {
                      return (
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-12 text-center">
                          <Icon name="FileText" size={60} className="mx-auto mb-4 text-white/30" />
                          <p className="text-white/70 text-lg mb-4">Belum ada penilaian untuk Tool 1</p>
                          <Button
                            variant="primary"
                            onClick={() => handleStartAssessment(selectedEmployeeForComparison.id, 120)}
                          >
                            Mulai Penilaian Tool 1 (0-120)
                          </Button>
                        </div>
                      );
                    }

                    const calc1 = evalTool1.npk_calculation;
                    const periodik1 = calc1?.npkPeriodik ?? evalTool1.nilai_nkp ?? 0;
                    const aspects1 = calc1?.aspectDetails || [];

                    return (
                      <>
                        {/* Score Card */}
                        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl border border-purple-400/30 p-8 text-white">
                          <div className="flex items-end justify-between mb-4">
                            <div>
                              <p className="text-purple-200 text-sm font-semibold">TOOL 1 - NPK Periodik</p>
                              <div className="text-5xl font-bold mt-2">{Number(periodik1).toFixed(1)}</div>
                            </div>
                            <div className="text-right">
                              <p className="text-purple-200 text-sm">Skala</p>
                              <p className="text-3xl font-bold">/ 120</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-purple-200">
                            <Icon name="CheckCircle" size={20} />
                            <span>{evalTool1.is_completed ? 'Penilaian Selesai' : 'Penilaian Belum Selesai'}</span>
                          </div>
                        </div>

                        {/* Bobot Info */}
                        {calc1?.bobot && (
                          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                            <h3 className="text-white font-bold mb-4">Pembobotan Penilai</h3>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-white/5 rounded-lg p-4 text-center">
                                <p className="text-white/60 text-sm mb-2">Atasan (A)</p>
                                <p className="text-white text-2xl font-bold">{calc1.bobot.A ?? 0}%</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-4 text-center">
                                <p className="text-white/60 text-sm mb-2">Rekan (P)</p>
                                <p className="text-white text-2xl font-bold">{calc1.bobot.P ?? 0}%</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-4 text-center">
                                <p className="text-white/60 text-sm mb-2">Bawahan (B)</p>
                                <p className="text-white text-2xl font-bold">{calc1.bobot.B ?? 0}%</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Aspects Grid - Like Behavioral Assessment */}
                        {aspects1.length > 0 && (
                          <>
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                              <h3 className="text-white font-bold text-lg mb-4">6 Aspek Penilaian</h3>
                              <div className="grid grid-cols-2 gap-3">
                                {aspects1.map((aspect, idx) => {
                                  const aspectKey = (aspect.coreValue || aspect.name || '').toLowerCase().replace(/\s+/g, '_').replace(/&/g, '_').replace(/_+/g, '_');
                                  const isExpanded = expandedIndicators[`tool1_aspect_${idx}`];
                                  
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => setExpandedIndicators(prev => ({
                                        ...prev,
                                        [`tool1_aspect_${idx}`]: !prev[`tool1_aspect_${idx}`]
                                      }))}
                                      className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-purple-400/50 rounded-xl p-4 text-left transition-all duration-300 group"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-sm group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                                          {idx + 1}
                                        </div>
                                        <div className="text-right">
                                          <p className="text-white font-bold text-lg">{Number(aspect.indeksCapaian || 0).toFixed(1)}</p>
                                        </div>
                                      </div>
                                      <p className="text-white/80 text-sm font-medium leading-tight capitalize">
                                        {(aspect.name || aspect.coreValue || '').replace(/_/g, ' ')}
                                      </p>
                                      {isExpanded && (
                                        <Icon name="ChevronUp" size={16} className="text-purple-400 mt-2" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Expanded Indicators */}
                            <div className="space-y-3">
                              {aspects1.map((aspect, idx) => {
                                const aspectKey = (aspect.coreValue || aspect.name || '').toLowerCase().replace(/\s+/g, '_').replace(/&/g, '_').replace(/_+/g, '_');
                                const indicators = BEHAVIOR_INDICATORS[aspectKey] || [];
                                const isExpanded = expandedIndicators[`tool1_aspect_${idx}`];

                                if (!isExpanded) return null;

                                return (
                                  <div key={`exp_${idx}`} className="bg-gradient-to-r from-purple-600/30 to-purple-500/20 border border-purple-400/50 rounded-2xl p-6 backdrop-blur-xl">
                                    <div className="flex items-start justify-between mb-4">
                                      <div>
                                        <h4 className="text-white font-bold text-lg capitalize">
                                          {(aspect.name || aspect.coreValue || '').replace(/_/g, ' ')}
                                        </h4>
                                        <p className="text-purple-200 text-sm mt-1">Skor: {Number(aspect.indeksCapaian || 0).toFixed(2)} / 120</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-purple-200 text-xs mb-1">7 Indikator</p>
                                        <p className="text-white font-bold text-2xl">{Number(aspect.indeksCapaian || 0).toFixed(1)}</p>
                                      </div>
                                    </div>

                                    {indicators.length > 0 && (
                                      <div className="space-y-2 mt-4">
                                        {indicators.map((indicator, indIdx) => (
                                          <div key={indIdx} className="bg-white/10 rounded-lg p-3 flex gap-3">
                                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-white">
                                              {indIdx + 1}
                                            </div>
                                            <p className="text-white/80 text-sm leading-relaxed">{indicator}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {/* Action Button */}
                        <Button
                          variant="primary"
                          className="w-full py-3 text-lg"
                          onClick={() => handleStartAssessment(selectedEmployeeForComparison.id, 120)}
                        >
                          {evalTool1?.is_completed ? '👁️ Lihat Detail' : '✏️ Mulai Penilaian'}
                        </Button>
                      </>
                    );
                  })()}
                </div>

                {/* Tool 2 Section */}
                <div className="space-y-6">
                  {(() => {
                    const evalTool2 = myEvaluationsHistory
                      .filter(e => String(e.evaluee_id) === String(selectedEmployeeForComparison.id) && Number(e.scale) === 100)
                      .sort((a, b) => (b.is_completed ? 1 : -1))
                      .sort((a, b) => new Date(b.updated_at || b.submitted_at) - new Date(a.updated_at || a.submitted_at))[0];

                    if (!evalTool2) {
                      return (
                        <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-12 text-center">
                          <Icon name="FileText" size={60} className="mx-auto mb-4 text-white/30" />
                          <p className="text-white/70 text-lg mb-4">Belum ada penilaian untuk Tool 2</p>
                          <Button
                            variant="primary"
                            onClick={() => handleStartAssessment(selectedEmployeeForComparison.id, 100)}
                          >
                            Mulai Penilaian Tool 2 (0-100)
                          </Button>
                        </div>
                      );
                    }

                    const calc2 = evalTool2.npk_calculation;
                    const periodik2 = calc2?.npkPeriodik ?? evalTool2.nilai_nkp ?? 0;
                    const aspects2 = calc2?.aspectDetails || [];

                    return (
                      <>
                        {/* Score Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl border border-blue-400/30 p-8 text-white">
                          <div className="flex items-end justify-between mb-4">
                            <div>
                              <p className="text-blue-200 text-sm font-semibold">TOOL 2 - NPK Periodik</p>
                              <div className="text-5xl font-bold mt-2">{Number(periodik2).toFixed(1)}</div>
                            </div>
                            <div className="text-right">
                              <p className="text-blue-200 text-sm">Skala</p>
                              <p className="text-3xl font-bold">/ 100</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-blue-200">
                            <Icon name="CheckCircle" size={20} />
                            <span>{evalTool2.is_completed ? 'Penilaian Selesai' : 'Penilaian Belum Selesai'}</span>
                          </div>
                        </div>

                        {/* Bobot Info */}
                        {calc2?.bobot && (
                          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                            <h3 className="text-white font-bold mb-4">Pembobotan Penilai</h3>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-white/5 rounded-lg p-4 text-center">
                                <p className="text-white/60 text-sm mb-2">Atasan (A)</p>
                                <p className="text-white text-2xl font-bold">{calc2.bobot.A ?? 0}%</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-4 text-center">
                                <p className="text-white/60 text-sm mb-2">Rekan (P)</p>
                                <p className="text-white text-2xl font-bold">{calc2.bobot.P ?? 0}%</p>
                              </div>
                              <div className="bg-white/5 rounded-lg p-4 text-center">
                                <p className="text-white/60 text-sm mb-2">Bawahan (B)</p>
                                <p className="text-white text-2xl font-bold">{calc2.bobot.B ?? 0}%</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Aspects Grid - Like Behavioral Assessment */}
                        {aspects2.length > 0 && (
                          <>
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                              <h3 className="text-white font-bold text-lg mb-4">6 Aspek Penilaian</h3>
                              <div className="grid grid-cols-2 gap-3">
                                {aspects2.map((aspect, idx) => {
                                  const aspectKey = (aspect.coreValue || aspect.name || '').toLowerCase().replace(/\s+/g, '_').replace(/&/g, '_').replace(/_+/g, '_');
                                  const isExpanded = expandedIndicators[`tool2_aspect_${idx}`];
                                  
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => setExpandedIndicators(prev => ({
                                        ...prev,
                                        [`tool2_aspect_${idx}`]: !prev[`tool2_aspect_${idx}`]
                                      }))}
                                      className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-blue-400/50 rounded-xl p-4 text-left transition-all duration-300 group"
                                    >
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all">
                                          {idx + 1}
                                        </div>
                                        <div className="text-right">
                                          <p className="text-white font-bold text-lg">{Number(aspect.indeksCapaian || 0).toFixed(1)}</p>
                                        </div>
                                      </div>
                                      <p className="text-white/80 text-sm font-medium leading-tight capitalize">
                                        {(aspect.name || aspect.coreValue || '').replace(/_/g, ' ')}
                                      </p>
                                      {isExpanded && (
                                        <Icon name="ChevronUp" size={16} className="text-blue-400 mt-2" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Expanded Indicators */}
                            <div className="space-y-3">
                              {aspects2.map((aspect, idx) => {
                                const aspectKey = (aspect.coreValue || aspect.name || '').toLowerCase().replace(/\s+/g, '_').replace(/&/g, '_').replace(/_+/g, '_');
                                const indicators = BEHAVIOR_INDICATORS[aspectKey] || [];
                                const isExpanded = expandedIndicators[`tool2_aspect_${idx}`];

                                if (!isExpanded) return null;

                                return (
                                  <div key={`exp_${idx}`} className="bg-gradient-to-r from-blue-600/30 to-blue-500/20 border border-blue-400/50 rounded-2xl p-6 backdrop-blur-xl">
                                    <div className="flex items-start justify-between mb-4">
                                      <div>
                                        <h4 className="text-white font-bold text-lg capitalize">
                                          {(aspect.name || aspect.coreValue || '').replace(/_/g, ' ')}
                                        </h4>
                                        <p className="text-blue-200 text-sm mt-1">Skor: {Number(aspect.indeksCapaian || 0).toFixed(2)} / 100</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-blue-200 text-xs mb-1">7 Indikator</p>
                                        <p className="text-white font-bold text-2xl">{Number(aspect.indeksCapaian || 0).toFixed(1)}</p>
                                      </div>
                                    </div>

                                    {indicators.length > 0 && (
                                      <div className="space-y-2 mt-4">
                                        {indicators.map((indicator, indIdx) => (
                                          <div key={indIdx} className="bg-white/10 rounded-lg p-3 flex gap-3">
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-white">
                                              {indIdx + 1}
                                            </div>
                                            <p className="text-white/80 text-sm leading-relaxed">{indicator}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {/* Action Button */}
                        <Button
                          variant="primary"
                          className="w-full py-3 text-lg"
                          onClick={() => handleStartAssessment(selectedEmployeeForComparison.id, 100)}
                        >
                          {evalTool2?.is_completed ? '👁️ Lihat Detail' : '✏️ Mulai Penilaian'}
                        </Button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
            </div>
          )}

          {activeTab === 'my-history' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Histori Penilaian Saya</h2>
                  <p className="text-slate-600">Daftar penilaian yang telah Anda submit.</p>
                </div>
                <div className="flex gap-2">
                   {/* PDF Export Buttons */}
                   <Button 
                      variant="outline" 
                      onClick={() => handleExportPDF(120)}
                      className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
                   >
                      <Icon name="FileText" size={16} />
                      PDF Tool 1
                   </Button>
                   <Button 
                      variant="outline" 
                      onClick={() => handleExportPDF(100)}
                      className="flex items-center gap-2 border-red-200 text-red-700 hover:bg-red-50"
                   >
                      <Icon name="FileText" size={16} />
                      PDF Tool 2
                   </Button>

                   {/* Excel Export Buttons */}
                   <Button 
                      variant="outline" 
                      onClick={() => handleExport(120)}
                      className="flex items-center gap-2"
                   >
                      <Icon name="Download" size={16} />
                      Excel Tool 1
                   </Button>
                   <Button 
                      variant="outline" 
                      onClick={() => handleExport(100)}
                      className="flex items-center gap-2"
                   >
                      <Icon name="Download" size={16} />
                      Excel Tool 2
                   </Button>
                </div>
              </div>

              {myEvaluationsHistory.filter(e => e.is_completed).length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="FileText" size={48} color="var(--color-slate-400)" className="mx-auto mb-4" />
                  <p className="text-slate-600">Anda belum memiliki histori penilaian.</p>
                  <p className="text-slate-500 text-sm mt-2">
                    Mulai nilai karyawan dari tab "Semua Karyawan" untuk melihat histori di sini.
                  </p>
                </div>
              ) : (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 p-8">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="text-left py-4 px-3 font-semibold text-slate-700">NIP Evaluee</th>
                          <th className="text-left py-4 px-3 font-semibold text-slate-700">Nama Evaluee</th>
                          <th className="text-left py-4 px-3 font-semibold text-slate-700">Jenis Tool</th>
                          <th className="text-left py-4 px-3 font-semibold text-slate-700">NPK Periodik</th>
                          <th className="text-left py-4 px-3 font-semibold text-slate-700">Predikat</th>
                          <th className="text-left py-4 px-3 font-semibold text-slate-700">Tanggal Submit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myEvaluationsHistory
                          .filter(e => e.is_completed)
                          .sort((a, b) => {
                            // 1. Sort by Date Only (YYYY-MM-DD) Descending
                            const dateA = new Date(a.submitted_at || 0);
                            const dateB = new Date(b.submitted_at || 0);
                            
                            // Reset time to midnight for date comparison
                            const dayA = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate()).getTime();
                            const dayB = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate()).getTime();
                            
                            if (dayB !== dayA) return dayB - dayA;

                            // 2. Sort by Name Ascending (Group by Person)
                            const nameA = (a.evaluee_name || '').toLowerCase();
                            const nameB = (b.evaluee_name || '').toLowerCase();
                            if (nameA < nameB) return -1;
                            if (nameA > nameB) return 1;
                            
                            // 3. Sort by Scale Descending (Tool 1 [120] > Tool 2 [100])
                            const scaleA = Number(a.scale) || 0;
                            const scaleB = Number(b.scale) || 0;
                            return scaleB - scaleA;
                          })
                          .map((evaluation, index) => {
                            // Calculate Predikat based on NPK Periodik
                            const periodik = evaluation.npk_calculation?.npkPeriodik ?? evaluation.nilai_nkp;
                            const predikatInfo = evaluationService.calculateOverallRating(periodik, [], evaluation.scale);

                            return (
                              <tr key={evaluation.id || index} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="py-4 px-3 text-slate-900 font-mono text-sm">{evaluation.evaluee_nip || 'N/A'}</td>
                                <td className="py-4 px-3 text-slate-900 font-medium">{evaluation.evaluee_name || 'N/A'}</td>
                                <td className="py-4 px-3">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    String(evaluation.scale) === '120' 
                                      ? 'bg-purple-100 text-purple-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {String(evaluation.scale) === '120' ? 'Tool 1' : 'Tool 2'}
                                  </span>
                                </td>
                                <td className="py-4 px-3 text-center text-slate-900 font-bold">
                                  <button 
                                    onClick={() => handleViewDetail(evaluation)}
                                    className="hover:text-blue-600 hover:underline focus:outline-none transition-colors"
                                    title="Klik untuk melihat detail per aspek"
                                  >
                                    {Number(evaluation.npk_calculation?.npkPeriodik || 0).toFixed(1)}
                                  </button>
                                </td>
                                <td className="py-4 px-3 text-center">
                                  <div
                                    className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 inline-flex items-center gap-1 transition-all shadow-sm ${predikatInfo.color}`}
                                    onClick={() => {
                                      const periodikLocal = Number(evaluation.npk_calculation?.npkPeriodik ?? evaluation.nilai_nkp ?? 0);
                                      const scale = Number(evaluation.scale);
                                      const breakdown = evaluation.npk_calculation?.aspectDetails?.[0]?.breakdown;
                                      const weights = breakdown?.weights || {};
                                      const wSup = Number(weights.supervisor ?? 0);
                                      const wPeers = Number(weights.peers ?? 0);
                                      const wSub = Number(weights.bawahan ?? weights.subordinate ?? 0);
                                      let cond = 'balanced';
                                      if (wSup === 0 && wPeers === 0 && wSub === 100) cond = 'noSupervisorPeers';
                                      else if (wSup === 100 && wPeers === 0 && wSub === 0) cond = 'supervisorOnly';
                                      else if (wSup === 0 && wPeers === 100 && wSub === 0) cond = 'peersOnly';
                                      let minReq = '≥ 0';
                                      if (scale === 120) {
                                        if (periodikLocal > 115) minReq = 'Teladan (≥ 4 perilaku kunci)';
                                        else if (periodikLocal > 105) minReq = '≥ 4';
                                        else if (periodikLocal > 100) minReq = '≥ 3';
                                        else if (periodikLocal >= 95) minReq = '≥ 2';
                                        else if (periodikLocal >= 90) minReq = '≥ 1';
                                        else minReq = '≥ 0';
                                      } else {
                                        if (periodikLocal >= 98) minReq = '≥ 7';
                                        else if (periodikLocal >= 96) minReq = '≥ 6';
                                        else if (periodikLocal >= 94) minReq = '≥ 5';
                                        else if (periodikLocal >= 92) minReq = '≥ 4';
                                        else if (periodikLocal >= 90) minReq = '≥ 3';
                                        else minReq = '≥ 2';
                                      }
                                      const aspects = evaluation.npk_calculation?.aspectDetails || [];
                                      const topNames = aspects
                                        .slice()
                                        .sort((a, b) => Number(b.indeksCapaian || 0) - Number(a.indeksCapaian || 0))
                                        .slice(0, 2)
                                        .map(d => d.name)
                                        .filter(n => n);
                                      const scaleLabel = scale === 120 ? 'Tool 1 (Skala 120)' : 'Tool 2 (Skala 100)';

                                      const contribText = topNames.length ? topNames.join(', ') : '-';
                                      const summary = `Predikat ${predikatInfo.rating} karena NPK Periodik ${periodikLocal.toFixed(2)} berada pada rentang ${scaleLabel}. Kebutuhan minimal perilaku kunci: ${minReq}. Aspek berkontribusi terbesar: ${contribText}.`;
                                      setPredikatModalData({
                                        rating: predikatInfo.rating,
                                        description: predikatInfo.description,
                                        scale: evaluation.scale,
                                        npk: periodikLocal,
                                        summary,
                                        minReq,
                                        weights: { supervisor: wSup, peers: wPeers, subordinate: wSub },
                                        topAspects: topNames,
                                        explanation: evaluationService.generatePredikatExplanation(periodikLocal, evaluation.scale, evaluation.npk_calculation),
                                        evaluation: evaluation
                                      });
                                      setShowPredikatModal(true);
                                    }}
                                    title="Klik untuk melihat panduan predikat & analisis"
                                  >
                                    {predikatInfo.rating}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                </td>
                                <td className="py-4 px-3 text-slate-600 text-sm">
                                  {evaluation.submitted_at ? new Date(evaluation.submitted_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  
                  {(() => {
                    const completed = myEvaluationsHistory.filter(e => e.is_completed);
                    const commentItems = [];
                    completed.forEach(ev => {
                      const comments = ev.comments || {};
                      const scaleNum = Number(ev.scale);
                      Object.entries(comments).forEach(([key, val]) => {
                        const text = (val || '').trim();
                        if (!text) return;
                        let aspectKey = String(key).split('_')[0];
                        if (String(key).startsWith('berorientasi_pelayanan')) aspectKey = 'berorientasi_pelayanan';
                        commentItems.push({
                          date: ev.submitted_at ? new Date(ev.submitted_at).getTime() : 0,
                          evaluee_nip: ev.evaluee_nip || '-',
                          evaluee_name: ev.evaluee_name || '-',
                          scale: scaleNum,
                          aspectKey,
                          comment: text
                        });
                      });
                    });
                    
                    if (commentItems.length === 0) return null;
                    
                    const sorted = commentItems.sort((a, b) => b.date - a.date).slice(0, 50);
                    
                    return (
                      <div className="mt-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-3">Histori Komentar Evaluator</h3>
                        <div className="space-y-2">
                          {sorted.map((item, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-sm font-medium text-slate-900">
                                  {item.evaluee_name} • {item.evaluee_nip}
                                </div>
                                <div className="text-xs">
                                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                                    item.scale === 120 ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {item.scale === 120 ? 'Tool 1' : 'Tool 2'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs text-slate-600 mb-1">
                                Aspek: {evaluationService.getCoreValueName(item.aspectKey, item.scale)}
                              </div>
                              <div className="text-sm text-slate-800 italic">"{item.comment}"</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar aplikasi?"
        confirmText="Keluar"
        variant="danger"
      />

      {showPredikatModal && predikatModalData && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowPredikatModal(false)}></div>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col transform transition-all mx-auto mt-10 border border-slate-200">
            <div className="bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Detail Penilaian Perilaku</h3>
                <p className="text-sm text-slate-500">Periode {predikatModalData.evaluation?.evaluation_period} • Skala {predikatModalData.scale}</p>
              </div>
              <button
                onClick={() => setShowPredikatModal(false)}
                className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6 flex-1 overflow-y-auto pb-24">
              {(() => {
                const breakdown = predikatModalData.evaluation?.npk_calculation?.aspectDetails?.[0]?.breakdown || {};
                const totalAtasan = breakdown.totalAtasan !== undefined ? breakdown.totalAtasan : breakdown.countAtasan;
                const totalPeers = breakdown.totalPeers !== undefined ? breakdown.totalPeers : breakdown.countPeers;
                const totalBawahan = breakdown.totalBawahan !== undefined ? breakdown.totalBawahan : breakdown.countBawahan;
                const counts = {
                  supervisor: { completed: breakdown.countAtasan || 0, total: totalAtasan || 0 },
                  peers: { completed: breakdown.countPeers || 0, total: totalPeers || 0 },
                  subordinate: { completed: breakdown.countBawahan || 0, total: totalBawahan || 0 }
                };
                const getParticipationColor = (completed, total) => {
                  if (!total || completed === 0) return 'bg-slate-50 border-slate-200';
                  const ratio = completed / total;
                  if (ratio >= 0.75) return 'bg-green-50 border-green-200';
                  if (ratio >= 0.5) return 'bg-yellow-50 border-yellow-200';
                  return 'bg-red-50 border-red-200';
                };
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                        Informasi Evaluasi
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-500">Evaluee</span>
                          <span className="font-semibold text-slate-900">{predikatModalData.evaluation?.evaluee_name}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-500">NIP</span>
                          <span className="font-mono font-medium text-slate-700">{predikatModalData.evaluation?.evaluee_nip}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-500">Jabatan</span>
                          <span className="font-medium text-slate-900 text-right">{predikatModalData.evaluation?.evaluee_position}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-slate-500">Status</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${predikatModalData.evaluation?.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {predikatModalData.evaluation?.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-6 bg-purple-600 rounded-full"></span>
                          Hasil Penilaian
                        </h4>
                        <div className="flex items-end justify-between mb-2">
                          <span className="text-sm text-slate-500">NPK Periodik</span>
                          <span className="text-3xl font-bold text-slate-900">{Number(predikatModalData.npk).toFixed(2)}</span>
                        </div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${evaluationService.calculateOverallRating(predikatModalData.npk, [], predikatModalData.scale).color}`}>
                          Predikat: {predikatModalData.rating}
                        </div>
                        {predikatModalData.summary && (
                          <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                            {predikatModalData.summary}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Partisipasi Penilai</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className={`p-2 rounded-lg border shadow-sm ${getParticipationColor(counts.supervisor.completed, counts.supervisor.total)}`}>
                            <div className="text-xs opacity-80">Atasan</div>
                            <div className="font-bold">
                              {counts.supervisor.completed}
                              {counts.supervisor.total > 0 && <span className="text-xs opacity-70">/{counts.supervisor.total}</span>}
                            </div>
                          </div>
                          <div className={`p-2 rounded-lg border shadow-sm ${getParticipationColor(counts.peers.completed, counts.peers.total)}`}>
                            <div className="text-xs opacity-80">Rekan</div>
                            <div className="font-bold">
                              {counts.peers.completed}
                              {counts.peers.total > 0 && <span className="text-xs opacity-70">/{counts.peers.total}</span>}
                            </div>
                          </div>
                          <div className={`p-2 rounded-lg border shadow-sm ${getParticipationColor(counts.subordinate.completed, counts.subordinate.total)}`}>
                            <div className="text-xs opacity-80">Bawahan</div>
                            <div className="font-bold">
                              {counts.subordinate.completed}
                              {counts.subordinate.total > 0 && <span className="text-xs opacity-70">/{counts.subordinate.total}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="border-t border-slate-200 pt-3 text-slate-700 text-sm leading-relaxed">
                <div className="mb-2 font-semibold text-slate-800">Deskripsi Per Aspek</div>
                {(predikatModalData.evaluation?.npk_calculation?.aspectDetails || [])
                  .filter(detail => detail.name)
                  .map((detail, idx) => {
                  const aspectInfo = evaluationService.calculateAspectRating(detail.indeksCapaian, Number(predikatModalData.scale));
                  const s = Number(detail.indeksCapaian || 0);
                  const sc = Number(predikatModalData.scale);
                  let desc = '';
                  if (sc === 120) {
                    if (s > 115) desc = 'Menerapkan minimal 4 perilaku kunci dan mampu menjadi teladan yang memberi pengaruh positif kepada para pegawai';
                    else if (s > 105) desc = 'Menerapkan minimal 4 perilaku kunci';
                    else if (s > 100) desc = 'Menerapkan minimal 3 perilaku kunci';
                    else if (s >= 95) desc = 'Menerapkan minimal 2 perilaku kunci';
                    else if (s >= 90) desc = 'Menerapkan minimal 1 perilaku kunci';
                    else if (s >= 70) desc = 'Tidak ada perilaku kunci yang diterapkan';
                    else desc = 'Terdapat hukuman disiplin';
                  } else {
                    if (s >= 98) desc = 'Menerapkan minimal 7 perilaku kunci dan mendapatkan penghargaan (Penghargaan mengacu pada KMK 325/2022)';
                    else if (s >= 96) desc = 'Menerapkan minimal 6 perilaku kunci';
                    else if (s >= 94) desc = 'Menerapkan minimal 5 perilaku kunci';
                    else if (s >= 92) desc = 'Menerapkan minimal 4 perilaku kunci';
                    else if (s >= 90) desc = 'Menerapkan minimal 3 perilaku kunci';
                    else if (s >= 70) desc = 'Menerapkan minimal 2 perilaku kunci';
                    else desc = 'Dijatuhi hukuman disiplin';
                  }
                  return (
                    <div key={idx} className="p-3 rounded-lg border bg-white mb-2">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-slate-700">{detail.name}</span>
                        <div className="text-right">
                          <div className="text-base font-bold text-slate-900">{Number(detail.indeksCapaian || 0).toFixed(2)}</div>
                          <div className={`text-xs ${aspectInfo.color} px-2 py-0.5 rounded-full font-bold mt-1`}>{aspectInfo.rating}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-600 italic">"{desc}"</div>
                    </div>
                  );
                })}
              </div>

              {predikatModalData.evaluation?.comments && Object.keys(predikatModalData.evaluation.comments).length > 0 && (
                <div className="border-t border-slate-200 pt-3 text-slate-700 text-sm leading-relaxed">
                  <div className="mb-2 font-semibold text-slate-800">Komentar Evaluator (Per Aspek)</div>
                  {(() => {
                    const comments = predikatModalData.evaluation.comments || {};
                    const grouped = Object.entries(comments).reduce((acc, [key, comment]) => {
                      if (!comment) return acc;
                      let aspectKey = String(key).split('_')[0];
                      if (String(key).startsWith('berorientasi_pelayanan')) aspectKey = 'berorientasi_pelayanan';
                      
                      // Removed merged logic
                      (acc[aspectKey] = acc[aspectKey] || []).push(comment);
                      return acc;
                    }, {});
                    const scaleNum = Number(predikatModalData.scale);
                    return (
                      <div className="space-y-2">
                        {Object.entries(grouped).map(([aspectKey, list], idx) => (
                          <div key={idx} className="p-3 rounded-lg border bg-blue-50">
                            <div className="text-xs font-semibold text-blue-900 mb-1">{evaluationService.getCoreValueName(aspectKey, scaleNum)}</div>
                            <div className="text-blue-800 text-sm">
                              {list.map((c, i) => (
                                <div key={i} className="italic">"{c}"</div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-slate-200 flex justify-end sticky bottom-0 bg-white">
              <button
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm"
                onClick={() => setShowPredikatModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Detail Modal */}
      {isDetailModalOpen && selectedEvaluationDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={closeDetailModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                      Detail Nilai Per Aspek
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500 mb-4">
                        Evaluasi untuk <strong>{selectedEvaluationDetail.evaluee_name}</strong> (Scale {selectedEvaluationDetail.scale})
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-slate-500">Filter pembobotan:</span>
                          <select
                            value={weightFilter}
                            onChange={(e) => setWeightFilter(e.target.value)}
                            className="text-xs border border-slate-300 rounded px-2 py-1"
                          >
                            <option value="all">Semua</option>
                            <option value="supervisor">Atasan</option>
                            <option value="peers">Peers</option>
                            <option value="subordinates">Bawahan</option>
                          </select>
                        </div>
                        {selectedEvaluationDetail.npk_calculation?.aspectDetails
                          ?.filter(aspect => {
                            if (weightFilter === 'supervisor') return (aspect.breakdown?.countAtasan || 0) > 0;
                            if (weightFilter === 'peers') return (aspect.breakdown?.countPeers || 0) > 0;
                            if (weightFilter === 'subordinates') return (aspect.breakdown?.countBawahan || 0) > 0;
                            return true;
                          })
                          .map((aspect, idx) => {
                            const ratingInfo = evaluationService.calculateAspectRating(aspect.indeksCapaian, selectedEvaluationDetail.scale);
                            return (
                              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-slate-700">{aspect.name}</span>
                                  <div className="text-right">
                                    <div className="text-base font-bold text-slate-900">{Number(aspect.indeksCapaian || 0).toFixed(2)}</div>
                                    <div className={`text-xs ${ratingInfo.color}`}>{ratingInfo.rating}</div>
                                  </div>
                                </div>
                                <div className="mt-2 text-[11px] text-slate-500">
                                  <div>
                                    A/P/B: {Number(aspect.breakdown?.npkAtasan || 0).toFixed(2)} / {Number(aspect.breakdown?.npkPeers || 0).toFixed(2)} / {Number(aspect.breakdown?.npkBawahan || 0).toFixed(2)}
                                  </div>
                                  <div className="mt-1">
                                    Atasan ({Number(aspect.breakdown?.weights?.supervisor || 0)}%) • Peers ({Number(aspect.breakdown?.weights?.peers || aspect.breakdown?.weights?.peer || 0)}%) • Bawahan ({Number(aspect.breakdown?.weights?.subordinates || aspect.breakdown?.weights?.subordinate || 0)}%)
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        
                        {(!selectedEvaluationDetail.npk_calculation?.aspectDetails || selectedEvaluationDetail.npk_calculation?.aspectDetails.length === 0) && (
                           <p className="text-center text-slate-500 italic">Tidak ada detail aspek tersedia.</p>
                        )}

                        {selectedEvaluationDetail.npk_calculation?.aspectDetails && selectedEvaluationDetail.npk_calculation?.aspectDetails.length > 0 && (
                          <div className="mt-4 border-t border-slate-200 pt-4">
                            {(() => {
                              const bd = selectedEvaluationDetail.npk_calculation.aspectDetails[0].breakdown || {};
                              const counts = {
                                supervisor: { completed: bd.countAtasan || 0, total: (bd.totalAtasan !== undefined ? bd.totalAtasan : bd.countAtasan) || 0 },
                                peers: { completed: bd.countPeers || 0, total: (bd.totalPeers !== undefined ? bd.totalPeers : bd.countPeers) || 0 },
                                subordinate: { completed: bd.countBawahan || 0, total: (bd.totalBawahan !== undefined ? bd.totalBawahan : bd.countBawahan) || 0 }
                              };
                              const w = selectedEvaluationDetail.npk_calculation.weights || {};
                              const wSup = Number(w.supervisor || 0);
                              const wPeers = Number(w.peers || w.peer || 0);
                              const wSub = Number(w.subordinates || w.subordinate || 0);
                              return (
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Partisipasi Penilai</p>
                                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                                    <div className="p-2 rounded-lg border bg-white">
                                      <div className="text-xs opacity-80">Atasan</div>
                                      <div className="font-bold">
                                        {counts.supervisor.completed}
                                        {counts.supervisor.total > 0 && <span className="text-xs opacity-70">/{counts.supervisor.total}</span>}
                                      </div>
                                    </div>
                                    <div className="p-2 rounded-lg border bg-white">
                                      <div className="text-xs opacity-80">Rekan</div>
                                      <div className="font-bold">
                                        {counts.peers.completed}
                                        {counts.peers.total > 0 && <span className="text-xs opacity-70">/{counts.peers.total}</span>}
                                      </div>
                                    </div>
                                    <div className="p-2 rounded-lg border bg-white">
                                      <div className="text-xs opacity-80">Bawahan</div>
                                      <div className="font-bold">
                                        {counts.subordinate.completed}
                                        {counts.subordinate.total > 0 && <span className="text-xs opacity-70">/{counts.subordinate.total}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xs text-slate-600">
                                    Pembobotan: Atasan {wSup}% • Peers {wPeers}% • Bawahan {wSub}%
                                  </p>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Comments Section */}
                        {selectedEvaluationDetail.comments && Object.keys(selectedEvaluationDetail.comments).length > 0 && (
                          <div className="mt-6 border-t border-slate-200 pt-4">
                            <h4 className="text-sm font-bold text-slate-800 mb-3">Komentar Evaluator (Per Aspek)</h4>
                            {(() => {
                              const comments = selectedEvaluationDetail.comments || {};
                              const grouped = Object.entries(comments).reduce((acc, [key, val]) => {
                                if (!val) return acc;
                                let aspectKey = String(key).split('_')[0];
                                if (String(key).startsWith('berorientasi_pelayanan')) aspectKey = 'berorientasi_pelayanan';

                                // Removed merged logic
                                (acc[aspectKey] = acc[aspectKey] || []).push(val);
                                return acc;
                              }, {});
                              
                              const scaleNum = Number(selectedEvaluationDetail.scale);
                              return (
                                <div className="space-y-3">
                                  {Object.entries(grouped).map(([aspectKey, list]) => (
                                    <div key={aspectKey} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                      <div className="text-xs font-semibold text-slate-900 mb-1">{evaluationService.getCoreValueName(aspectKey, scaleNum)}</div>
                                      <div className="space-y-1">
                                        {list.map((c, i) => (
                                          <div key={i} className="text-sm text-slate-800 italic">"{c}"</div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeDetailModal}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ⚠️ MANDATORY PENDING ASSESSMENT MODAL */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Icon name="AlertCircle" size={24} className="text-amber-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Tindakan Diperlukan
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Halo <strong>{currentEvaluatorInfo.name}</strong>,
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Anda memiliki <strong className="text-amber-600">{pendingCount} penilaian yang belum diselesaikan</strong>.
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Sesuai prosedur, setiap evaluator <strong>wajib</strong> memberikan penilaian kepada seluruh karyawan yang ditugaskan (Subordinate/Peer/Supervisor).
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Mohon segera lengkapi penilaian Anda agar proses rekapitulasi nilai tidak terhambat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowPendingModal(false)}
                >
                  Selesaikan Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluatorDashboard;
