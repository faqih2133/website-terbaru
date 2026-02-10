import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  usersAPI, 
  assessmentsAPI, 
  npkAPI 
} from '../../lib/api';
import Button from '../../components/ui/Button';
import evaluationService from '../../services/evaluationService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import EditEmployeeModal from './components/components/EditEmployeeModal';
import AssignmentModal from './components/components/AssignmentModal';
import ComparisonModal from './components/components/ComparisonModal';
import ScaleComparisonModal from './components/components/ScaleComparisonModal';

// Helper: Get Rating Info (Predicate) - Duplicated from Service/Modal for direct use
const getRatingInfo = (score, scale) => {
  const s = Number(score);
  const sc = Number(scale);
  if (s === null || s === undefined) return { level: '-', color: 'bg-slate-100 text-slate-600' };

  if (sc === 120) {
    if (s > 115) return { level: 'Di Atas Ekspektasi', color: 'bg-green-100 text-green-700' };
    if (s > 105) return { level: 'Di Atas Ekspektasi', color: 'bg-blue-100 text-blue-700' };
    if (s > 100) return { level: 'Di Atas Ekspektasi', color: 'bg-cyan-100 text-cyan-700' };
    if (s >= 95) return { level: 'Sesuai Ekspektasi', color: 'bg-yellow-100 text-yellow-700' };
    if (s >= 90) return { level: 'Sesuai Ekspektasi', color: 'bg-orange-100 text-orange-700' };
    if (s >= 70) return { level: 'Di Bawah Ekspektasi', color: 'bg-red-100 text-red-700' };
    return { level: 'Di Bawah Ekspektasi', color: 'bg-purple-100 text-purple-700' };
  } else {
    if (s >= 98) return { level: 'Di Atas Ekspektasi', color: 'bg-green-100 text-green-700' };
    if (s >= 96) return { level: 'Di Atas Ekspektasi', color: 'bg-blue-100 text-blue-700' };
    if (s >= 94) return { level: 'Di Atas Ekspektasi', color: 'bg-cyan-100 text-cyan-700' };
    if (s >= 92) return { level: 'Sesuai Ekspektasi', color: 'bg-yellow-100 text-yellow-700' };
    if (s >= 90) return { level: 'Sesuai Ekspektasi', color: 'bg-orange-100 text-orange-700' };
    if (s >= 70) return { level: 'Di Bawah Ekspektasi', color: 'bg-red-100 text-red-700' };
    return { level: 'Di Bawah Ekspektasi', color: 'bg-purple-100 text-purple-700' };
  }
};

const getPredicateDescription = (score, scale) => {
  const s = Number(score);
  const sc = Number(scale);
  
  if (sc === 120) {
    if (s > 115) return "Menerapkan minimal 4 perilaku kunci dan mampu menjadi teladan yang memberi pengaruh positif kepada para pegawai";
    if (s > 105) return "Menerapkan minimal 4 perilaku kunci";
    if (s > 100) return "Menerapkan minimal 3 perilaku kunci";
    if (s >= 95) return "Menerapkan minimal 2 perilaku kunci";
    if (s >= 90) return "Menerapkan minimal 1 perilaku kunci";
    if (s >= 70) return "Tidak ada perilaku kunci yang diterapkan";
    return "Terdapat hukuman disiplin";
  } else {
    if (s >= 98) return "Menerapkan minimal 7 perilaku kunci dan mendapatkan penghargaan (Penghargaan mengacu pada KMK 325/2022)";
    if (s >= 96) return "Menerapkan minimal 6 perilaku kunci";
    if (s >= 94) return "Menerapkan minimal 5 perilaku kunci";
    if (s >= 92) return "Menerapkan minimal 4 perilaku kunci";
    if (s >= 90) return "Menerapkan minimal 3 perilaku kunci";
    if (s >= 70) return "Menerapkan minimal 2 perilaku kunci";
    return "Dijatuhi hukuman disiplin";
  }
};

const PredicateGuidelineModal = ({ isOpen, onClose, contextEvaluation = null }) => {
  if (!isOpen) return null;

  const aspectDetails = (contextEvaluation?.npk_calculation?.aspectDetails || [])
    .filter(aspect => {
      const key = (aspect.coreValue || aspect.name || '').toLowerCase();
      return key !== 'memimpin';
    });

  
};

const ProgressDetailModal = ({ isOpen, onClose, evaluator, allEmployees, allEvaluations, assignmentsMap }) => {
  if (!isOpen || !evaluator) return null;

  const assignedEvalueeIds = assignmentsMap[evaluator.id] || [];
  
  // Get details for each assigned evaluee
  const assignmentDetails = assignedEvalueeIds.map(evalueeId => {
    // Robust find with String conversion
    const evaluee = allEmployees.find(e => String(e.id) === String(evalueeId));
    
    // Check if this evaluator has rated this evaluee
    const isRated = allEvaluations.some(ev => 
      (String(ev.evaluee_id) === String(evalueeId) || (evaluee?.nip && ev.evaluee_nip === evaluee.nip)) && 
      ev.evaluators?.some(eva => 
        (String(eva.id) === String(evaluator.id) || (evaluator?.nip && eva.nip === evaluator.nip)) && 
        (eva.has_rated || (eva.scores && Object.keys(eva.scores).length > 0))
      )
    );
    
    return {
      id: evalueeId,
      name: evaluee?.nama || 'Unknown',
      nip: evaluee?.nip || '-',
      isRated
    };
  });

  const totalAssigned = assignmentDetails.length;
  const totalCompleted = assignmentDetails.filter(a => a.isRated).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Detail Status Penugasan</h3>
            <p className="text-sm text-slate-600 mt-1">
              Evaluator: <span className="font-semibold">{evaluator.nama || evaluator.name || '-'}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {totalAssigned > 0 ? `${totalCompleted}/${totalAssigned} Selesai` : 'Belum ada penugasan'}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-3 py-1.5 bg-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-200"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NIP</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Evaluee</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Penilaian</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {assignmentDetails.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-600 text-sm">Tidak ada evaluee yang ditugaskan.</td>
                </tr>
              ) : (
                assignmentDetails.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900 font-mono">{item.nip}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">{item.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isRated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.isRated ? '✅ Selesai' : '⏳ Berjalan'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('weighting');
  const [allEvaluations, setAllEvaluations] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showScaleComparison, setShowScaleComparison] = useState(false);
  const [scaleComparisonData, setScaleComparisonData] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  
  // Filter States
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedEvaluatorStatus, setSelectedEvaluatorStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPredicateGuideline, setShowPredicateGuideline] = useState(false);
  const [selectedGuidelineContext, setSelectedGuidelineContext] = useState(null);

  // Assignment Modal States
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedEvaluator, setSelectedEvaluator] = useState(null);
  const [assignmentUpdateTrigger, setAssignmentUpdateTrigger] = useState(0);

  // Progress Detail Modal States
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedEvaluatorForProgress, setSelectedEvaluatorForProgress] = useState(null);

  // Memoized Departments
  const departments = React.useMemo(() => {
    const depts = new Set(allEmployees.map(e => e.department).filter(Boolean));
    return ['All', ...Array.from(depts).sort()];
  }, [allEmployees]);
  
  // Filter Pembobotan
  const [weightDepartment, setWeightDepartment] = useState('All');
  const [weightSearch, setWeightSearch] = useState('');

  // Assignments Map State (Backend Synced)
  const [assignmentsMap, setAssignmentsMap] = useState({});

  // ✅ REDIRECT KE LOGIN JIKA TIDAK TERAUTENTIKASI
  useEffect(() => {
    if (!user && !isAuthenticated) {
      console.log('🔄 Redirecting to login - user not authenticated');
      navigate('/');
    }
  }, [user, isAuthenticated, navigate]);

  // Load data dari API (Backend)
  const loadData = useCallback(async () => {
    console.log('🔍 Loading data from Backend API...');
    setIsDataLoaded(false);
    
    try {
      // 1. Load Employees (Users)
      console.log('📡 Fetching users...');
      const usersResponse = await usersAPI.getAll();
      if (usersResponse.success) {
        console.log(`✅ Loaded ${usersResponse.count} employees from API`);
        // Debug log to inspect data structure
        console.log('📦 Users Data Payload:', usersResponse.data);
        setAllEmployees(usersResponse.data || []);
      } else {
        console.warn('⚠️ Failed to load users:', usersResponse.message);
        setAllEmployees([]);
      }

      // 2. Load Evaluations (Assessments)
      console.log('📡 Fetching assessments...');
      const assessmentsResponse = await assessmentsAPI.getAll();
      if (assessmentsResponse.success) {
        console.log(`✅ Loaded ${assessmentsResponse.count} assessments from API`);
        setAllEvaluations(assessmentsResponse.data || []);
      } else {
        console.warn('⚠️ Failed to load assessments:', assessmentsResponse.message);
        setAllEvaluations([]);
      }

      // 3. Load Assignments (New - Backend First)
      console.log('📡 Fetching assignments matrix...');
      try {
        // We try to fetch all assignments. If endpoint doesn't exist, we might get 404.
        // If so, we catch and fallback.
        const assignmentsResponse = await npkAPI.getAllAssignments();
        
        if (assignmentsResponse.success && Array.isArray(assignmentsResponse.data)) {
           console.log(`✅ Loaded assignments from Backend`);
           const map = {};
           
           // Backend likely returns list of { evaluator_id, evaluee_id }
           assignmentsResponse.data.forEach(item => {
             const evId = String(item.evaluator_id || item.evaluatorId);
             const eeId = String(item.evaluee_id || item.evalueeId);
             
             if (evId && eeId) {
               if (!map[evId]) map[evId] = [];
               if (!map[evId].includes(eeId)) {
                 map[evId].push(eeId);
               }
             }
           });
           setAssignmentsMap(map);
        } else {
           // Fallback to local storage if API success but empty/invalid (or just empty list)
           console.warn("Backend assignments empty or invalid format");
           throw new Error("Backend assignments empty or invalid format");
        }
      } catch (assignError) {
         console.warn('⚠️ Failed to load assignments from backend, falling back to localStorage:', assignError);
         const localAssignments = evaluationService.getAllAssignments();
         const map = {};
         if (Array.isArray(localAssignments)) {
            localAssignments.forEach(a => {
              if (a.evaluatorId) map[a.evaluatorId] = a.evalueeIds || [];
            });
         }
         setAssignmentsMap(map);
      }

    } catch (error) {
      console.error('💥 Error loading data from API:', error);
      alert('❌ Gagal memuat data dari server. Pastikan backend berjalan.');
      // Fallback or empty state
      setAllEmployees([]);
      setAllEvaluations([]);
    } finally {
      setIsDataLoaded(true);
      console.log('✅ Data loading complete.');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);



  // ✅ Helper: Filter Evaluations by Scale
  const getFilteredEvaluations = useCallback((scaleFilter) => {
    console.log(`🔍 Filtering evaluations for scale: ${scaleFilter} (type: ${typeof scaleFilter})`);
    console.log('🔍 All evaluations:', allEvaluations.length);
    
    const filtered = allEvaluations.filter(evaluation => {
      const evaluationScale = typeof evaluation.scale === 'string' ? parseInt(evaluation.scale) : evaluation.scale;
      const filterScale = typeof scaleFilter === 'string' ? parseInt(scaleFilter) : scaleFilter;
      const matchesScale = evaluationScale === filterScale;
      
      console.log(`🔍 Evaluation ${evaluation.id}: scale=${evaluation.scale} (${typeof evaluation.scale}) -> ${evaluationScale}, filter=${filterScale}, matches=${matchesScale}, status=${evaluation.status}`);
      
      return matchesScale;
    });
    
    console.log(`🔍 Filtered results for scale ${scaleFilter}:`, filtered.length, 'items');
    return filtered;
  }, [allEvaluations]);

  const getAverageNPK = useCallback((scale) => {
    const items = getFilteredEvaluations(scale);
    if (!items || items.length === 0) return 0;
    const sum = items.reduce((acc, ev) => acc + (ev.npk_calculation?.npkPeriodik ?? ev.nilai_nkp ?? 0), 0);
    return sum / items.length;
  }, [getFilteredEvaluations]);

  // Filter employees berdasarkan role, department, dan status
  const getFilteredEmployees = useCallback((roleFilter) => {
    return allEmployees.filter(employee => {
      // 1. Role Filter
      if (roleFilter !== 'all' && employee.role !== roleFilter) return false;

      // 2. Department Filter
      if (selectedDepartment !== 'All' && employee.department !== selectedDepartment) return false;

      // 3. Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = employee.nama && employee.nama.toLowerCase().includes(query);
        const matchesNIP = employee.nip && employee.nip.includes(query);
        if (!matchesName && !matchesNIP) return false;
      }

      // 4. Evaluator Status Filter (Only for Evaluators)
      if (roleFilter === 'evaluator' && selectedEvaluatorStatus !== 'All') {
        const assignments = assignmentsMap[employee.id] || [];
        const assignmentCount = assignments.length;
        
        // Count completed evaluations for this evaluator
        const completedCount = assignments.filter(evalueeId => {
          const evaluee = allEmployees.find(e => e.id === evalueeId);
          return allEvaluations.some(ev => 
            (String(ev.evaluee_id) === String(evalueeId) || (evaluee?.nip && ev.evaluee_nip === evaluee.nip)) && 
            ev.evaluators?.some(evaluator => 
              (String(evaluator.id) === String(employee.id) || (employee?.nip && evaluator.nip === employee.nip)) && 
              evaluator.has_rated
            )
          );
        }).length;

        if (selectedEvaluatorStatus === 'unassigned') {
          return assignmentCount === 0;
        } else if (selectedEvaluatorStatus === 'not_started') {
          return assignmentCount > 0 && completedCount === 0;
        } else if (selectedEvaluatorStatus === 'in_progress') {
          return assignmentCount > 0 && completedCount > 0 && completedCount < assignmentCount;
        } else if (selectedEvaluatorStatus === 'completed') {
          return assignmentCount > 0 && completedCount === assignmentCount;
        }
      }

      return true;
    });
  }, [allEmployees, selectedDepartment, searchQuery, selectedEvaluatorStatus, assignmentsMap, allEvaluations]);

  // Handle comparison modal
  const handleShowComparison = useCallback((evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowComparison(true);
  }, []);



  // Get evaluator status helper
  /*
  const getEvaluatorStatus = useCallback((employee) => {
    const assignedIds = assignmentsMap[employee.id] || [];
    const totalAssigned = assignedIds.length;
    
    if (totalAssigned === 0) return 'unassigned';
    
    const completedCount = assignedIds.filter(eid => {
      const evaluee = allEmployees.find(e => e.id === eid);
      return allEvaluations.some(ev => 
        (String(ev.evaluee_id) === String(eid) || (evaluee?.nip && ev.evaluee_nip === evaluee.nip)) && 
        ev.evaluators?.some(evaluator => 
          (String(evaluator.id) === String(employee.id) || (employee?.nip && evaluator.nip === employee.nip)) && 
          evaluator.has_rated
        )
      );
    }).length;

    if (completedCount === totalAssigned) return 'completed';
    if (completedCount > 0) return 'in_progress';
    return 'not_started';
  }, [assignmentsMap, allEvaluations, allEmployees]);
  */

  // Handle scale comparison
  const handleShowScaleComparison = useCallback(() => {
    const scale100Evals = getFilteredEvaluations(100);
    const scale120Evals = getFilteredEvaluations(120);
    
    const avgNPK100 = scale100Evals.length > 0 
      ? scale100Evals.reduce((sum, ev) => sum + (ev.nilai_nkp || 0), 0) / scale100Evals.length 
      : 0;
    
    const avgNPK120 = scale120Evals.length > 0 
      ? scale120Evals.reduce((sum, ev) => sum + (ev.nilai_nkp || 0), 0) / scale120Evals.length 
      : 0;
    
    setScaleComparisonData({
      scale100: { count: scale100Evals.length, avgNPK: avgNPK100 },
      scale120: { count: scale120Evals.length, avgNPK: avgNPK120 }
    });
    setShowScaleComparison(true);
  }, [getFilteredEvaluations]);

  // Handle edit employee
  const handleEditClick = useCallback((employee) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
  }, []);

  // Handle delete employee
  const handleDeleteClick = useCallback((employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  }, []);

  // Confirm delete employee
  const confirmDeleteEmployee = useCallback(async () => {
    if (employeeToDelete) {
      try {
        await usersAPI.delete(employeeToDelete.id);
        await loadData(); // Reload from API
        setShowDeleteModal(false);
        setEmployeeToDelete(null);
        alert('✅ Karyawan berhasil dihapus');
      } catch (error) {
        console.error('Failed to delete employee:', error);
        alert('❌ Gagal menghapus karyawan');
      }
    }
  }, [employeeToDelete, loadData]);

  // Handle save employee
  const handleSaveEmployee = useCallback(async (employeeData) => {
    try {
      console.log('📝 Saving employee:', employeeData);

      // ✅ Validasi Email: Wajib diisi dan mengandung '@'
      if (!employeeData.email || !employeeData.email.includes('@')) {
        alert('❌ Format Email Salah: Email wajib diisi dan harus mengandung karakter "@" (contoh: nama@kemenkeu.go.id)');
        return;
      }

      // 1. Prepare payload matching Backend API expectations
      const payload = {
        ...employeeData,
        employee_id: employeeData.nip, // Map NIP to employee_id (required by backend)
        birth_date: employeeData.birthDate || null // Map birthDate to birth_date (backend expectation)
      };

      // 2. Generate password for NEW and EXISTING users (Enforce Rule: NIP + DD)
      // User Request: "maka ketika sudah di buat atau di update username dan passwordnya masuk seperi username nip dan password nip +dd"
      if (employeeData.birthDate && employeeData.nip) {
         // Format: YYYY-MM-DD (Direct string manipulation to avoid timezone issues)
         const parts = employeeData.birthDate.split('-');
         // parts[0] = YYYY, parts[1] = MM, parts[2] = DD
         if (parts.length === 3) {
           const day = parts[2]; // e.g. "17" or "05"
           payload.password = `${employeeData.nip}${day}`;
           console.log('🔑 Generated password (NIP+DD):', payload.password);
         } else if ((!editingEmployee || !editingEmployee.id) && !payload.password) {
           payload.password = 'password123';
         }
      } else if ((!editingEmployee || !editingEmployee.id) && !payload.password) {
         payload.password = 'password123';
      }

      console.log('💾 Saving employee payload:', payload);

      if (editingEmployee && editingEmployee.id) {
        // Edit existing
        await usersAPI.updateProfile(editingEmployee.id, payload);
        alert('✅ Data karyawan berhasil diperbarui\nPassword otomatis di-update menjadi: NIP + Tanggal (DD)');
      } else {
        // Add new
        await usersAPI.create(payload);
        alert(`✅ Karyawan baru berhasil ditambahkan\nPassword default: NIP + Tanggal (DD)`);
      }
      
      await loadData(); // Reload from API
      setShowEditModal(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Failed to save employee:', error);
      
      // Extract specific validation message if available
      let errorMessage = error.message;
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          // Validation errors from express-validator
          errorMessage = error.response.data.errors.map(e => e.msg).join(', ');
        } else if (error.response.data.message) {
          // Generic backend error (e.g., "User already exists")
          errorMessage = error.response.data.message;
        }
      } else if (error.message && error.message.includes('400')) {
         // Fallback for 400 without response data (rare with current API)
         errorMessage = 'Data tidak lengkap atau format salah (Cek NIP, Email, Password)';
      }

      alert('❌ Gagal menyimpan data karyawan: ' + errorMessage);
    }
  }, [editingEmployee, loadData]);

  // Handle assignment click
  const handleAssignmentClick = useCallback((evaluator) => {
    setSelectedEvaluator(evaluator);
    setShowAssignmentModal(true);
  }, []);

  // Handle save assignment
  const handleSaveAssignment = useCallback(async (evaluatorId, selectedIds) => {
    try {
      console.log('💾 Saving assignments to backend:', { evaluatorId, selectedIds });
      
      // Ensure payload format matches backend expectations exactly
      const payload = {
        evaluator_id: evaluatorId,
        evaluee_ids: selectedIds
      };
      
      const response = await npkAPI.saveAssignment(payload);
      
      if (response.success) {
        alert('✅ Penugasan berhasil disimpan ke server!');
        
        // Also update localStorage as fallback/cache if needed
        evaluationService.saveAssignment(evaluatorId, selectedIds);
        
        setAssignmentUpdateTrigger(prev => prev + 1); // Trigger map refresh
        loadData(); // Reload to refresh assignments map
        setShowAssignmentModal(false);
        setSelectedEvaluator(null);
      } else {
        alert('❌ Gagal menyimpan penugasan: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to save assignments:', error);
      alert('❌ Terjadi kesalahan saat menyimpan penugasan ke server.');
    }
  }, [loadData]);

  // Handle progress click
  const handleProgressClick = useCallback((evaluator) => {
    setSelectedEvaluatorForProgress(evaluator);
    setShowProgressModal(true);
  }, []);

  // Handle add employee
  const handleAddEmployee = useCallback(() => {
    // Pre-select role based on active tab
    // Backend requires 'user' role (not 'evaluee')
    const defaultRole = activeTab === 'evaluees' ? 'user' : 'evaluator';
    setEditingEmployee({ role: defaultRole });
    setShowEditModal(true);
  }, [activeTab]);

  // ✅ HANDLE LOGOUT DENGAN REDIRECT
  const handleLogout = useCallback(() => {
    if (window.confirm('Apakah Anda yakin ingin keluar aplikasi?')) {
      console.log('🚪 Logging out and redirecting to login...');
      logout();
      navigate('/');
    }
  }, [logout, navigate]);

  // ✅ EXPORT PDF FUNCTION (Matches User Request Format)
  const handleExportPDF = useCallback((scaleFilter = null) => {
    const scaleLabel = scaleFilter ? (scaleFilter === 120 ? 'Tool 1 (120)' : 'Tool 2 (100)') : 'Semua Data';
    console.log(`📄 Exporting PDF (${scaleLabel})...`);

    let evaluationsToExport = allEvaluations;
    if (scaleFilter) {
      evaluationsToExport = allEvaluations.filter(ev => Number(ev.scale) === Number(scaleFilter));
    }

    if (evaluationsToExport.length === 0) {
      alert(`Tidak ada data evaluasi ${scaleLabel} untuk diekspor PDF!`);
      return;
    }

    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more columns

    // Header
    doc.setFontSize(18);
    doc.text(`Laporan Evaluasi Kinerja - ${scaleLabel}`, 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Dicetak Oleh: Admin (${user?.name || '-'})`, 14, 30);
    doc.text(`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`, 14, 36);

    // Prepare Headers & Data
    let head = [];
    if (!scaleFilter || scaleFilter === 120) {
      head = [['No', 'NIP', 'Nama', 'Predikat', 'NPK', 'Berorientasi', 'Akuntabel & Loyal', 'Kompeten', 'Kolaboratif & Harmonis', 'Adaptif', 'Kepemimpinan']];
    } else {
      head = [['No', 'NIP', 'Nama', 'Predikat', 'NPK', 'Berorientasi', 'Kompeten', 'Kolaboratif & Harmonis', 'Adaptif', 'Akuntabel & Loyal', 'Kepemimpinan']];
    }

    const tableData = evaluationsToExport.map((ev, index) => {
       const periodik = ev.npk_calculation?.npkPeriodik ?? ev.nilai_nkp ?? 0;
       const predikatInfo = getRatingInfo(periodik, ev.scale);
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

       const keysOrdered120 = [
         'berorientasi_pelayanan',
         'akuntabel_loyal',
         'kompeten',
         'kolaboratif_harmonis',
         'adaptif',
         'kepemimpinan'
       ];
       const keysOrdered100 = [
         'berorientasi_pelayanan',
         'kompeten',
         'kolaboratif_harmonis',
         'adaptif',
         'akuntabel_loyal',
         'kepemimpinan'
       ];
       const orderedKeys = Number(ev.scale) === 120 ? keysOrdered120 : keysOrdered100;
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
         predikatInfo.level,
         Number(periodik).toFixed(2),
         ...aspects.map(s => Number(s).toFixed(2))
       ];
    });

    // Generate Table
    doc.autoTable({
      startY: 45,
      head: head,
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], fontSize: 8, halign: 'center' },
      styles: { fontSize: 8, cellPadding: 2, halign: 'center' },
      columnStyles: {
        2: { halign: 'left' }
      }
    });

    doc.save(`Laporan_Evaluasi_${scaleFilter || 'All'}_${new Date().toISOString().split('T')[0]}.pdf`);
  }, [allEvaluations, user]);

  // ✅ EXPORT EXCEL BERDASARKAN FILTER PEMBOBOTAN
  const handleExportFiltered = useCallback((scaleFilter, evaluationsSubset) => {
    const scaleLabel = scaleFilter === 120 ? 'Tool 1' : 'Tool 2';
    console.log(`📊 Exporting filtered evaluation data (${scaleLabel}) to Excel...`);
    
    const evaluationsToExport = (evaluationsSubset || []).filter(ev => Number(ev.scale) === Number(scaleFilter));
    if (evaluationsToExport.length === 0) {
      alert(`Tidak ada data evaluasi ${scaleLabel} sesuai filter!`);
      return;
    }
    
    let headers = [];
    if (scaleFilter === 120) {
      headers = [
        'NIP',
        'Nama',
        'Predikat',
        'NPK Periodik',
        'Berorientasi Pelayanan',
        'Akuntabel & Loyal',
        'Kompeten',
        'Kolaboratif & Harmonis',
        'Adaptif',
        'Kepemimpinan'
      ];
    } else {
      headers = [
        'NIP',
        'Nama',
        'Predikat',
        'NPK Periodik',
        'Berorientasi Pelayanan',
        'Kompeten',
        'Kolaboratif & Harmonis',
        'Adaptif',
        'Akuntabel & Loyal',
        'Kepemimpinan'
      ];
    }
    const csvRows = [headers.join(';')];
    
    evaluationsToExport.forEach(ev => {
      const periodik = ev.npk_calculation?.npkPeriodik ?? ev.nilai_nkp ?? 0;
      const predikatInfo = getRatingInfo(periodik, ev.scale);
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
      const orderedKeys = scaleFilter === 120
        ? ['berorientasi_pelayanan','akuntabel_loyal','kompeten','kolaboratif_harmonis','adaptif','kepemimpinan']
        : ['berorientasi_pelayanan','kompeten','kolaboratif_harmonis','adaptif','akuntabel_loyal','kepemimpinan'];
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
      
      const nip = ev.evaluee_nip || ev.nip;
      const formattedNip = nip ? `="${nip}"` : '';
      const rowData = [
        formattedNip,
        ev.evaluee_name || ev.nama || '-',
        predikatInfo.level,
        Number(periodik).toFixed(2),
        ...aspects.map(s => Number(s).toFixed(2))
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
    link.setAttribute('download', `evaluations_filtered_${scaleFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);
  // ✅ EXPORT EXCEL DENGAN KOLOM LENGKAP (Simplified to Match Request)
  const handleExport = useCallback((scaleFilter = null) => {
    const scaleLabel = scaleFilter ? (scaleFilter === 120 ? 'Tool 1' : 'Tool 2') : 'Semua Data';
    console.log(`📊 Exporting evaluation data (${scaleLabel}) to Excel...`);
    
    let evaluationsToExport = allEvaluations;
    if (scaleFilter) {
      evaluationsToExport = allEvaluations.filter(ev => Number(ev.scale) === Number(scaleFilter));
    }

    if (evaluationsToExport.length === 0) {
      alert(`Tidak ada data evaluasi ${scaleLabel} untuk diekspor!`);
      return;
    }
    
    // Define Headers based on Scale
    let headers = [];
    if (!scaleFilter || scaleFilter === 120) {
      headers = [
        'NIP',
        'Nama',
        'Predikat',
        'NPK Periodik',
        'Berorientasi Pelayanan',
        'Akuntabel & Loyal',
        'Kompeten',
        'Kolaboratif & Harmonis',
        'Adaptif',
        'Kepemimpinan'
      ];
    } else {
       headers = [
        'NIP',
        'Nama',
        'Predikat',
        'NPK Periodik',
        'Berorientasi Pelayanan',
        'Kompeten',
        'Kolaboratif & Harmonis',
        'Adaptif',
        'Akuntabel & Loyal',
        'Kepemimpinan'
      ];
    }

    // CSV Header Row
    const csvRows = [headers.join(';')];

    evaluationsToExport.forEach(ev => {
       const periodik = ev.npk_calculation?.npkPeriodik ?? ev.nilai_nkp ?? 0;
       const predikatInfo = getRatingInfo(periodik, ev.scale);
       
       // Build robust aspect values: prefer aspectDetails; fallback to combined keys in scores or averaged individual
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

       const keysOrdered120 = [
         'berorientasi_pelayanan',
         'akuntabel_loyal',
         'kompeten',
         'kolaboratif_harmonis',
         'adaptif',
         'kepemimpinan'
       ];
       const keysOrdered100 = [
         'berorientasi_pelayanan',
         'kompeten',
         'kolaboratif_harmonis',
         'adaptif',
         'akuntabel_loyal',
         'kepemimpinan'
       ];
       const orderedKeys = Number(ev.scale) === 120 ? keysOrdered120 : keysOrdered100;

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

       // Format NIP for Excel (Prevent Scientific Notation)
       const nip = ev.evaluee_nip || ev.nip;
       const formattedNip = nip ? `="${nip}"` : '';

       const rowData = [
         formattedNip,
         ev.evaluee_name || ev.nama || '-',
         predikatInfo.level,
         Number(periodik).toFixed(2),
         ...aspects.map(s => Number(s).toFixed(2))
       ];

       const rowString = rowData.map(cell => {
         const cellStr = cell === null || cell === undefined ? '' : String(cell);
         // Clean newlines and semicolons
         const cleanStr = cellStr.replace(/[\n\r]+/g, ' ').replace(/;/g, ',');
         return `"${cleanStr.replace(/"/g, '""')}"`;
       }).join(';');

       csvRows.push(rowString);
    });
    
    // Create and download file
    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `evaluations_${scaleFilter || 'complete'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    console.log('✅ Excel export completed successfully');
  }, [allEvaluations]);



  // Handle refresh
  const handleRefreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  // Handle debug (Generate Test Data)
  /*
  const handleDebugData = useCallback(async () => {
    if (!window.confirm('Apakah Anda yakin ingin generate data dummy ke DATABASE?')) return;
    
    try {
      console.log('🌱 Seeding database...');
      const response = await assessmentsAPI.seed();
      
      if (response.success) {
        alert(`✅ Berhasil generate ${response.count} data evaluasi!`);
        loadData(); // Reload from API
      } else {
        alert('❌ Gagal generate data: ' + response.message);
      }
    } catch (error) {
      console.error('Failed to seed data:', error);
      alert('❌ Terjadi kesalahan saat generate data');
    }
  }, [loadData]);
  */

  // Tab class
  const tabClass = useCallback((tabName) =>
    `px-4 py-2 text-sm font-medium rounded-md ${
      activeTab === tabName
        ? 'bg-blue-600 text-white'
        : 'text-slate-700 hover:bg-slate-100'
    }`, [activeTab]);

  const tabs = [
    { id: 'weighting', name: 'Pembobotan' },
    { id: 'all-employees', name: 'Semua Karyawan' },
    { id: 'evaluators', name: 'Kelola Evaluator' },
    { id: 'evaluees', name: 'Kelola Evaluee' },
  ];

  // Conditional return jika data belum dimuat
  if (!isDataLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-600">Selamat datang, {user?.name || 'Admin'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="secondary" onClick={handleRefreshData}>
                🔄 Refresh Data
              </Button>
              <Button variant="tertiary" onClick={handleLogout}>
                🚪 Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Karyawan</p>
                <p className="text-2xl font-bold text-slate-900">{allEmployees.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Evaluasi</p>
                <p className="text-2xl font-bold text-slate-900">{allEvaluations.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📏</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Tool 1</p>
                <p className="text-2xl font-bold text-slate-900">{getFilteredEvaluations(120).length}</p>
                <div className="mt-1">
                  <p className="text-xs text-slate-600">Rata-rata NPK</p>
                  <p className="text-sm font-bold text-slate-900">{getAverageNPK(120).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📏</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Tool 2</p>
                <p className="text-2xl font-bold text-slate-900">{getFilteredEvaluations(100).length}</p>
                <div className="mt-1">
                  <p className="text-xs text-slate-600">Rata-rata NPK</p>
                  <p className="text-sm font-bold text-slate-900">{getAverageNPK(100).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => handleExport(120)}>
              📥 Excel Tool 1
            </Button>
            <Button variant="outline" onClick={() => handleExportPDF(120)}>
              📄 PDF Tool 1
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => handleExport(100)}>
              📥 Excel Tool 2
            </Button>
            <Button variant="outline" onClick={() => handleExportPDF(100)}>
              📄 PDF Tool 2
            </Button>
          </div>

          <Button variant="secondary" onClick={handleShowScaleComparison}>
            📈 Chart Tool
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={tabClass(tab.id)}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Pembobotan Tab (Merged History) */}
          {activeTab === 'weighting' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Daftar Pembobotan Penilaian</h2>

              {/* Formula Explanation */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 space-y-4">
                {/* Formula 1: NPK Periodik (Sigma Notation) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Rumus NPK Periodik</h3>
                    <p className="text-sm text-slate-600">
                      Rata-rata dari Indeks Capaian NPK seluruh aspek (Core Values).
                    </p>
                  </div>
                  <div className="bg-white px-6 py-4 rounded-md border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="text-sm font-bold text-slate-700 mr-2">NPK Periodik =</div>
                    <div className="flex items-center">
                      <div className="flex flex-col items-center mr-2 relative top-1">
                        <span className="text-xs text-slate-600 leading-none">n</span>
                        <span className="text-3xl leading-none font-light text-slate-800">∑</span>
                        <span className="text-xs text-slate-600 leading-none">i=1</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-serif italic text-lg text-slate-800">Indeks Capaian NPK</span>
                        <sub className="text-sm text-slate-600 relative top-2 ml-1">i</sub>
                      </div>
                    </div>
                    <div className="text-xl text-slate-400 mx-2">/</div>
                    <div className="text-lg font-serif italic text-slate-800">n</div>
                  </div>
                </div>

                {/* Formula 2: Indeks Capaian NPK (Fraction Format) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Rumus Indeks Capaian NPK (per Aspek)</h3>
                    <p className="text-sm text-slate-600 max-w-lg">
                      Dihitung dari penjumlahan terbobot penilaian Atasan, Peers, dan Bawahan.
                    </p>
                  </div>
                  <div className="bg-white px-6 py-4 rounded-md border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="text-sm font-bold text-slate-700">Indeks =</div>
                    <div className="flex flex-col items-center">
                       <div className="border-b-2 border-slate-800 pb-1 text-center text-xs sm:text-sm font-medium text-slate-800 px-2">
                         (NPK<sub>Atasan</sub> × Bobot<sub>Atasan</sub>) + (NPK<sub>Peers</sub> × Bobot<sub>Peers</sub>) + (NPK<sub>Bawahan</sub> × Bobot<sub>Bawahan</sub>)
                       </div>
                       <div className="pt-1 text-xs font-bold text-slate-800 w-full text-center">
                         100%
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {(() => {
                // 1. Group by NIP to consolidate multiple evaluators
                const grouped = allEvaluations
                  .filter(ev => ev.status !== 'Draft') // Exclude drafts
                  .reduce((groups, ev) => {
                    const nip = ev.evaluee_nip;
                    if (!groups[nip]) groups[nip] = [];
                    groups[nip].push(ev);
                    return groups;
                  }, {});

                // 2. Process each group to calculate combined weighted score
                // Flatten results so Tool 1 and Tool 2 are SEPARATE rows
                const consolidatedEvaluations = Object.values(grouped).flatMap(group => {
                  // Separate by Scale (Tool 1 vs Tool 2)
                  const scale120 = group.filter(g => Number(g.scale) === 120);
                  const scale100 = group.filter(g => Number(g.scale) === 100);
                  
                  const processGroup = (subGroup, scale) => {
                      if (subGroup.length === 0) return null;
                      
                      // Use the first evaluation as the base for static info
                      // Prioritize 'Selesai' status for base info if available
                      const baseEval = subGroup.find(g => g.status === 'Selesai') || subGroup[0];
                      
                      // Helper: Derive role from evaluator/evaluee positions when role string is missing
                      const deriveRole = (evaluatorRole, evaluatorPos, evalueePos) => {
                        const r = String(evaluatorRole || '').toLowerCase();
                        const evalPos = String(evaluatorPos || '').toLowerCase();
                        const tgtPos = String(evalueePos || '').toLowerCase();
                        
                        const evalSupervised = (evalPos.includes('supervisi') && !evalPos.includes('tanpa supervisi')) 
                          || evalPos.includes('kepala') || evalPos.includes('manajer') || evalPos.includes('direktur')
                          || evalPos.includes('ketua') || evalPos.includes('koordinator');
                        const tgtSupervised = (tgtPos.includes('supervisi') && !tgtPos.includes('tanpa supervisi')) 
                          || tgtPos.includes('kepala') || tgtPos.includes('manajer') || tgtPos.includes('direktur')
                          || tgtPos.includes('ketua') || tgtPos.includes('koordinator');
                        
                        if (evalSupervised && !tgtSupervised) return 'supervisor';
                        if (!evalSupervised && tgtSupervised) return 'subordinate';
                        
                        if (r === 'admin' || r === 'supervisor' || r === 'atasan') return 'supervisor';
                        if (r === 'subordinate' || r === 'bawahan') return 'subordinate';
                        if (r === 'peer' || r === 'rekan' || r === 'sejawat') return 'peer';
                        return 'peer';
                      };
                      
                      // Collect all evaluators from the group
                      const combinedEvaluators = subGroup.flatMap(ev => {
                        if (ev.evaluators && ev.evaluators.length > 0) {
                          return ev.evaluators;
                        }
                        const role = deriveRole(ev.evaluator_role || ev.role, ev.evaluator_position, baseEval.evaluee_position);
                        return [{
                          role,
                          category: role,
                          scores: ev.scores || {},
                          id: ev.id,
                          name: ev.evaluator_name
                        }];
                      });

                      // Use NPK Calculation from Backend if available
                      let npkDetails = baseEval.npk_calculation;
                      
                      // If missing, calculate
                      if (!npkDetails || !npkDetails.aspectDetails) {
                          try {
                            const assessmentData = {
                                evaluators: combinedEvaluators,
                                scores: baseEval.scores || {},
                                is_supervisory: baseEval.is_supervisory !== undefined ? baseEval.is_supervisory : true
                            };
                            npkDetails = evaluationService.calculateNPKDetails(assessmentData, scale);
                            
                            // FORCE WEIGHTS if still missing after calculation
                            if (npkDetails && (!npkDetails.weights || (npkDetails.weights.supervisor === 0 && npkDetails.weights.peers === 0 && npkDetails.weights.subordinates === 0))) {
                               // Default weights based on role/scale if needed
                               const isSupervisory = baseEval.is_supervisory !== undefined ? baseEval.is_supervisory : true;
                               npkDetails.weights = isSupervisory 
                                 ? { supervisor: 60, peers: 15, subordinates: 25 }
                                 : { supervisor: 60, peers: 40, subordinates: 0 };
                            }
                          } catch (e) {
                            console.error("Error calculating NPK details", e);
                          }
                      }

                      const status = subGroup.some(e => e.status === 'Selesai') ? 'Selesai' : 'Dalam Proses';

                      // Ensure Unit (Department) is present using robust fallback
                      let ensuredDepartment = baseEval.evaluee_department;
                      if (!ensuredDepartment) {
                        const fromSubGroup = subGroup.find(g => g.evaluee_department);
                        ensuredDepartment = fromSubGroup?.evaluee_department;
                      }
                      if (!ensuredDepartment) {
                        const matchedEmployee = allEmployees.find(e => 
                          String(e.id) === String(baseEval.evaluee_id) || 
                          (e.nip && e.nip === baseEval.evaluee_nip) ||
                          ((e.nama || e.name) && (e.nama === baseEval.evaluee_name || e.name === baseEval.evaluee_name))
                        );
                        ensuredDepartment = matchedEmployee?.department;
                      }
                      if (!ensuredDepartment) {
                        try {
                          const localEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
                          const localMatch = localEmployees.find(le => 
                            String(le.id) === String(baseEval.evaluee_id) || 
                            (le.nip && le.nip === baseEval.evaluee_nip) ||
                            ((le.nama || le.name) && (le.nama === baseEval.evaluee_name || le.name === baseEval.evaluee_name))
                          );
                          ensuredDepartment = localMatch?.department;
                        } catch (_) {
                          // ignore
                        }
                      }
                      if (!ensuredDepartment) ensuredDepartment = '-';

                      return {
                        ...baseEval,
                        npk_calculation: npkDetails,
                        nilai_nkp: npkDetails?.npkPeriodik ?? baseEval.nilai_nkp,
                        status: status,
                        evaluator_count: combinedEvaluators.length,
                        evaluators: combinedEvaluators,
                        scale: scale, // Ensure scale is explicit
                        evaluee_department: ensuredDepartment
                      };
                  };

                  const results = [];
                  const res120 = processGroup(scale120, 120);
                  if (res120) results.push(res120);
                  
                  const res100 = processGroup(scale100, 100);
                  if (res100) results.push(res100);
                  
                  return results;
                });

                // Apply filters: Unit & Search
                const filteredEvals = consolidatedEvaluations.filter(ev => {
                  if (weightDepartment !== 'All' && ev.evaluee_department !== weightDepartment) return false;
                  if (weightSearch) {
                    const q = weightSearch.toLowerCase();
                    const nameMatch = (ev.evaluee_name || '').toLowerCase().includes(q);
                    const nipMatch = (ev.evaluee_nip || '').includes(q);
                    if (!nameMatch && !nipMatch) return false;
                  }
                  return true;
                });

                return (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                      <div className="flex gap-2 w-full sm:w-auto">
                        <select
                          value={weightDepartment}
                          onChange={(e) => setWeightDepartment(e.target.value)}
                          className="block w-full sm:w-48 pl-3 pr-8 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        >
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept === 'All' ? 'Semua Unit' : dept}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Cari Nama / NIP..."
                          value={weightSearch}
                          onChange={(e) => setWeightSearch(e.target.value)}
                          className="block w-full sm:w-48 pl-3 pr-3 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => handleExportFiltered(120, filteredEvals)}>
                          📥 Excel (Filter) Tool 1
                        </Button>
                        <Button variant="secondary" onClick={() => handleExportFiltered(100, filteredEvals)}>
                          📥 Excel (Filter) Tool 2
                        </Button>
                      </div>
                    </div>
                    {filteredEvals.length === 0 ? (
                      <p className="text-slate-600">Tidak ada data penilaian yang selesai.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NIP</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Evaluee</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tool</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NPK (Terbobot)</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Predikat</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Detail Bobot</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {filteredEvals.map((evaluation) => (
                              <tr key={`eval-${evaluation.id}-${evaluation.scale}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{evaluation.evaluee_nip}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{evaluation.evaluee_name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{evaluation.evaluee_department}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    Number(evaluation.scale) === 100 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                  }`}>
                                    {Number(evaluation.scale) === 120 ? 'Tool 1' : 'Tool 2'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                  <div 
                                    className="cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={() => handleShowComparison(evaluation)}
                                    title="Klik untuk melihat detail analisa"
                                  >
                                    {Number(evaluation.npk_calculation?.npkPeriodik ?? evaluation.nilai_nkp ?? 0).toFixed(1)}
                                  </div>
                                  <div className="text-xs text-slate-500 font-normal mt-1">
                                    {evaluation.evaluator_count} Evaluator
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                  {(() => {
                                    const pred = getRatingInfo(evaluation.nilai_nkp, evaluation.scale);
                                    return (
                                      <div 
                                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 inline-flex items-center gap-1 transition-all shadow-sm ${pred.color}`}
                                        onClick={() => {
                                          setSelectedGuidelineContext(evaluation);
                                          setShowPredicateGuideline(true);
                                        }}
                                        title="Klik untuk melihat panduan predikat & analisis"
                                      >
                                        {pred.level}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-900">
                                  {(evaluation.npk_calculation?.aspectDetails || evaluation.scores) ? (
                                    (() => {
                                      const details = evaluation.npk_calculation?.aspectDetails || [];
                                      const valMap = {};
                                      details.forEach(d => {
                                        const rawKey = (d.coreValue || d.name || '').toLowerCase();
                                        const normKey = rawKey
                                          .replace(/\s*&\s*/g, '_')
                                          .replace(/\s+/g, '_');
                                        valMap[normKey] = Number(d.indeksCapaian);
                                      });
                                      const scores = evaluation.scores || {};
                                      const scoreMap = {};
                                      Object.entries(scores).forEach(([k, v]) => {
                                         scoreMap[k] = Number(v);
                                      });
                                      const scaleNum = Number(evaluation.scale);
                                      const orderedKeys = [
                                        'berorientasi_pelayanan',
                                        'akuntabel',
                                        'kompeten',
                                        'harmonis',
                                        'loyal',
                                        'adaptif',
                                        'kolaboratif',
                                        'kepemimpinan'
                                      ];
                                      const display = orderedKeys.map(k => {
                                        let val = valMap[k];
                                        if (val === undefined || val === 0) {
                                           if (k === 'akuntabel' || k === 'loyal') val = valMap['akuntabel_loyal'];
                                           if (k === 'harmonis' || k === 'kolaboratif') val = valMap['kolaboratif_harmonis'];
                                        }
                                        if (val === undefined || val === 0) {
                                           val = scoreMap[k];
                                           if (val === undefined || val === 0) {
                                              if (k === 'akuntabel' || k === 'loyal') {
                                                  val = scoreMap['akuntabel_loyal'] ?? scoreMap['akuntabel_&_loyal'] ?? scoreMap['Akuntabel & Loyal'];
                                              }
                                              if (k === 'harmonis' || k === 'kolaboratif') {
                                                  val = scoreMap['kolaboratif_harmonis'] ?? scoreMap['kolaboratif_&_harmonis'] ?? scoreMap['Kolaboratif & Harmonis'];
                                              }
                                           }
                                        }
                                        return {
                                          key: k,
                                          name: evaluationService.getCoreValueName(k, scaleNum),
                                          value: Number((val ?? 0).toFixed(2))
                                        };
                                      });
                                      return (
                                        <div className="space-y-1">
                                          <div className="text-xs text-slate-500 mb-1">Indeks Capaian per Aspek:</div>
                                          {display.map((row, idx) => (
                                            <div key={`${row.key}-${idx}`} className="text-xs flex justify-between">
                                              <span>{row.name}:</span>
                                              <span className="font-medium ml-2">{row.value.toFixed(2)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })()
                                  ) : 'Belum dibobotkan'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      evaluation.status === 'Selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {evaluation.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleShowComparison(evaluation)}
                                  >
                                    📊 Detail
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* All Employees */}
          {activeTab === 'all-employees' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Semua Karyawan</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                   <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="block w-full sm:w-48 pl-3 pr-8 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept === 'All' ? 'Semua Unit' : dept}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Cari Nama / NIP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full sm:w-48 pl-3 pr-3 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                  <Button variant="primary" onClick={handleAddEmployee}>
                    ➕ Tambah Karyawan
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NIP</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {getFilteredEmployees('all')
                     .map((employee) => {
                      return (
                        <tr key={employee.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-mono">{employee.nip}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{employee.nama}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{employee.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              employee.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              employee.role === 'evaluator' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {employee.role === 'admin' ? '👑 Admin' :
                               employee.role === 'evaluator' ? '👨‍💼 Evaluator' :
                               '👤 Evaluee'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {employee.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEditClick(employee)}
                            >
                              ✏️ Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteClick(employee)}
                            >
                              🗑️ Hapus
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Evaluators */}
          {activeTab === 'evaluators' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Kelola Evaluator</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="block w-full sm:w-40 pl-3 pr-8 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept === 'All' ? 'Semua Unit' : dept}</option>
                    ))}
                  </select>
                  <select
                    value={selectedEvaluatorStatus}
                    onChange={(e) => setSelectedEvaluatorStatus(e.target.value)}
                    className="block w-full sm:w-40 pl-3 pr-8 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    <option value="All">Semua Status</option>
                    <option value="unassigned">Belum Ada Evaluee</option>
                    <option value="not_started">Belum Menilai</option>
                    <option value="in_progress">Dalam Proses</option>
                    <option value="completed">Selesai</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full sm:w-40 pl-3 pr-3 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                  <Button variant="primary" onClick={handleAddEmployee}>
                    ➕ Tambah
                  </Button>
                </div>
              </div>
              
              {getFilteredEmployees('evaluator').length === 0 ? (
                <p className="text-slate-600">Tidak ada evaluator sesuai filter.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NIP</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Evaluee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Penugasan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {getFilteredEmployees('evaluator').map((employee) => {
                        const assignments = assignmentsMap[employee.id] || [];
                        const assignmentCount = assignments.length;
                        
                        // Check completion status for each assignment
                        const completedCount = assignments.filter(evalueeId => {
                           // Find evaluation for this evaluee where this evaluator has rated
                           const evaluee = allEmployees.find(e => String(e.id) === String(evalueeId));
                           
                           // Check if ANY evaluation exists for this evaluee from this evaluator
                           // and ensure it's actually rated (scores exist and not empty)
                           return allEvaluations.some(ev => 
                             (String(ev.evaluee_id) === String(evalueeId) || (evaluee?.nip && ev.evaluee_nip === evaluee.nip)) && 
                             ev.evaluators?.some(evaluator => 
                               (String(evaluator.id) === String(employee.id) || (employee?.nip && evaluator.nip === employee.nip)) && 
                               (evaluator.has_rated || (evaluator.scores && Object.keys(evaluator.scores).length > 0 && Object.values(evaluator.scores).some(v => v > 0)))
                             )
                           );
                        }).length;

                        return (
                          <tr key={employee.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-mono">{employee.nip}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{employee.nama}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{employee.department}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <span 
                                onClick={() => handleAssignmentClick(employee)}
                                className={`px-2 py-1 rounded-full text-xs font-medium w-fit cursor-pointer hover:opacity-80 ${
                                  assignmentCount === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}
                                title="Klik untuk menambah/mengatur evaluee"
                              >
                                {assignmentCount === 0 ? '❌ Belum Ada Evaluee' : '✅ Sudah Ada Evaluee'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <div className="flex flex-col gap-1">
                                <span 
                                  onClick={() => handleProgressClick(employee)}
                                  className={`px-2 py-1 rounded-full text-xs font-medium w-fit cursor-pointer hover:opacity-80 ${
                                    assignmentCount === 0 ? 'bg-slate-100 text-slate-600' :
                                    completedCount === assignmentCount ? 'bg-green-100 text-green-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}
                                  title="Klik untuk melihat detail progres"
                                >
                                  {assignmentCount === 0 ? '-' :
                                   `${completedCount}/${assignmentCount} Selesai`}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAssignmentClick(employee)}
                              >
                                📋 Atur
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleEditClick(employee)}
                              >
                                ✏️ Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(employee)}
                              >
                                🗑️ Hapus
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Evaluees */}
          {activeTab === 'evaluees' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Kelola Evaluee</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="block w-full sm:w-48 pl-3 pr-8 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept === 'All' ? 'Semua Unit' : dept}</option>
                    ))}
                  </select>
                   <input
                    type="text"
                    placeholder="Cari..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full sm:w-48 pl-3 pr-3 py-2 text-sm border border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                  <Button variant="primary" onClick={handleAddEmployee}>
                    ➕ Tambah Evaluee
                  </Button>
                </div>
              </div>
              
              {getFilteredEmployees('evaluee').length === 0 ? (
                <p className="text-slate-600">Tidak ada evaluee sesuai filter.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">NIP</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jabatan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Penilaian</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {getFilteredEmployees('evaluee').map((employee) => {
                        const hasEvaluation = allEvaluations.some(ev => ev.evaluee_nip === employee.nip);
                        return (
                          <tr key={employee.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-mono">{employee.nip}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{employee.nama}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{employee.jabatan}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{employee.department}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                hasEvaluation ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {hasEvaluation ? '✅ Sudah Dinilai' : '⏳ Belum Dinilai'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {employee.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleEditClick(employee)}
                              >
                                ✏️ Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(employee)}
                              >
                                🗑️ Hapus
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showComparison && (
        <ComparisonModal
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          allEvaluations={allEvaluations}
          evaluation={selectedEvaluation}
        />
      )}

      {showScaleComparison && (
        <ScaleComparisonModal
          isOpen={showScaleComparison}
          onClose={() => setShowScaleComparison(false)}
          data={scaleComparisonData}
        />
      )}



      {showEditModal && (
        <EditEmployeeModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          employee={editingEmployee}
          onSave={handleSaveEmployee}
        />
      )}

      {showAssignmentModal && (
        <AssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => setShowAssignmentModal(false)}
          evaluator={selectedEvaluator}
          allEmployees={allEmployees}
          allEvaluations={allEvaluations}
          onSave={handleSaveAssignment}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Konfirmasi Hapus</h3>
            <p className="text-slate-600 mb-6">
              Apakah Anda yakin ingin menghapus {employeeToDelete?.nama}?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteEmployee}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
      <PredicateGuidelineModal 
        isOpen={showPredicateGuideline} 
        onClose={() => {
          setShowPredicateGuideline(false);
          setSelectedGuidelineContext(null);
        }}
        contextEvaluation={selectedGuidelineContext}
      />
      
      <ProgressDetailModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        evaluator={selectedEvaluatorForProgress}
        allEmployees={allEmployees}
        allEvaluations={allEvaluations}
        assignmentsMap={assignmentsMap}
      />
    </div>
  );
};

export default AdminDashboard;
