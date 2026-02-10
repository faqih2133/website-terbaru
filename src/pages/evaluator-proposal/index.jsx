import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import Button from '../../components/ui/Button';
import EvaluatorCategorySection from './components/EvaluatorCategorySection';
import ProposalSummaryCard from './components/ProposalSummaryCard';
import ConfirmationModal from './components/ConfirmationModal';
import ValidationAlert from './components/ValidationAlert';
import Icon from '../../components/AppIcon';

const EvaluatorProposal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State untuk melacak apakah sudah pernah mengajukan di periode ini
  const [hasSubmittedProposal, setHasSubmittedProposal] = useState(false);
  const [currentEvaluationPeriod, setCurrentEvaluationPeriod] = useState('2026-Semester-I');
  
  const [expandedSections, setExpandedSections] = useState({
    supervisors: true,
    peers: false,
    subordinates: false
  });

  // Enhanced employee options with complete data
  const [employeeOptions] = useState([
    { 
      value: 'supervisor.001', 
      label: 'Dr. Ahmad Santoso', 
      nip: '196501011990011001',
      position: 'Kepala Bidang Kepegawaian', 
      department: 'Bidang Kepegawaian',
      description: 'Kepala Bidang Kepegawaian'
    },
    { 
      value: 'supervisor.002', 
      label: 'Drs. Siti Nurhaliza', 
      nip: '197001012000011002',
      position: 'Kepala Bagian Umum', 
      department: 'Bagian Umum',
      description: 'Kepala Bagian Umum'
    },
    { 
      value: 'peer.001', 
      label: 'Budi Prasetyo', 
      nip: '198501012005011003',
      position: 'Analis Kepegawaian Senior', 
      department: 'Bidang Kepegawaian',
      description: 'Analis Kepegawaian Senior'
    },
    { 
      value: 'peer.002', 
      label: 'Maya Sari', 
      nip: '198703152008011004',
      position: 'Staf Administrasi', 
      department: 'Bagian Umum',
      description: 'Staf Administrasi'
    },
    { 
      value: 'peer.003', 
      label: 'Rudi Hartono', 
      nip: '198901012010011005',
      position: 'Analis Kepegawaian', 
      department: 'Bidang Kepegawaian',
      description: 'Analis Kepegawaian'
    },
    { 
      value: 'peer.004', 
      label: 'Nina Kusuma', 
      nip: '199001012012011006',
      position: 'Staf Kepegawaian', 
      department: 'Bidang Kepegawaian',
      description: 'Staf Kepegawaian'
    },
    { 
      value: 'subordinate.001', 
      label: 'Dewi Anggraini', 
      nip: '199501012015011007',
      position: 'Staf Junior Administrasi', 
      department: 'Bagian Umum',
      description: 'Staf Junior Administrasi'
    },
    { 
      value: 'subordinate.002', 
      label: 'Adi Nugroho', 
      nip: '199601012016011008',
      position: 'Staf Junior Kepegawaian', 
      department: 'Bidang Kepegawaian',
      description: 'Staf Junior Kepegawaian'
    }
  ]);

  const [supervisors, setSupervisors] = useState([
    { 
      id: 1, 
      employeeId: '', 
      employeeData: null, // Store complete employee data
      justification: '',
      errors: {}
    }
  ]);

  const [peers, setPeers] = useState([
    { 
      id: 1, 
      employeeId: '', 
      employeeData: null,
      justification: '',
      errors: {}
    },
    { 
      id: 2, 
      employeeId: '', 
      employeeData: null,
      justification: '',
      errors: {}
    }
  ]);

  const [subordinates, setSubordinates] = useState([
    { 
      id: 1, 
      employeeId: '', 
      employeeData: null,
      justification: '',
      errors: {}
    }
  ]);

  // Add submission state
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // ===========================================
  // CHECK IF USER HAS ALREADY SUBMITTED PROPOSAL
  // ===========================================
  useEffect(() => {
    const checkProposalStatus = () => {
      // In real app, this would check from API/database
      // For now, we'll use localStorage to simulate persistence
      const submittedProposals = JSON.parse(localStorage.getItem('submittedProposals') || '{}');
      const userProposalKey = `${user?.id}-${currentEvaluationPeriod}`;
      
      if (submittedProposals[userProposalKey]) {
        setHasSubmittedProposal(true);
        console.log('📝 User has already submitted proposal for this period');
      } else {
        setHasSubmittedProposal(false);
        console.log('📝 User can submit proposal for this period');
      }
    };

    if (user?.id) {
      checkProposalStatus();
    }
  }, [user?.id, currentEvaluationPeriod]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Auto-generate justification templates
  const generateJustification = (employeeData, category) => {
    if (!employeeData) return '';
    
    const templates = {
      supervisors: `Saya mengusulkan ${employeeData.label} sebagai evaluator karena sebagai ${employeeData.position} di ${employeeData.department}, beliau memiliki pemahaman mendalam tentang tugas dan tanggung jawab saya serta dapat memberikan penilaian yang objektif dan komprehensif.`,
      
      peers: `Saya mengusulkan ${employeeData.label} sebagai evaluator karena sebagai ${employeeData.position} di ${employeeData.department}, beliau sering berinteraksi dengan saya dalam pekerjaan sehari-hari dan memiliki pemahaman yang baik tentang kinerja serta kontribusi saya.`,
      
      subordinates: `Saya mengusulkan ${employeeData.label} sebagai evaluator karena sebagai ${employeeData.position} di ${employeeData.department}, beliau memiliki pengalaman langsung dalam mengamati kepemimpinan dan arahan yang saya berikan dalam tugas-tugas tim.`
    };
    
    return templates[category] || '';
  };

  const updateEvaluator = (category, id, field, value) => {
    const setters = {
      supervisors: setSupervisors,
      peers: setPeers,
      subordinates: setSubordinates
    };
    
    const setter = setters[category];
    if (!setter) return;
    
    setter(prev => prev.map(evaluator => {
      if (evaluator.id === id) {
        if (field === 'employeeId') {
          // When employeeId changes, find and set employeeData and generate justification
          const employeeData = employeeOptions.find(option => option.value === value);
          const updatedEvaluator = {
            ...evaluator,
            [field]: value,
            employeeData: employeeData || null,
            justification: field === 'employeeId' && employeeData ? generateJustification(employeeData, category) : evaluator.justification,
            errors: { ...evaluator.errors, [field]: '' }
          };
          return updatedEvaluator;
        } else {
          return {
            ...evaluator,
            [field]: value,
            errors: { ...evaluator.errors, [field]: '' }
          };
        }
      }
      return evaluator;
    }));
  };

  const addEvaluator = (category) => {
    const setters = {
      supervisors: setSupervisors,
      peers: setPeers,
      subordinates: setSubordinates
    };
    
    const maxIds = {
      supervisors: Math.max(...supervisors.map(s => s.id), 0),
      peers: Math.max(...peers.map(p => p.id), 0),
      subordinates: Math.max(...subordinates.map(s => s.id), 0)
    };
    
    const newEvaluator = {
      id: maxIds[category] + 1,
      employeeId: '',
      employeeData: null,
      justification: '',
      errors: {}
    };
    
    setters[category](prev => [...prev, newEvaluator]);
  };

  const removeEvaluator = (category, id) => {
    const setters = {
      supervisors: setSupervisors,
      peers: setPeers,
      subordinates: setSubordinates
    };
    
    setters[category](prev => prev.filter(evaluator => evaluator.id !== id));
  };

  // Enhanced validation
  const validateEvaluator = (evaluator) => {
    const errors = {};
    
    if (!evaluator.employeeId.trim()) {
      errors.employeeId = 'Pilih evaluator terlebih dahulu';
    }
    if (!evaluator.justification.trim()) {
      errors.justification = 'Justifikasi harus diisi';
    } else if (evaluator.justification.trim().length < 50) {
      errors.justification = 'Justifikasi minimal 50 karakter';
    }
    
    return errors;
  };

  const validateAllEvaluators = () => {
    const allEvaluators = [
      ...supervisors.map(e => ({ ...e, category: 'supervisors' })),
      ...peers.map(e => ({ ...e, category: 'peers' })),
      ...subordinates.map(e => ({ ...e, category: 'subordinates' }))
    ];

    const errors = [];
    const setters = {
      supervisors: setSupervisors,
      peers: setPeers,
      subordinates: setSubordinates
    };

    allEvaluators.forEach(evaluator => {
      const evaluatorErrors = validateEvaluator(evaluator);
      if (Object.keys(evaluatorErrors).length > 0) {
        setters[evaluator.category](prev => prev.map(e => 
          e.id === evaluator.id 
            ? { ...e, errors: evaluatorErrors }
            : e
        ));
        errors.push({
          category: evaluator.category,
          id: evaluator.id,
          errors: evaluatorErrors
        });
      }
    });

    return errors;
  };

  // Enhanced submit function with approval workflow
  const handleSubmitProposal = () => {
    const errors = validateAllEvaluators();
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      // Auto-expand confirmation modal
      setShowConfirmationModal(true);
    }
  };

  const confirmSubmission = async () => {
    setSubmitting(true);
    
    try {
      // Prepare proposal data
      const proposalData = {
        evaluee_id: user?.id,
        evaluation_period_id: currentEvaluationPeriod,
        proposed_evaluators: [
          ...supervisors.filter(s => s.employeeData).map(s => ({
            employee_id: s.employeeId,
            name: s.employeeData.label,
            nip: s.employeeData.nip,
            position: s.employeeData.position,
            department: s.employeeData.department,
            justification: s.justification,
            category: 'supervisor'
          })),
          ...peers.filter(p => p.employeeData).map(p => ({
            employee_id: p.employeeId,
            name: p.employeeData.label,
            nip: p.employeeData.nip,
            position: p.employeeData.position,
            department: p.employeeData.department,
            justification: p.justification,
            category: 'peer'
          })),
          ...subordinates.filter(s => s.employeeData).map(s => ({
            employee_id: s.employeeId,
            name: s.employeeData.label,
            nip: s.employeeData.nip,
            position: s.employeeData.position,
            department: s.employeeData.department,
            justification: s.justification,
            category: 'subordinate'
          }))
        ],
        submitted_at: new Date().toISOString(),
        status: 'pending_approval'
      };

      console.log('📤 Submitting proposal:', proposalData);
      
      // Simulate API call - in real app, this would save to database
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      // Mark as submitted in localStorage (in real app, this would be handled by API)
      const submittedProposals = JSON.parse(localStorage.getItem('submittedProposals') || '{}');
      const userProposalKey = `${user?.id}-${currentEvaluationPeriod}`;
      submittedProposals[userProposalKey] = {
        submittedAt: new Date().toISOString(),
        proposalData: proposalData
      };
      localStorage.setItem('submittedProposals', JSON.stringify(submittedProposals));
      
      // Update local state
      setHasSubmittedProposal(true);
      
      // Show success message
      alert('✅ Proposal berhasil diajukan! Menunggu approval dari admin.');
      
      // Redirect to dashboard
      navigate('/evaluee-dashboard');
      
    } catch (error) {
      console.error('❌ Submission error:', error);
      alert('❌ Gagal mengirim proposal. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
      setShowConfirmationModal(false);
    }
  };

  const totalEvaluators = supervisors.length + peers.length + subordinates.length;
  const completedEvaluators = [
    ...supervisors,
    ...peers,
    ...subordinates
  ].filter(e => e.employeeId && e.justification.length >= 50).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative overflow-hidden">
      
      {/* ===========================================
          BACKGROUND PATTERN
          =========================================== */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-400 rounded-full translate-y-32 -translate-x-32"></div>
      </div>

      <RoleBasedHeader />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ===========================================
            HEADER SECTION
            =========================================== */}
        <div className="mb-8">
          <NavigationBreadcrumb
            customBreadcrumbs={[
              { label: 'Dashboard Evaluee', path: '/evaluee-dashboard' },
              { label: 'Usulan Evaluator', path: '/evaluator-proposal', isActive: true }
            ]}
          />

          <div className="mt-6">
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="text-white">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gold-400/20 rounded-2xl flex items-center justify-center border border-gold-400/30">
                      <Icon name="FileEdit" size={24} color="#d4af37" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold">Usulan Evaluator</h1>
                      <p className="text-blue-100 text-lg">Periode Evaluasi {currentEvaluationPeriod.replace('-', ' ')}</p>
                    </div>
                  </div>
                  
                  {hasSubmittedProposal ? (
                    <div className="bg-amber-500/20 border border-amber-400/50 rounded-xl p-4 mt-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                          <Icon name="Info" size={14} color="white" />
                        </div>
                        <div>
                          <p className="font-semibold text-amber-200">Anda Sudah Mengusulkan Evaluator</p>
                          <p className="text-amber-100 text-sm mt-1">
                            Pengajuan evaluator hanya dapat dilakukan satu kali per periode evaluasi. 
                            Silakan tunggu approval dari admin atau coba lagi di periode evaluasi berikutnya.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-blue-100 leading-relaxed max-w-2xl">
                      Ajukan atasan, rekan kerja, dan bawahan sebagai evaluator kinerja Anda. 
                      Pastikan memilih evaluator yang memiliki pemahaman baik tentang tugas dan tanggung jawab Anda.
                    </p>
                  )}
                </div>

                <div className="hidden lg:block text-white text-right">
                  <div className="text-3xl font-bold text-gold-400">{completedEvaluators}/{totalEvaluators}</div>
                  <div className="text-sm text-blue-200">Evaluator Lengkap</div>
                  {hasSubmittedProposal && (
                    <div className="mt-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/50 rounded-full">
                      <span className="text-xs text-emerald-300 font-medium">Menunggu Approval</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===========================================
            MAIN CONTENT
            =========================================== */}
        {hasSubmittedProposal ? (
          /* ALREADY SUBMITTED VIEW */
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/40">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Icon name="Clock" size={40} color="var(--color-amber)" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Pengajuan Sedang Diproses</h2>
              
              <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">
                Anda telah mengajukan usulan evaluator untuk periode evaluasi ini. 
                Proposal Anda sedang menunggu persetujuan dari administrator sistem. 
                Anda akan menerima notifikasi melalui email ketika proposal disetujui atau ditolak.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/evaluee-dashboard')}
                  className="bg-white/50 hover:bg-white border-slate-300 hover:border-slate-400"
                >
                  Kembali ke Dashboard
                </Button>
                
                <Button
                  variant="primary"
                  onClick={() => {
                    // Clear localStorage for demo purposes
                    const submittedProposals = JSON.parse(localStorage.getItem('submittedProposals') || '{}');
                    delete submittedProposals[`${user?.id}-${currentEvaluationPeriod}`];
                    localStorage.setItem('submittedProposals', JSON.stringify(submittedProposals));
                    setHasSubmittedProposal(false);
                    
                    // Reset form
                    setSupervisors([{ id: 1, employeeId: '', employeeData: null, justification: '', errors: {} }]);
                    setPeers([
                      { id: 1, employeeId: '', employeeData: null, justification: '', errors: {} },
                      { id: 2, employeeId: '', employeeData: null, justification: '', errors: {} }
                    ]);
                    setSubordinates([{ id: 1, employeeId: '', employeeData: null, justification: '', errors: {} }]);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                >
                  Buat Usulan Baru (Demo)
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* FORM VIEW - NORMAL FLOW */
          <>
            {/* Validation Alerts */}
            {validationErrors.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon name="AlertCircle" size={20} color="var(--color-red)" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">Terdapat kesalahan dalam pengisian data evaluator. Periksa kembali form yang ditandai.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Supervisor Section */}
                <EvaluatorCategorySection
                  title="Atasan"
                  description="Pilih atasan langsung atau pejabat yang memahami tugas dan tanggung jawab Anda"
                  evaluators={supervisors}
                  category="supervisors"
                  employeeOptions={employeeOptions}
                  minRequired={1}
                  maxAllowed={2}
                  isExpanded={expandedSections.supervisors}
                  onToggleExpand={() => toggleSection('supervisors')}
                  onUpdateEvaluator={(id, field, value) => updateEvaluator('supervisors', id, field, value)}
                  onAddEvaluator={() => addEvaluator('supervisors')}
                  onRemoveEvaluator={(id) => removeEvaluator('supervisors', id)}
                  disabled={hasSubmittedProposal}
                />

                {/* Peer Section */}
                <EvaluatorCategorySection
                  title="Rekan Kerja (Peer)"
                  description="Pilih rekan kerja yang memiliki interaksi kerja dengan Anda"
                  evaluators={peers}
                  category="peers"
                  employeeOptions={employeeOptions}
                  minRequired={2}
                  maxAllowed={4}
                  isExpanded={expandedSections.peers}
                  onToggleExpand={() => toggleSection('peers')}
                  onUpdateEvaluator={(id, field, value) => updateEvaluator('peers', id, field, value)}
                  onAddEvaluator={() => addEvaluator('peers')}
                  onRemoveEvaluator={(id) => removeEvaluator('peers', id)}
                  disabled={hasSubmittedProposal}
                />

                {/* Subordinate Section */}
                <EvaluatorCategorySection
                  title="Bawahan"
                  description="Pilih bawahan yang memiliki pengalaman langsung dalam mengamati kepemimpinan Anda"
                  evaluators={subordinates}
                  category="subordinates"
                  employeeOptions={employeeOptions}
                  minRequired={1}
                  maxAllowed={3}
                  isExpanded={expandedSections.subordinates}
                  onToggleExpand={() => toggleSection('subordinates')}
                  onUpdateEvaluator={(id, field, value) => updateEvaluator('subordinates', id, field, value)}
                  onAddEvaluator={() => addEvaluator('subordinates')}
                  onRemoveEvaluator={(id) => removeEvaluator('subordinates', id)}
                  disabled={hasSubmittedProposal}
                />

                {/* Action Buttons */}
                {!hasSubmittedProposal && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/40">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/evaluee-dashboard')}
                        disabled={submitting}
                        className="bg-white/50 hover:bg-white border-slate-300 hover:border-slate-400"
                      >
                        Batal
                      </Button>

                      <Button
                        variant="primary"
                        onClick={handleSubmitProposal}
                        disabled={completedEvaluators < 4 || submitting}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Mengirim...' : 'Ajukan Evaluator'}
                      </Button>
                    </div>

                    <p className="text-center text-sm text-slate-500 mt-4">
                      Minimal 4 evaluator harus lengkap sebelum dapat mengajukan
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <ProposalSummaryCard
                  supervisors={supervisors}
                  peers={peers}
                  subordinates={subordinates}
                  totalEvaluators={totalEvaluators}
                  completedEvaluators={completedEvaluators}
                />
              </div>
            </div>
          </>
        )}

        {/* Confirmation Modal */}
        {showConfirmationModal && (
          <ConfirmationModal
            isOpen={showConfirmationModal}
            onClose={() => setShowConfirmationModal(false)}
            onConfirm={confirmSubmission}
            submitting={submitting}
            proposalData={{
              supervisors: supervisors.filter(s => s.employeeData),
              peers: peers.filter(p => p.employeeData),
              subordinates: subordinates.filter(s => s.employeeData)
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EvaluatorProposal;