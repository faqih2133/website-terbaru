
class EvaluationWeightingSystem {
  constructor() {
    this.supervisoryWeights = {
      complete: { supervisor: 60, peers: 15, subordinates: 25 },
      noSupervisor: { supervisor: 0, peers: 40, subordinates: 60 },
      noPeers: { supervisor: 70, peers: 0, subordinates: 30 },
      noSubordinates: { supervisor: 80, peers: 20, subordinates: 0 },
      noSupervisorPeers: { supervisor: 0, peers: 0, subordinates: 100 },
      noSupervisorSubordinates: { supervisor: 0, peers: 100, subordinates: 0 },
      noPeersSubordinates: { supervisor: 100, peers: 0, subordinates: 0 }
    };

    this.nonSupervisoryWeights = {
      complete: { supervisor: 60, peers: 40, subordinates: 0 },
      noSupervisor: { supervisor: 0, peers: 100, subordinates: 0 },
      noPeers: { supervisor: 100, peers: 0, subordinates: 0 }
    };
  }

  determineCondition(hasSupervisor, hasPeers, hasSubordinates, isSupervisory = true) {
    if (isSupervisory) {
      if (hasSupervisor && hasPeers && hasSubordinates) return 'complete';
      if (!hasSupervisor && hasPeers && hasSubordinates) return 'noSupervisor';
      if (hasSupervisor && !hasPeers && hasSubordinates) return 'noPeers';
      if (hasSupervisor && hasPeers && !hasSubordinates) return 'noSubordinates';
      if (!hasSupervisor && !hasPeers && hasSubordinates) return 'noSupervisorPeers';
      if (!hasSupervisor && hasPeers && !hasSubordinates) return 'noSupervisorSubordinates';
      if (hasSupervisor && !hasPeers && !hasSubordinates) return 'noPeersSubordinates';
    } else {
      if (hasSupervisor && hasPeers) return 'complete';
      if (!hasSupervisor && hasPeers) return 'noSupervisor';
      if (hasSupervisor && !hasPeers) return 'noPeers';
    }
    
    return 'complete'; 
  }
}

const weightingSystem = new EvaluationWeightingSystem();

function calculateNPKDetails(assessmentData) {
    const { evaluators, scores } = assessmentData;
    
    // Simulate line 185
    const is_supervisory = assessmentData.is_supervisory !== undefined ? assessmentData.is_supervisory : true;

    if (!evaluators || !scores) {
      return null;
    }

    const evaluatorGroups = {
      supervisor: [],
      peers: [],
      subordinates: []
    };

    evaluators.forEach(evaluator => {
      const role = (evaluator.role || evaluator.category || '').toLowerCase();
      
      if (role === 'supervisor' || role === 'atasan' || role === 'admin' || role.includes('supervi')) {
        evaluatorGroups.supervisor.push(evaluator);
      } else if (role === 'peer' || role === 'rekan' || role === 'sejawat' || role.includes('peer')) {
        evaluatorGroups.peers.push(evaluator);
      } else if (role === 'subordinate' || role === 'bawahan' || role === 'staf' || role.includes('subordinat')) {
        evaluatorGroups.subordinates.push(evaluator);
      }
    });

    const hasSupervisor = evaluatorGroups.supervisor.length > 0;
    const hasPeers = evaluatorGroups.peers.length > 0;
    const hasSubordinates = evaluatorGroups.subordinates.length > 0;
    
    const condition = weightingSystem.determineCondition(hasSupervisor, hasPeers, hasSubordinates, is_supervisory);
    
    let weights = is_supervisory ? 
      weightingSystem.supervisoryWeights[condition] : 
      weightingSystem.nonSupervisoryWeights[condition];

    if (!weights) {
      console.log(`⚠️ Warning: No weights found for condition '${condition}' (is_supervisory: ${is_supervisory}). Using defaults.`);
      if (hasPeers && !hasSupervisor && !hasSubordinates) {
         weights = { supervisor: 0, peers: 100, subordinates: 0 };
      } else {
         weights = { supervisor: 0, peers: 0, subordinates: 0 };
      }
    }

    return {
        weights,
        condition,
        groups: {
            supervisor: evaluatorGroups.supervisor.length,
            peers: evaluatorGroups.peers.length,
            subordinates: evaluatorGroups.subordinates.length
        }
    };
}

// Test Case: Hanya Peers (Rekan)
const evaluators = [
  { role: 'Rekan', name: 'Teman 1', scores: { berorientasi_pelayanan: 90 } }
];

// Panggil fungsi langsung (bukan via service karena ini file test standalone)
const result = calculateNPKDetails({ 
  evaluators, 
  scores: { berorientasi_pelayanan: 90 },
  is_supervisory: true 
});

console.log('Result:', JSON.stringify(result, null, 2));
