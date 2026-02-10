import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedHeader from '../../components/ui/RoleBasedHeader';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import WorkflowProgressIndicator from '../../components/ui/WorkflowProgressIndicator';
import SecureLogoutComponent from '../../components/ui/SecureLogoutComponent';
import ProposalCard from './components/ProposalCard';
import ModificationModal from './components/ModificationModal';
import ComparisonView from './components/ComparisonView';
import WeightCalculationPreview from './components/WeightCalculationPreview';
import RejectionModal from './components/RejectionModal';
import BulkActionPanel from './components/BulkActionPanel';
// ❌ Hapus Icon dan Button imports
// ... rest of component tetap sama
import Icon from '../../components/AppIcon'; // ✅ Correct path
import Button from '../../components/ui/Button'; // ✅ Correct path
// ... rest of component

const SupervisorApproval = () => {
  const navigate = useNavigate();
  const [expandedCards, setExpandedCards] = useState({});
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showComparisonView, setShowComparisonView] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [originalProposal, setOriginalProposal] = useState(null);

  const handleLogout = () => {
    navigate('/login');
  };

  const [proposals, setProposals] = useState([
  {
    id: 'prop-1',
    category: 'supervisor',
    status: 'pending',
    weight: 40,
    evaluators: [
    {
      id: 'eval-1',
      name: 'Dr. Budi Santoso, M.Si',
      position: 'Kepala Biro SDM',
      department: 'Biro Sumber Daya Manusia',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1187f681a-1763296420565.png",
      avatarAlt: 'Professional headshot of Indonesian man in his 50s with short gray hair wearing navy blue formal suit and red tie',
      justification: 'Beliau adalah atasan langsung saya yang memahami tugas dan tanggung jawab saya secara menyeluruh. Memiliki pengalaman lebih dari 20 tahun dalam manajemen SDM ASN.',
      isModified: false
    }]

  },
  {
    id: 'prop-2',
    category: 'peer',
    status: 'pending',
    weight: 30,
    evaluators: [
    {
      id: 'eval-2',
      name: 'Siti Nurhaliza, S.E., M.M.',
      position: 'Kepala Bagian Perencanaan',
      department: 'Bagian Perencanaan dan Pengembangan',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1187f681a-1763296420565.png",
      avatarAlt: 'Professional headshot of Indonesian woman in her 40s with long black hair wearing navy blue blazer and white blouse',
      justification: 'Sebagai kepala bagian yang berdekatan dengan unit kerja saya, beliau memiliki pemahaman yang baik tentang interaksi dan koordinasi antar unit.',
      isModified: false
    },
    {
      id: 'eval-3',
      name: 'Ahmad Fauzi, S.Kom., M.T.',
      position: 'Kepala Subbagian Teknologi Informasi',
      department: 'Subbagian Teknologi Informasi dan Komunikasi',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1187f681a-1763296420565.png",
      avatarAlt: 'Professional headshot of Indonesian man in his 40s with short black hair wearing gray suit and blue tie',
      justification: 'Beliau sering berkolaborasi dengan tim saya dalam pengembangan sistem informasi. Memiliki kompetensi teknis yang baik.',
      isModified: false
    }]

  },
  {
    id: 'prop-3',
    category: 'subordinate',
    status: 'pending',
    weight: 30,
    evaluators: [
    {
      id: 'eval-4',
      name: 'Dewi Lestari, S.E.',
      position: 'Analis Keuangan Ahli Pertama',
      department: 'Subbagian Anggaran dan Pelaporan',
      avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1187f681a-1763296420565.png",
      avatarAlt: 'Professional headshot of Indonesian woman in her 30s with shoulder-length black hair wearing navy blue blazer',
      justification: 'Sebagai bawahan langsung, beliau memiliki pengalaman sehari-hari bekerja dengan saya dan memahami gaya kepemimpinan serta arahan yang saya berikan.',
      isModified: false
    }]

  }
]);

  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleApprove = (proposalId) => {
    setProposals(prev => prev.map(proposal => 
      proposal.id === proposalId 
        ? { ...proposal, status: 'approved' }
        : proposal
    ));
  };

  const handleReject = (proposalId) => {
    setSelectedProposal(proposals.find(p => p.id === proposalId));
    setShowRejectionModal(true);
  };

  const handleModify = (proposalId) => {
    const proposal = proposals.find(p => p.id === proposalId);
    setSelectedProposal(proposal);
    setOriginalProposal(proposal);
    setShowModificationModal(true);
  };

  const handleViewComparison = (proposalId) => {
    setSelectedProposal(proposals.find(p => p.id === proposalId));
    setShowComparisonView(true);
  };

  const handleSaveModifications = (modifiedProposal) => {
    setProposals(prev => prev.map(proposal => 
      proposal.id === modifiedProposal.id 
        ? { ...modifiedProposal, isModified: true }
        : proposal
    ));
    setShowModificationModal(false);
    setSelectedProposal(null);
    setOriginalProposal(null);
  };

  const handleBulkAction = (action, selectedIds) => {
    if (action === 'approve') {
      setProposals(prev => prev.map(proposal => 
        selectedIds.includes(proposal.id) 
          ? { ...proposal, status: 'approved' }
          : proposal
      ));
    } else if (action === 'reject') {
      // Handle bulk reject
      console.log('Bulk reject:', selectedIds);
    }
  };

  const pendingCount = proposals.filter(p => p.status === 'pending').length;
  const approvedCount = proposals.filter(p => p.status === 'approved').length;
  const rejectedCount = proposals.filter(p => p.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedHeader 
        userRole="admin" 
        userName="Supervisor"
      />
      
      <SecureLogoutComponent
        sessionTimeout={1800000}
        warningTime={300000}
        showInactivityWarning={true}
        onLogout={handleLogout}
      />

      <main className="pt-16">
        <div className="mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 max-w-7xl">
          <NavigationBreadcrumb
            customBreadcrumbs={[
              { label: 'Persetujuan Evaluator', path: '/supervisor-approval', isActive: true }
            ]}
          />

          <div className="mt-6 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-semibold text-foreground mb-2">
                  Persetujuan Usulan Evaluator
                </h1>
                <p className="text-sm md:text-base caption text-muted-foreground">
                  Tinjau dan setujui proposal evaluator yang diajukan oleh pegawai
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{pendingCount}</div>
                  <div className="text-xs text-muted-foreground">Menunggu</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{approvedCount}</div>
                  <div className="text-xs text-muted-foreground">Disetujui</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-error">{rejectedCount}</div>
                  <div className="text-xs text-muted-foreground">Ditolak</div>
                </div>
              </div>
            </div>

            <WorkflowProgressIndicator 
              currentStep={2}
              totalSteps={3}
              steps={[
                { id: 1, title: 'Usulan Evaluator', status: 'completed' },
                { id: 2, title: 'Persetujuan Atasan', status: 'in_progress' },
                { id: 3, title: 'Penilaian Kinerja', status: 'pending' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  isExpanded={expandedCards[proposal.id]}
                  onToggleExpansion={() => toggleCardExpansion(proposal.id)}
                  onApprove={() => handleApprove(proposal.id)}
                  onReject={() => handleReject(proposal.id)}
                  onModify={() => handleModify(proposal.id)}
                  onViewComparison={() => handleViewComparison(proposal.id)}
                />
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <BulkActionPanel 
                proposals={proposals}
                onBulkAction={handleBulkAction}
              />
              
              <WeightCalculationPreview 
                proposals={proposals}
              />

              {/* Summary Stats */}
              <div className="card">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                  Ringkasan Evaluator
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Evaluator</span>
                    <span className="text-sm font-medium">{proposals.reduce((acc, p) => acc + p.evaluators.length, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rata-rata per Kategori</span>
                    <span className="text-sm font-medium">{Math.round(proposals.reduce((acc, p) => acc + p.evaluators.length, 0) / proposals.length)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Bobot Total</span>
                    <span className="text-sm font-medium">{proposals.reduce((acc, p) => acc + p.weight, 0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modals */}
          {showModificationModal && selectedProposal && (
            <ModificationModal
              proposal={selectedProposal}
              originalProposal={originalProposal}
              onSave={handleSaveModifications}
              onClose={() => {
                setShowModificationModal(false);
                setSelectedProposal(null);
                setOriginalProposal(null);
              }}
            />
          )}

          {showRejectionModal && selectedProposal && (
            <RejectionModal
              proposal={selectedProposal}
              onConfirm={(reason) => {
                setProposals(prev => prev.map(proposal => 
                  proposal.id === selectedProposal.id 
                    ? { ...proposal, status: 'rejected', rejectionReason: reason }
                    : proposal
                ));
                setShowRejectionModal(false);
                setSelectedProposal(null);
              }}
              onClose={() => {
                setShowRejectionModal(false);
                setSelectedProposal(null);
              }}
            />
          )}

          {showComparisonView && selectedProposal && (
            <ComparisonView
              proposal={selectedProposal}
              onClose={() => {
                setShowComparisonView(false);
                setSelectedProposal(null);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default SupervisorApproval;