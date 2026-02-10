import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import SecureLogoutComponent from '../../components/ui/SecureLogoutComponent';
import Icon from '../../components/AppIcon';
import EvaluationPeriodCard from './components/EvaluationPeriodCard';
import PhaseActionCard from './components/PhaseActionCard';
import EvaluationHistoryCard from './components/EvaluationHistoryCard';
import CoreValuesSummaryCard from './components/CoreValuesSummaryCard';
import QuickActionsCard from './components/QuickActionsCard';

const EvalueeDashboard = () => {
  const navigate = useNavigate();
  const [currentUser] = useState({
    name: 'Budi Santoso',
    nip: '198505152010011001',
    position: 'Analis Kebijakan Ahli Muda',
    unit: 'Biro Perencanaan dan Keuangan',
    role: 'evaluee',
  });

  const evaluationPeriod = {
    name: 'Evaluasi Kinerja Semester I Tahun 2026',
    startDate: '01 Januari 2026',
    endDate: '30 Juni 2026',
    submissionDeadline: '15 Februari 2026',
    status: 'active',
    daysRemaining: 28,
    completionPercentage: 45,
  };

  const phaseActions = [
    {
      id: 'proposal',
      title: 'Usulan Evaluator',
      description: 'Ajukan atasan, rekan kerja, dan bawahan sebagai evaluator Anda',
      status: 'in_progress',
      actionLabel: 'Lanjutkan Usulan',
      actionRoute: '/evaluator-proposal',
      metrics: [
        { icon: 'Users', label: 'Evaluator Diusulkan', value: '5 dari 7' },
        { icon: 'CheckCircle', label: 'Disetujui', value: '3' },
      ],
      pendingActions: [
        'Tambahkan 2 rekan kerja sebagai evaluator',
        'Lengkapi justifikasi untuk usulan atasan',
      ],
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'assessment',
      title: 'Penilaian Kinerja',
      description: 'Lengkapi penilaian perilaku kerja berdasarkan Core Value ASN BerAKHLAK',
      status: 'pending',
      actionLabel: 'Mulai Penilaian',
      actionRoute: '/behavioral-assessment',
      metrics: [
        { icon: 'FileText', label: 'Formulir', value: '0 dari 6' },
        { icon: 'Clock', label: 'Waktu Tersisa', value: '28 hari' },
      ],
      pendingActions: [
        'Tunggu persetujuan evaluator dari atasan',
        'Persiapkan dokumentasi pendukung',
      ],
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'review',
      title: 'Review & Finalisasi',
      description: 'Review hasil penilaian dan finalisasi laporan NPK',
      status: 'locked',
      actionLabel: 'Review Hasil',
      actionRoute: '/evaluation-review',
      metrics: [
        { icon: 'Eye', label: 'Ditinjau', value: '0 dari 3' },
        { icon: 'CheckSquare', label: 'Disetujui', value: '0 dari 3' },
      ],
      pendingActions: [
        'Selesaikan semua penilaian evaluator',
        'Lengkapi dokumentasi pendukung',
      ],
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  const evaluationHistory = [
    {
      id: 'eval-2025-sem2',
      period: 'Semester II 2025',
      status: 'completed',
      score: 87.5,
      date: '15 Desember 2025',
      evaluators: 5,
    },
    {
      id: 'eval-2025-sem1',
      period: 'Semester I 2025',
      status: 'completed',
      score: 84.2,
      date: '15 Juni 2025',
      evaluators: 4,
    },
    {
      id: 'eval-2024-sem2',
      period: 'Semester II 2024',
      status: 'completed',
      score: 89.1,
      date: '15 Desember 2024',
      evaluators: 6,
    }
  ];

  const coreValuesSummary = [
    {
      name: 'Berorientasi Pelayanan',
      score: 85,
      maxScore: 100,
      color: '#3B82F6',
      description: 'Kemampuan memberikan pelayanan prima',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Profesional',
      score: 88,
      maxScore: 100,
      color: '#10B981',
      description: 'Melaksanakan tugas dengan profesionalisme tinggi',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Harmonis',
      score: 92,
      maxScore: 100,
      color: '#F59E0B',
      description: 'Kemampuan membangun kerja sama',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      name: 'Loyal',
      score: 90,
      maxScore: 100,
      color: '#EF4444',
      description: 'Kesetiaan terhadap organisasi',
      gradient: 'from-red-500 to-rose-600'
    },
    {
      name: 'Inovatif',
      score: 86,
      maxScore: 100,
      color: '#8B5CF6',
      description: 'Kemampuan berinovasi dan kreativitas',
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      name: 'Kolaboratif',
      score: 89,
      maxScore: 100,
      color: '#06B6D4',
      description: 'Mampu bekerja sama dengan berbagai pihak',
      gradient: 'from-cyan-500 to-blue-600'
    }
  ];

  const quickActions = [
    {
      id: 'view-current',
      title: 'Lihat Evaluasi Saat Ini',
      description: 'Pantau progress evaluasi yang sedang berlangsung',
      icon: 'Eye',
      action: () => navigate('/current-evaluation'),
      disabled: false,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'download-report',
      title: 'Unduh Laporan',
      description: 'Download laporan evaluasi dalam format PDF',
      icon: 'Download',
      action: () => console.log('Download report'),
      disabled: true,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'contact-admin',
      title: 'Hubungi Administrator',
      description: 'Kirim pesan ke administrator sistem',
      icon: 'MessageSquare',
      action: () => console.log('Contact admin'),
      disabled: false,
      color: 'purple',
      gradient: 'from-purple-500 to-indigo-600'
    }
  ];

  // Auto-refresh data setiap 30 detik
  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh data logic here
      console.log('🔄 Refreshing dashboard data...');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative overflow-hidden">
      {/* ===========================================
          BACKGROUND PATTERN - SUBTLE & PROFESSIONAL
          =========================================== */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-900 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-400 rounded-full translate-y-32 -translate-x-32"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-600 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <RoleBasedHeader
        userRole="evaluee"
        userName={currentUser.name}
      />

      <SecureLogoutComponent
        sessionTimeout={1800000}
        warningTime={300000}
        showInactivityWarning={true}
      />

      <main className="relative z-10 pt-16">
        <div className="mx-auto px-4 md:px-6 lg:px-8 py-8 max-w-7xl">

          {/* ===========================================
              BREADCRUMB
              =========================================== */}
          <NavigationBreadcrumb
            customBreadcrumbs={[
              { label: 'Dashboard Evaluee', path: '/evaluee-dashboard', isActive: true }
            ]}
          />

          {/* ===========================================
              HERO SECTION - KEMENKEU BRANDING
              =========================================== */}
          <div className="mt-8 mb-12">
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
              </div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Content */}
                <div className="lg:col-span-2 text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gold-400/20 rounded-2xl flex items-center justify-center border border-gold-400/30">
                      <Icon name="User" size={24} color="#d4af37" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold">Dashboard Evaluee</h1>
                      <p className="text-blue-100 text-lg">Sistem Evaluasi Kinerja Pegawai</p>
                    </div>
                  </div>

                  <p className="text-blue-100 leading-relaxed mb-6 max-w-2xl">
                    Pantau progress evaluasi kinerja Anda, kelola proses NPK, dan akses semua fitur evaluasi
                    berbasis Core Values ASN BerAKHLAK dengan mudah dan transparan.
                  </p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-gold-400">{evaluationPeriod.daysRemaining}</div>
                      <div className="text-sm text-blue-200">Hari Tersisa</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-emerald-400">{evaluationPeriod.completionPercentage}%</div>
                      <div className="text-sm text-blue-200">Progress</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-cyan-400">{phaseActions.filter(p => p.status === 'completed').length}</div>
                      <div className="text-sm text-blue-200">Tahap Selesai</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold text-amber-400">{coreValuesSummary.length}</div>
                      <div className="text-sm text-blue-200">Core Values</div>
                    </div>
                  </div>
                </div>

                {/* Right Content - User Profile */}
                <div className="lg:col-span-1">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg border-2 border-white/20">
                        <span className="text-xl font-bold text-blue-900">
                          {currentUser.name.charAt(0)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-white mt-3">{currentUser.name}</h3>
                      <p className="text-sm text-blue-200 mt-1">{currentUser.position}</p>
                      <p className="text-xs text-blue-300">{currentUser.unit}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-200">NIP</span>
                        <span className="text-sm font-semibold text-gold-400">{currentUser.nip}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-200">Role</span>
                        <span className="px-2 py-1 bg-gold-400/20 text-gold-400 text-xs rounded-full font-medium border border-gold-400/30">
                          Evaluee
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-200">Progress</span>
                        <span className="text-sm font-semibold text-white">
                          {evaluationPeriod.completionPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===========================================
              WORKFLOW PROGRESS
              =========================================== */}
          <div className="mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-slate-200/40">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Progress Evaluasi</h2>
                  <p className="text-slate-600 mt-1">Tahapan proses evaluasi kinerja Anda</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{phaseActions.filter(p => p.status === 'completed').length + 1}</div>
                  <div className="text-sm text-slate-600">dari {phaseActions.length} Tahap</div>
                </div>
              </div>

              {/* Progress Visualization */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  {phaseActions.map((phase, index) => (
                    <div key={phase.id} className="flex items-center flex-1">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 transition-all duration-300 ${
                        phase.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : phase.status === 'in_progress'
                          ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                          : 'bg-slate-200 border-slate-300 text-slate-500'
                      }`}>
                        <Icon name={phase.id === 'proposal' ? 'FileEdit' : phase.id === 'assessment' ? 'ClipboardCheck' : 'Award'} size={20} color="white" />
                      </div>
                      {index < phaseActions.length - 1 && (
                        <div className={`flex-1 h-1 mx-4 rounded transition-all duration-500 ${
                          phase.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {phaseActions.map((phase) => (
                    <div key={phase.id} className="text-center">
                      <div className={`text-sm font-semibold mb-1 ${
                        phase.status === 'completed' ? 'text-emerald-700' :
                        phase.status === 'in_progress' ? 'text-blue-700' : 'text-slate-500'
                      }`}>
                        {phase.title}
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        phase.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        phase.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {phase.status === 'completed' ? 'Selesai' :
                         phase.status === 'in_progress' ? 'Sedang Berlangsung' :
                         phase.status === 'pending' ? 'Menunggu' : 'Terkunci'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ===========================================
              MAIN CONTENT GRID
              =========================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Evaluation Period */}
              <EvaluationPeriodCard evaluationPeriod={evaluationPeriod} />

              {/* Phase Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {phaseActions.map((action) => (
                  <PhaseActionCard
                    key={action.id}
                    phaseAction={action}
                  />
                ))}
              </div>

              {/* Evaluation History */}
              <EvaluationHistoryCard evaluationHistory={evaluationHistory} />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <CoreValuesSummaryCard coreValues={coreValuesSummary} />
              <QuickActionsCard actions={quickActions} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EvalueeDashboard;