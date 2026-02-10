// Service untuk mengelola data penilaian
class EvaluationService {
  constructor() {
    this.storageKey = 'evaluationData';
    this.proposalsKey = 'evaluationProposals';
    this.assignmentsKey = 'evaluatorAssignments';
    this.weightingSystem = new EvaluationWeightingSystem();
  }

  // ✅ FUNGSI UNTUK MENGELOLA ASSIGNMENTS (Admin Assign Evaluee to Evaluator)
  getAllAssignments() {
    try {
      const data = localStorage.getItem(this.assignmentsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Failed to get assignments:', error);
      return [];
    }
  }

  getAssignmentsForEvaluator(evaluatorId) {
    const allAssignments = this.getAllAssignments();
    // Cari assignment untuk evaluator ini
    const assignment = allAssignments.find(a => String(a.evaluatorId) === String(evaluatorId));
    return assignment ? assignment.evalueeIds : [];
  }

  saveAssignment(evaluatorId, evalueeIds) {
    try {
      const allAssignments = this.getAllAssignments();
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const evalueeSnaps = (evalueeIds || []).map((id) => {
        const emp = employees.find(e => String(e.id) === String(id)) || {};
        return {
          id: String(emp.id || id),
          nip: emp.nip || '',
          nama: emp.nama || emp.name || '',
          jabatan: emp.jabatan || emp.position || ''
        };
      });
      const existingIndex = allAssignments.findIndex(a => String(a.evaluatorId) === String(evaluatorId));
      
      if (existingIndex !== -1) {
        allAssignments[existingIndex].evalueeIds = evalueeIds;
        allAssignments[existingIndex].evalueeSnaps = evalueeSnaps;
        allAssignments[existingIndex].updatedAt = new Date().toISOString();
      } else {
        allAssignments.push({
          id: `assign_${Date.now()}`,
          evaluatorId: evaluatorId,
          evalueeIds: evalueeIds,
          evalueeSnaps: evalueeSnaps,
          updatedAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem(this.assignmentsKey, JSON.stringify(allAssignments));
      console.log(`✅ Saved ${evalueeIds.length} assignments for evaluator ${evaluatorId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to save assignment:', error);
      return false;
    }
  }

  // ✅ FUNGSI UNTUK MENGELOLA EVALUATIONS
  getAllEvaluations() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Failed to get evaluations:', error);
      return [];
    }
  }

  // ✅ FUNGSI UNTUK MENGELOLA PROPOSALS
  getAllProposals() {
    try {
      const data = localStorage.getItem(this.proposalsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Failed to get proposals:', error);
      return [];
    }
  }

  saveProposal(proposalData) {
    try {
      const proposals = this.getAllProposals();
      const newProposal = {
        id: `prop_${Date.now()}`,
        ...proposalData,
        status: 'pending_approval',
        submitted_date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      proposals.push(newProposal);
      localStorage.setItem(this.proposalsKey, JSON.stringify(proposals));
      
      console.log('✅ Proposal saved:', newProposal);
      return newProposal;
    } catch (error) {
      console.error('❌ Failed to save proposal:', error);
      throw error;
    }
  }

  updateProposalStatus(proposalId, newStatus, additionalData = {}) {
    try {
      const proposals = this.getAllProposals();
      const proposalIndex = proposals.findIndex(p => p.id === proposalId);
      
      if (proposalIndex !== -1) {
        proposals[proposalIndex] = {
          ...proposals[proposalIndex],
          status: newStatus,
          ...additionalData,
          updatedAt: new Date().toISOString()
        };
        
        localStorage.setItem(this.proposalsKey, JSON.stringify(proposals));
        console.log('✅ Proposal status updated:', proposalId, newStatus);
        return proposals[proposalIndex];
      }
      
      throw new Error('Proposal not found');
    } catch (error) {
      console.error('❌ Failed to update proposal status:', error);
      throw error;
    }
  }

  // ✅ SISTEM PEMBOBOTAN ASN BerAKHLAK - DIUBAH KE 0-100
  calculateFinalWeightedScore(evaluators, isSupervisory = true) {
    return this.weightingSystem.calculateWeightedScore(evaluators, isSupervisory);
  }

  // Dapatkan informasi pembobotan
  getWeightingInfo(condition, isSupervisory = true) {
    return this.weightingSystem.getWeightingInfo(condition, isSupervisory);
  }

  // ✅ FUNGSI BARU: HITUNG INDEKS CAPAIAN NPK PER CORE VALUE
  // Rumus: Indeks Capaian NPK = (NPK_atasan × Bobot_atasan) + (NPK_peers × Bobot_peers) + (NPK_bawahan × Bobot_bawahan) / 100%
  calculateAspectIndex(npkAtasan, npkPeers, npkBawahan, weights) {
    // Validasi input untuk mencegah NaN
    const nAtasan = Number(npkAtasan) || 0;
    const nPeers = Number(npkPeers) || 0;
    const nBawahan = Number(npkBawahan) || 0;
    const wAtasan = Number(weights?.supervisor) || 0;
    const wPeers = Number(weights?.peers) || 0;
    const wBawahan = Number(weights?.subordinates) || 0;

    const indeksCapaian = (
      (nAtasan * wAtasan / 100) +
      (nPeers * wPeers / 100) +
      (nBawahan * wBawahan / 100)
    );

    // FIX: Jangan dibulatkan 1 desimal, gunakan nilai real (2 desimal presisi) sesuai request user
    return Number(indeksCapaian.toFixed(2));
  }

  // ✅ FUNGSI BARU: HITUNG NPK PERIODIK
  // Rumus: NPK Periodik = Σ Indeks Capaian NPK_i / n
  // Dimana n = jumlah Core Value yang dinilai
  calculateNPKPeriodik(aspectIndices) {
    if (!aspectIndices || aspectIndices.length === 0) return 0;
    
    const sum = aspectIndices.reduce((total, index) => total + index, 0);
    const npkPeriodik = sum / aspectIndices.length;
    
    // FIX: Jangan dibulatkan 1 desimal, gunakan nilai real (2 desimal presisi)
    return Number(npkPeriodik.toFixed(2));
  }

  // ✅ FUNGSI BARU: HITUNG DETAIL PERHITUNGAN NPK
  calculateNPKDetails(assessmentData, scale) { // Menambahkan parameter 'scale'
    const { evaluators, scores } = assessmentData;
    
    // Fix: Ensure is_supervisory is boolean and has a default (true)
    // This prevents mismatch between determineCondition (default true) and weight selection
    const is_supervisory = assessmentData.is_supervisory !== undefined ? assessmentData.is_supervisory : true;

    if (!evaluators || !scores) {
      return null;
    }

    // Kelompokkan evaluator berdasarkan role
    const evaluatorGroups = {
      supervisor: [],
      peers: [],
      subordinates: []
    };

    evaluators.forEach(evaluator => {
      const roleRaw = (evaluator.role || evaluator.category || '').toLowerCase();
      const evalPos = (evaluator.jabatan || evaluator.position || '').toLowerCase();
      const evalueePos = (assessmentData.evaluee_position || '').toLowerCase();
      const isEvalSupervised = evalPos.includes('supervisi') && !evalPos.includes('tanpa supervisi');
      const isEvalueeSupervised = evalueePos.includes('supervisi') && !evalueePos.includes('tanpa supervisi');
      let role = roleRaw;
      if (!role || role === 'evaluator' || role === 'peer') {
        if (isEvalSupervised && !isEvalueeSupervised) {
          role = 'supervisor';
        } else if (!isEvalSupervised && isEvalueeSupervised) {
          role = 'subordinate';
        } else {
          const getLevel = (p) => {
            if (p.includes('direktur') || p.includes('kepala pusat') || p.includes('kepala badan') || p.includes('sekretaris')) return 4;
            if (p.includes('kepala') || p.includes('manajer') || (p.includes('supervisi') && !p.includes('tanpa supervisi')) || p.includes('ketua') || p.includes('koordinator')) return 3;
            if (p.includes('fungsional') || p.includes('ahli') || p.includes('penyelia') || p.includes('senior') || p.includes('muda') || p.includes('madya') || p.includes('utama')) return 2;
            return 1;
          };
          const myLevel = getLevel(evalPos);
          const targetLevel = getLevel(evalueePos);
          if (myLevel > targetLevel) role = 'supervisor';
          else if (myLevel < targetLevel) role = 'subordinate';
          else role = 'peer';
        }
      }
      if (role === 'supervisor' || role === 'atasan' || role === 'admin' || role.includes('supervi')) {
        evaluatorGroups.supervisor.push(evaluator);
      } else if (role === 'peer' || role === 'rekan' || role === 'sejawat' || role.includes('peer')) {
        evaluatorGroups.peers.push(evaluator);
      } else if (role === 'subordinate' || role === 'bawahan' || role === 'staf' || role.includes('subordinat')) {
        evaluatorGroups.subordinates.push(evaluator);
      }
    });

    // Tentukan bobot berdasarkan kondisi
    const hasSupervisor = evaluatorGroups.supervisor.length > 0;
    const hasPeers = evaluatorGroups.peers.length > 0;
    const hasSubordinates = evaluatorGroups.subordinates.length > 0;
    
    const condition = this.weightingSystem.determineCondition(hasSupervisor, hasPeers, hasSubordinates, is_supervisory);
    
    // Safety check for weights
    let weights = is_supervisory ? 
      this.weightingSystem.supervisoryWeights[condition] : 
      this.weightingSystem.nonSupervisoryWeights[condition];

    // Fallback if weights are undefined (e.g. condition mismatch)
    if (!weights) {
      console.warn(`⚠️ Warning: No weights found for condition '${condition}' (is_supervisory: ${is_supervisory}). Using defaults.`);
      if (hasPeers && !hasSupervisor && !hasSubordinates) {
         weights = { supervisor: 0, peers: 100, subordinates: 0 };
      } else {
         // Default to complete weights if no other condition matches, assuming data might be partial
         weights = is_supervisory ? 
            { supervisor: 60, peers: 15, subordinates: 25 } : 
            { supervisor: 60, peers: 40, subordinates: 0 };
      }
    }

    // Daftar core values berdasarkan struktur data dan skala
    const safeScale = Number(scale);
    let coreValueKeys;
    
    if (safeScale === 120) {
      // TOOL 1: 8 Aspek (Pecah gabungan)
      coreValueKeys = [
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
      // TOOL 2: Standard (Gabungan)
      coreValueKeys = [
        'berorientasi_pelayanan',
        'akuntabel_loyal',
        'kompeten',
        'kolaboratif_harmonis',
        'adaptif',
        'kepemimpinan'
      ];
    }

    // Hitung Indeks Capaian NPK untuk setiap core value
    const aspectIndices = [];
    const aspectDetails = [];

    coreValueKeys.forEach((key) => {
      // Helper to find score in object using multiple possible keys
      const findScore = (scoreObj) => {
        if (!scoreObj) return undefined;
        // Cek key tunggal dulu
        if (scoreObj[key] !== undefined) return scoreObj[key];
        
        // Handle Request for Combined Key (Merge Separated Scores if available)
        if (key === 'akuntabel_loyal') {
           const v1 = scoreObj['akuntabel'];
           const v2 = scoreObj['loyal'];
           if (v1 !== undefined && v2 !== undefined) return (Number(v1) + Number(v2)) / 2;
           if (v1 !== undefined) return v1;
           if (v2 !== undefined) return v2;
           // Check legacy keys
           if (scoreObj['akuntabel_loyal'] !== undefined) return scoreObj['akuntabel_loyal'];
           if (scoreObj['akuntabel_&_loyal'] !== undefined) return scoreObj['akuntabel_&_loyal'];
        }
        if (key === 'kolaboratif_harmonis') {
           const v1 = scoreObj['kolaboratif'];
           const v2 = scoreObj['harmonis'];
           if (v1 !== undefined && v2 !== undefined) return (Number(v1) + Number(v2)) / 2;
           if (v1 !== undefined) return v1;
           if (v2 !== undefined) return v2;
           // Check legacy keys
           if (scoreObj['kolaboratif_harmonis'] !== undefined) return scoreObj['kolaboratif_harmonis'];
           if (scoreObj['kolaboratif_&_harmonis'] !== undefined) return scoreObj['kolaboratif_&_harmonis'];
        }

        // Fallback ke gabungan HANYA jika tunggal tidak ada (backward compatibility untuk data lama)
        if (key === 'kolaboratif' || key === 'harmonis') {
           if (scoreObj['kolaboratif_harmonis'] !== undefined) return scoreObj['kolaboratif_harmonis'];
           if (scoreObj['kolaboratif_&_harmonis'] !== undefined) return scoreObj['kolaboratif_&_harmonis'];
           if (scoreObj['Kolaboratif & Harmonis'] !== undefined) return scoreObj['Kolaboratif & Harmonis'];
        }
        if (key === 'akuntabel' || key === 'loyal') {
           if (scoreObj['akuntabel_loyal'] !== undefined) return scoreObj['akuntabel_loyal'];
           if (scoreObj['akuntabel_&_loyal'] !== undefined) return scoreObj['akuntabel_&_loyal'];
           if (scoreObj['Akuntabel & Loyal'] !== undefined) return scoreObj['Akuntabel & Loyal'];
        }
        
        return undefined;
      };

      // Hitung rata-rata skor dari evaluator untuk core value ini
      let npkAtasan = 0, npkPeers = 0, npkBawahan = 0;
      let countAtasan = 0, countPeers = 0, countBawahan = 0;

      // Hitung NPK dari setiap kategori evaluator
      evaluatorGroups.supervisor.forEach(evaluator => {
        const val = findScore(evaluator.scores);
        if (val !== undefined) {
          npkAtasan += val;
          countAtasan++;
        }
      });

      evaluatorGroups.peers.forEach(evaluator => {
        const val = findScore(evaluator.scores);
        if (val !== undefined) {
          npkPeers += val;
          countPeers++;
        }
      });

      evaluatorGroups.subordinates.forEach(evaluator => {
        const val = findScore(evaluator.scores);
        if (val !== undefined) {
          npkBawahan += val;
          countBawahan++;
        }
      });

      // Hitung rata-rata jika ada evaluator
      npkAtasan = countAtasan > 0 ? npkAtasan / countAtasan : 0;
      npkPeers = countPeers > 0 ? npkPeers / countPeers : 0;
      npkBawahan = countBawahan > 0 ? npkBawahan / countBawahan : 0;

      // Fallback ke aggregate scores jika detail evaluator kosong
      if (countAtasan === 0 && countPeers === 0 && countBawahan === 0) {
         const val = findScore(scores);
         // Jika ada nilai di aggregate tapi tidak ada detail evaluator (manual input/legacy data),
         // gunakan nilai tersebut untuk semua komponen agar hasil akhirnya sama dengan nilai aggregate.
         if (val !== undefined && val !== null) { 
           const numVal = Number(val);
           // Assign to the component that matches the current evaluator's role if possible,
           // or distribute based on weights if we want to simulate a full score.
           // However, if we are in "single evaluator mode" (e.g. self-evaluation view or partial view),
           // we should assign it to the correct bucket.
           
           // Check if we can infer role from weights? No, weights depend on role availability.
           // Let's check 'evaluatorGroups' original structure.
           // If 'scores' came from a single evaluator input (like BehavioralAssessmentModern), 
           // we need to know WHICH role that evaluator had.
           
           // In BehavioralAssessmentModern, we pass 'evaluators' array with 1 item.
           // If that array was populated correctly, 'countAtasan/Peers/Bawahan' should be > 0.
           // If they are 0, it means the evaluator loop above didn't match any role.
           
           // Let's re-examine the loop logic.
           // evaluators.forEach(evaluator => {
           //   if (evaluator.role === 'supervisor' ...)
           // })
           
           // If the input 'evaluators' has items but counts are 0, then roles didn't match.
           // This is a likely bug source.
           // Let's force assignment if we have evaluators but no match.
           
           if (evaluators && evaluators.length > 0) {
              const firstEval = evaluators[0];
              const role = firstEval.role || firstEval.category;
              
              if (role === 'supervisor' || role === 'admin') {
                 npkAtasan = numVal; countAtasan = 1;
              } else if (role === 'peer') {
                 npkPeers = numVal; countPeers = 1;
              } else if (role === 'subordinate' || role === 'evaluee') { // 'evaluee' role usually means self/subordinate context in some systems
                 npkBawahan = numVal; countBawahan = 1;
              } else {
                 // Default fallback if role is unknown or 'evaluator'
                 // Try to guess based on weights availability? No.
                 // Just assign to Peers as safe default? Or distribute?
                 // Let's assign to all to be safe for "Preview" mode so it doesn't show 0.
                 npkAtasan = numVal; countAtasan = 1;
                 npkPeers = numVal; countPeers = 1;
                 npkBawahan = numVal; countBawahan = 1;
              }
           } else {
               // Truly no evaluators (manual raw input)
               npkAtasan = numVal; 
               npkPeers = numVal; 
               npkBawahan = numVal; 
               
               // Set count dummy agar statistik tidak kosong
               countAtasan = hasSupervisor ? 1 : 0;
               countPeers = hasPeers ? 1 : 0;
               countBawahan = hasSubordinates ? 1 : 0;
               
               if (!hasSupervisor && !hasPeers && !hasSubordinates) {
                 countAtasan = 1; // Default
               }
           }
         } 
      }

      // Hitung Indeks Capaian NPK untuk core value ini
      const indeksCapaian = this.calculateAspectIndex(npkAtasan, npkPeers, npkBawahan, weights);
      
      aspectIndices.push(indeksCapaian);
      aspectDetails.push({
        coreValue: key,
        name: this.getCoreValueName(key, scale),
        indeksCapaian: indeksCapaian,
        breakdown: {
          npkAtasan: Number(npkAtasan.toFixed(2)),
          npkPeers: Number(npkPeers.toFixed(2)),
          npkBawahan: Number(npkBawahan.toFixed(2)),
          weights: weights,
          countAtasan,
          countPeers,
          countBawahan,
          totalAtasan: evaluatorGroups.supervisor.length,
          totalPeers: evaluatorGroups.peers.length,
          totalBawahan: evaluatorGroups.subordinates.length
        }
      });
    });

    // Hitung NPK Periodik
    const npkPeriodik = this.calculateNPKPeriodik(aspectIndices);

    return {
      npkPeriodik: npkPeriodik,
      aspectDetails: aspectDetails,
      weights: weights,
      condition: condition,
      totalCoreValues: aspectIndices.length,
      calculation: {
        formula: 'NPK Periodik = Σ Indeks Capaian NPK_i / n',
        description: `n = ${aspectIndices.length} (jumlah Core Value yang dinilai)`,
        aspectIndices: aspectIndices,
        sum: aspectIndices.reduce((a, b) => a + b, 0)
      }
    };
  }

  // ✅ HELPER: GET CORE VALUE NAME
  getCoreValueName(key, scale) { // Menambahkan parameter 'scale'
    // UPDATE: Gunakan mapping yang konsisten dengan Combined Keys
    const names = {
      berorientasi_pelayanan: 'Berorientasi Pelayanan',
      kompeten: 'Kompeten',
      harmonis: 'Harmonis',
      loyal: 'Loyal',
      adaptif: 'Adaptif',
      kolaboratif: 'Kolaboratif',
      akuntabel: 'Akuntabel',
      kolaboratif_harmonis: 'Kolaboratif & Harmonis',
      akuntabel_loyal: 'Akuntabel & Loyal',
      kepemimpinan: 'Kepemimpinan'
    };
    return names[key] || key;
    
    // OLD CODE REMOVED
    // const names100 = { ... };
    // const names120 = { ... };
    // return scale === 100 ? (names100[key] || key) : (names120[key] || key);
  }

  // ✅ FUNGSI BARU: HITUNG RATING ASPEK PERILAKU KERJA
  calculateAspectRating(aspectScore, scale) {
    const score = Number(aspectScore);
    const safeScale = Number(scale);
    
    let rating = '';
    let parameter = '';
    let color = '';
    let bgColor = '';
    
    if (safeScale === 120) {
        // TOOL 1 (Scale 120) - Sesuai Panduan
        if (score > 115) {
            rating = 'Di Atas Ekspektasi';
            parameter = 'Menerapkan minimal 4 perilaku kunci dan mampu menjadi teladan yang memberi pengaruh positif';
            color = 'text-green-700';
            bgColor = 'bg-green-100';
        } else if (score > 105) {
            rating = 'Di Atas Ekspektasi';
            parameter = 'Menerapkan minimal 4 perilaku kunci';
            color = 'text-blue-700';
            bgColor = 'bg-blue-100';
        } else if (score > 100) {
            rating = 'Di Atas Ekspektasi';
            parameter = 'Menerapkan minimal 3 perilaku kunci';
            color = 'text-cyan-700';
            bgColor = 'bg-cyan-100';
        } else if (score >= 95) {
            rating = 'Sesuai Ekspektasi';
            parameter = 'Menerapkan minimal 2 perilaku kunci';
            color = 'text-yellow-700';
            bgColor = 'bg-yellow-100';
        } else if (score >= 90) {
            rating = 'Sesuai Ekspektasi';
            parameter = 'Menerapkan minimal 1 perilaku kunci';
            color = 'text-orange-700';
            bgColor = 'bg-orange-100';
        } else if (score >= 70) {
            rating = 'Di Bawah Ekspektasi';
            parameter = 'Tidak ada perilaku kunci yang diterapkan';
            color = 'text-red-700';
            bgColor = 'bg-red-100';
        } else {
            rating = 'Di Bawah Ekspektasi';
            parameter = 'Terdapat hukuman disiplin';
            color = 'text-purple-700';
            bgColor = 'bg-purple-100';
        }
    } else {
        // TOOL 2 (Scale 100) - Sesuai Panduan
        if (score >= 98) {
            rating = 'Di Atas Ekspektasi';
            parameter = 'Menerapkan minimal 7 perilaku kunci dan mendapatkan penghargaan';
            color = 'text-green-700';
            bgColor = 'bg-green-100';
        } else if (score >= 96) {
            rating = 'Di Atas Ekspektasi';
            parameter = 'Menerapkan minimal 6 perilaku kunci';
            color = 'text-blue-700';
            bgColor = 'bg-blue-100';
        } else if (score >= 94) {
            rating = 'Di Atas Ekspektasi';
            parameter = 'Menerapkan minimal 5 perilaku kunci';
            color = 'text-cyan-700';
            bgColor = 'bg-cyan-100';
        } else if (score >= 92) {
            rating = 'Sesuai Ekspektasi';
            parameter = 'Menerapkan minimal 4 perilaku kunci';
            color = 'text-yellow-700';
            bgColor = 'bg-yellow-100';
        } else if (score >= 90) {
            rating = 'Sesuai Ekspektasi';
            parameter = 'Menerapkan minimal 3 perilaku kunci';
            color = 'text-orange-700';
            bgColor = 'bg-orange-100';
        } else if (score >= 70) {
            rating = 'Di Bawah Ekspektasi';
            parameter = 'Menerapkan minimal 2 perilaku kunci';
            color = 'text-red-700';
            bgColor = 'bg-red-100';
        } else {
            rating = 'Di Bawah Ekspektasi';
            parameter = 'Dijatuhi hukuman disiplin';
            color = 'text-purple-700';
            bgColor = 'bg-purple-100';
        }
    }
    
    return {
        rating: rating,
        description: parameter,
        color,
        bgColor
    };
  }

  // ✅ FUNGSI BARU: HITUNG RATING PERILAKU KERJA (NPK)
  calculateOverallRating(npkScore, aspectScores, scale) {
    const score = Number(npkScore);
    const safeScale = Number(scale);
    
    // Reuse logic from aspect rating since the ranges are the same for the final score in the table
    // The table is "Tabel panduan Penilaian Perilaku Kerja", which applies to the final rating logic as well.
    return this.calculateAspectRating(score, safeScale);
  }

  // ✅ KEBUTUHAN MINIMAL PERILAKU KUNCI BERDASARKAN RENTANG NILAI
  getKeyBehaviorRequirement(npkScore, scale) {
    const s = Number(npkScore);
    const sc = Number(scale);
    if (sc === 120) {
      if (s > 115) return { min: 4, nextMin: null, category: 'Di Atas Ekspektasi' };
      if (s > 105) return { min: 4, nextMin: 0, category: 'Di Atas Ekspektasi' };
      if (s > 100) return { min: 3, nextMin: 4, category: 'Di Atas Ekspektasi' };
      if (s >= 95) return { min: 2, nextMin: 3, category: 'Sesuai Ekspektasi' };
      if (s >= 90) return { min: 1, nextMin: 2, category: 'Sesuai Ekspektasi' };
      if (s >= 70) return { min: 0, nextMin: 1, category: 'Di Bawah Ekspektasi' };
      return { min: 0, nextMin: null, category: 'Di Bawah Ekspektasi (Hukuman Disiplin)' };
    } else {
      if (s >= 98) return { min: 7, nextMin: null, category: 'Di Atas Ekspektasi' };
      if (s >= 96) return { min: 6, nextMin: 7, category: 'Di Atas Ekspektasi' };
      if (s >= 94) return { min: 5, nextMin: 6, category: 'Di Atas Ekspektasi' };
      if (s >= 92) return { min: 4, nextMin: 5, category: 'Sesuai Ekspektasi' };
      if (s >= 90) return { min: 3, nextMin: 4, category: 'Sesuai Ekspektasi' };
      if (s >= 70) return { min: 2, nextMin: 3, category: 'Di Bawah Ekspektasi' };
      return { min: 0, nextMin: null, category: 'Di Bawah Ekspektasi (Hukuman Disiplin)' };
    }
  }

  // ANALISIS: Penjelasan kenapa mendapatkan predikat (berdasarkan data)
  generatePredikatExplanation(npkScore, scale, calculation) {
    const sc = Number(scale);
    const overall = this.calculateOverallRating(npkScore, [], sc);
    const req = this.getKeyBehaviorRequirement(npkScore, sc);
    const aspects = calculation?.aspectDetails || [];
    const weights = calculation?.weights || { supervisor: 0, peers: 0, subordinates: 0 };

    // Temukan aspek terlemah & terkuat
    const sortedByScore = aspects.slice().sort((a, b) => (a.indeksCapaian || 0) - (b.indeksCapaian || 0));
    const weakest = sortedByScore.slice(0, 2).map(a => ({ name: this.getCoreValueName(a.coreValue || a.name, sc), v: Number(a.indeksCapaian || 0).toFixed(2) }));
    const strongest = sortedByScore.slice(-2).map(a => ({ name: this.getCoreValueName(a.coreValue || a.name, sc), v: Number(a.indeksCapaian || 0).toFixed(2) })).reverse();

    // Ringkas kontribusi kategori (rata aspek)
    const avg = (arr) => arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length) : 0;
    const avgAtasan = avg(aspects.map(a => a.breakdown?.npkAtasan || 0)).toFixed(2);
    const avgPeers = avg(aspects.map(a => a.breakdown?.npkPeers || 0)).toFixed(2);
    const avgBawahan = avg(aspects.map(a => a.breakdown?.npkBawahan || 0)).toFixed(2);

    // Tentukan kategori yang paling menekan nilai (terendah dibobot)
    const weighted = [
      { k: 'Atasan', val: Number(avgAtasan) * (weights.supervisor || 0) },
      { k: 'Peers', val: Number(avgPeers) * (weights.peers || 0) },
      { k: 'Bawahan', val: Number(avgBawahan) * (weights.subordinates || 0) }
    ].sort((a, b) => a.val - b.val)[0]?.k;

    const weakText = weakest.length ? `Aspek paling lemah: ${weakest.map(w => `${w.name} (${w.v})`).join(', ')}. ` : '';
    const strongText = strongest.length ? `Aspek yang sudah kuat: ${strongest.map(s => `${s.name} (${s.v})`).join(', ')}. ` : '';
    const catText = `Rata kontribusi kategori (A/P/B): ${avgAtasan}/${avgPeers}/${avgBawahan}. Faktor yang paling menekan nilai: ${weighted}. `;
    const nextText = typeof req.nextMin === 'number' ? `Fokuskan peningkatan perilaku kunci pada aspek lemah untuk memenuhi ≥ ${req.min} dan menuju kategori berikutnya.` : 'Sudah berada pada kategori puncak untuk kondisi saat ini.';

    return `Predikat ${overall.rating} karena komposisi nilai antar aspek dan kontribusi kategori evaluator. ${weakText}${strongText}${catText}${nextText}`;
  }

  // ✅ EXPLANATION: Jelaskan alasan Predikat berdasarkan data
  generatePredikatExplanation(npkScore, scale, calculation) {
    const safeScale = Number(scale);
    const overall = this.calculateOverallRating(npkScore, [], safeScale);
    const req = this.getKeyBehaviorRequirement(npkScore, safeScale);
    const weights = calculation?.weights || { supervisor: 60, peers: 25, subordinates: 15 };
    const condition = calculation?.condition || 'Default';
    const aspects = calculation?.aspectDetails || [];
    
    const topAspects = aspects
      .slice()
      .sort((a, b) => (b.indeksCapaian || 0) - (a.indeksCapaian || 0))
      .slice(0, 2)
      .map(a => this.getCoreValueName(a.coreValue || a.name, safeScale));

    const contrib = {
      atasan: Number(aspects.reduce((sum, a) => sum + (a.breakdown?.npkAtasan || 0), 0).toFixed(2)),
      peers: Number(aspects.reduce((sum, a) => sum + (a.breakdown?.npkPeers || 0), 0).toFixed(2)),
      bawahan: Number(aspects.reduce((sum, a) => sum + (a.breakdown?.npkBawahan || 0), 0).toFixed(2))
    };

    // Restore tool scale text
    const rangeText = safeScale === 120
      ? 'Panduan Tool 1 (Skala 120)'
      : 'Panduan Tool 2 (Skala 100)';

    const nextStep = typeof req.nextMin === 'number'
      ? `Untuk naik kategori, lengkapi ≥ ${req.nextMin} perilaku kunci (saat ini minimal ${req.min}).`
      : `Kategori tertinggi untuk rentang ini.`;

    return `Predikat ${overall.rating} karena NPK Periodik ${Number(npkScore).toFixed(2)} berada pada rentang ${rangeText}. ` +
      `Kebutuhan minimal perilaku kunci: ≥ ${req.min}. Kondisi: ` +
      `(Atasan ${weights.supervisor}% • Peers ${weights.peers}% • Bawahan ${weights.subordinates}%). ` +
      `Kontribusi terbesar dari aspek: ${topAspects.join(', ')}. ${nextStep}`;
  }

  // ✅ FUNGSI BARU: ANALISIS DETAIL PENILAIAN DENGAN RATING
  analyzeEvaluationWithRating(evaluationData) {
    const { scores, nilai_nkp, scale, is_supervisory } = evaluationData; // Menambahkan scale dan is_supervisory
    
    if (!scores || !nilai_nkp || !scale) {
      return null;
    }

    const safeScale = Number(scale);

    // Ambil daftar core value berdasarkan skala
    let coreValueKeys = safeScale === 100 ? [
      'berorientasi_pelayanan', 'akuntabel', 'kompeten', 'harmonis', 'loyal', 'adaptif', 'kolaboratif', 'kepemimpinan'
    ] : [
      'berorientasi_pelayanan', 'akuntabel', 'kompeten', 'harmonis', 'loyal', 'adaptif', 'kolaboratif', 'kepemimpinan'
    ];

    // Filter kepemimpinan logic removed to always show 6 aspects
    // if (!is_supervisory && safeScale !== 120) {
    //   coreValueKeys = coreValueKeys.filter(key => key !== 'kepemimpinan');
    // }

    // Helper untuk mapping skor jika key berbeda
    const findScore = (scoreObj, key) => {
      if (!scoreObj) return 0;
      let val = scoreObj[key];
      if (val !== undefined) return val;
      
      // Cek combined keys
      if (key === 'kolaboratif' || key === 'harmonis') val = scoreObj['kolaboratif_harmonis'];
      if (key === 'akuntabel' || key === 'loyal') val = scoreObj['akuntabel_loyal'];
      
      return val || 0;
    };

    const aspectScores = coreValueKeys.map(key => findScore(scores, key));

    // Hitung rating untuk setiap aspek
    const aspectRatings = aspectScores.map(score => ({
      score: Math.round(score * 10) / 10,
      ...this.calculateAspectRating(score, safeScale)
    }));

    // Hitung rating overall
    const overallRating = this.calculateOverallRating(nilai_nkp, aspectScores, safeScale);

    return {
      npk_score: Math.round(nilai_nkp * 10) / 10,
      overall_rating: overallRating,
      aspect_ratings: aspectRatings,
      aspects_below_expectation: aspectScores.filter(score => score < 90).length,
      aspect_names: coreValueKeys.map(key => this.getCoreValueName(key, scale)) // Menggunakan getCoreValueName dengan scale
    };
  }

  // Simpan data penilaian dengan perhitungan NPK sesuai rumus
  saveBehavioralAssessment(assessmentData) {
    try {
      // ✅ VALIDASI FIELD WAJIB
      if (!assessmentData.evaluee_nip || !assessmentData.evaluee_name || !assessmentData.evaluee_position) {
        throw new Error('Missing required fields: evaluee_nip, evaluee_name, evaluee_position');
      }
  
      // console.log('📋 VALIDATION PASSED - All required fields present');
  
      // ✅ HITUNG NPK PERIODIK BERDASARKAN RUMUS BARU, MENGGUNAKAN SKALA DARI ASSESSMENTDATA
      const safeScale = Number(assessmentData.scale);
      const npkCalculation = this.calculateNPKDetails(assessmentData, safeScale); // Meneruskan parameter scale
      const npkPeriodik = npkCalculation ? npkCalculation.npkPeriodik : 0;

      // FIX: Gunakan weighted scores (Indeks Capaian) untuk analisis rating, bukan raw scores
      // Sesuai request user: "ga ush pake itu pake yang indeks aa"
      const weightedScores = {};
      if (npkCalculation && npkCalculation.aspectDetails) {
        npkCalculation.aspectDetails.forEach(detail => {
          weightedScores[detail.coreValue] = detail.indeksCapaian;
        });
      }
  
      // ✅ BUAT NEW ENTRY DENGAN FIELD YANG BENAR
      const newEntry = {
        // Gunakan ID yang sama jika update (akan dihandle di logic penyimpanan) atau buat baru
        id: assessmentData.id || `eval_${Date.now()}`,
        
        // ✅ FIELD UNTUK ADMIN DASHBOARD
        nip: assessmentData.evaluee_nip,
        nama: assessmentData.evaluee_name,
        jabatan: assessmentData.evaluee_position || 'Tidak Diketahui',
        periode: assessmentData.evaluation_period,
        nilai_nkp: npkPeriodik, // ✅ NPK PERIODIK BERDASARKAN RUMUS
        status: assessmentData.isDraft ? 'Draft' : 'Selesai', // ✅ Handle status Draft
        
        // ✅ FIELD UNTUK BEHAVIORAL ASSESSMENT DETAIL
        evaluee_id: assessmentData.evaluee_id,
        evaluee_name: assessmentData.evaluee_name,
        evaluee_nip: assessmentData.evaluee_nip,
        evaluee_position: assessmentData.evaluee_position,
        evaluator_id: assessmentData.evaluator_id,
        evaluator_name: assessmentData.evaluator_name,
        evaluation_period: assessmentData.evaluation_period,
        is_supervisory: assessmentData.is_supervisory,
        
        // ✅ DATA PENILAIAN DETAIL
        scores: assessmentData.scores,
        raw_scores: assessmentData.raw_scores, // ✅ Simpan skor mentah per indikator
        comments: assessmentData.comments,
        evaluators: assessmentData.evaluators,
        scale: safeScale, // ✅ Pastikan skala ada di newEntry sebagai Number
        
        // ✅ DATA PERHITUNGAN NPK BARU
        npk_calculation: npkCalculation,
        
        // ✅ DATA RATING
        rating_analysis: this.analyzeEvaluationWithRating({
          scores: weightedScores, // FIX: Use weighted scores (Index) instead of raw scores
          nilai_nkp: npkPeriodik,
          scale: safeScale, // Meneruskan parameter scale ke analyzeEvaluationWithRating
          is_supervisory: assessmentData.is_supervisory // ✅ Pastikan is_supervisory diteruskan
        }),
        
        // ✅ TRACK SUBMISSION
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(), // ✅ Track update time
        can_update: true, // ✅ EVALUATOR BISA UPDATE
        
        createdAt: assessmentData.createdAt || new Date().toISOString(),
        is_completed: !assessmentData.isDraft
      };
  
      // ✅ TAMBAHKAN LOGGING UNTUK DEBUG
      // console.log('💾 SAVING ASSESSMENT DATA:', { ... });
  
      // ✅ SIMPAN KE LOCALSTORAGE DENGAN LOGIC UPSERT (UPDATE IF EXISTS)
      const existingData = this.getAllEvaluations();
      
      // Cari index data yang sama (Evaluee + Evaluator + Scale + Period)
      // FIX: Gunakan perbandingan yang lebih longgar (ID atau NIP) untuk mencegah duplikasi
      // Masalah user: Data baru tidak menimpa data lama (ghost data) karena NIP mungkin berbeda/missing
      const existingIndex = existingData.findIndex(item => 
        (String(item.evaluee_id) === String(newEntry.evaluee_id) || String(item.evaluee_nip) === String(newEntry.evaluee_nip)) &&
        String(item.evaluator_id) === String(newEntry.evaluator_id) &&
        Number(item.scale) === Number(newEntry.scale) &&
        item.evaluation_period === newEntry.evaluation_period
      );

      if (existingIndex !== -1) {
        // ✅ PROTEKSI: JANGAN TIMPA DATA 'SELESAI' DENGAN 'DRAFT'
        // Ini menangani race condition dimana auto-save berjalan setelah submit
        const existingItem = existingData[existingIndex];
        if (existingItem.status === 'Selesai' && newEntry.status === 'Draft') {
          console.warn('🛡️ Prevented overwriting COMPLETED assessment with DRAFT:', existingItem.id);
          try {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('evaluationDataUpdated', { detail: { id: existingItem.id, entry: existingItem } }));
            }
          } catch (e) {}
          return existingItem;
        }

        // Update existing entry
        console.log('♻️ Updating existing assessment:', existingData[existingIndex].id);
        // Pertahankan ID lama dan createdAt
        newEntry.id = existingData[existingIndex].id;
        newEntry.createdAt = existingData[existingIndex].createdAt;
        existingData[existingIndex] = newEntry;
      } else {
        // Insert new entry
        console.log('✨ Creating new assessment entry');
        existingData.push(newEntry);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(existingData));
      
      try {
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('evaluationDataUpdated', { detail: { id: newEntry.id, entry: newEntry } }));
        }
      } catch (e) {}

      console.log('✅ ASSESSMENT SAVED SUCCESSFULLY');
      return newEntry;
      
    } catch (error) {
      console.error('❌ Failed to save behavioral assessment:', error);
      throw error;
    }
  }
}

// Sistem pembobotan ASN BerAKHLAK
class EvaluationWeightingSystem {
  constructor() {
    // Bobot untuk Pejabat Struktural/Fungsional dengan Fungsi Supervisi
    this.supervisoryWeights = {
      // Kondisi 1: Lengkap (Atasan, Peers, Bawahan)
      complete: { supervisor: 60, peers: 15, subordinates: 25 },
      
      // Kondisi 2: Tidak ada nilai dari Atasan (Atasan Kosong)
      noSupervisor: { supervisor: 0, peers: 40, subordinates: 60 },
      
      // Kondisi 3: Tidak ada nilai dari Peers
      noPeers: { supervisor: 70, peers: 0, subordinates: 30 },
      
      // Kondisi 4: Tidak ada nilai dari Bawahan
      noSubordinates: { supervisor: 80, peers: 20, subordinates: 0 },
      
      // Kondisi 5: Tidak ada nilai dari Atasan & Peers (Hanya Bawahan)
      noSupervisorPeers: { supervisor: 0, peers: 0, subordinates: 100 },
      
      // Kondisi 6: Tidak ada nilai dari Atasan & Bawahan (Hanya Peers)
      noSupervisorSubordinates: { supervisor: 0, peers: 100, subordinates: 0 },
      
      // Kondisi 7: Tidak ada nilai dari Peers & Bawahan (Hanya Atasan)
      noPeersSubordinates: { supervisor: 100, peers: 0, subordinates: 0 }
    };

    // Bobot untuk Pejabat Fungsional TANPA Fungsi Supervisi
    this.nonSupervisoryWeights = {
      // Kondisi 1: Lengkap (Atasan, Peers)
      complete: { supervisor: 60, peers: 40, subordinates: 0 },
      
      // Kondisi 2: Tidak ada nilai dari Atasan
      noSupervisor: { supervisor: 0, peers: 100, subordinates: 0 },
      
      // Kondisi 3: Tidak ada nilai dari Peers
      noPeers: { supervisor: 100, peers: 0, subordinates: 0 }
    };
  }

  // Tentukan kondisi berdasarkan ketersediaan evaluator
  determineCondition(hasSupervisor, hasPeers, hasSubordinates, isSupervisory = true) {
    if (isSupervisory) {
      // Pejabat dengan fungsi supervisi
      if (hasSupervisor && hasPeers && hasSubordinates) return 'complete';
      if (!hasSupervisor && hasPeers && hasSubordinates) return 'noSupervisor';
      if (hasSupervisor && !hasPeers && hasSubordinates) return 'noPeers';
      if (hasSupervisor && hasPeers && !hasSubordinates) return 'noSubordinates';
      if (!hasSupervisor && !hasPeers && hasSubordinates) return 'noSupervisorPeers';
      if (!hasSupervisor && hasPeers && !hasSubordinates) return 'noSupervisorSubordinates';
      if (hasSupervisor && !hasPeers && !hasSubordinates) return 'noPeersSubordinates';
    } else {
      // Pejabat tanpa fungsi supervisi
      if (hasSupervisor && hasPeers) return 'complete';
      if (!hasSupervisor && hasPeers) return 'noSupervisor';
      if (hasSupervisor && !hasPeers) return 'noPeers';
    }
    
    // Default fallback to complete if nothing matches (should not happen with logic above)
    // But if we have NO evaluators at all, this might return 'complete' which is wrong.
    // However, if we have NO evaluators, scores will be 0 anyway.
    return 'complete'; 
  }

  // Hitung nilai akhir dengan pembobotan
  calculateWeightedScore(evaluators, isSupervisory = true) {
    if (!evaluators || evaluators.length === 0) return 0;

    // Kelompokkan evaluator berdasarkan role
    const scores = {
      supervisor: [],
      peers: [],
      subordinates: []
    };

    evaluators.forEach(evaluator => {
      const score = this.extractScore(evaluator);
      if (score > 0) {
        if (evaluator.role === 'supervisor' || evaluator.category === 'supervisor') {
          scores.supervisor.push(score);
        } else if (evaluator.role === 'peer' || evaluator.category === 'peer') {
          scores.peers.push(score);
        } else if (evaluator.role === 'subordinate' || evaluator.category === 'subordinate') {
          scores.subordinates.push(score);
        }
      }
    });

    // Tentukan kondisi berdasarkan ketersediaan nilai
    const hasSupervisor = scores.supervisor.length > 0;
    const hasPeers = scores.peers.length > 0;
    const hasSubordinates = scores.subordinates.length > 0;

    const condition = this.determineCondition(hasSupervisor, hasPeers, hasSubordinates, isSupervisory);
    
    // Ambil bobot sesuai kondisi
    const weights = isSupervisory ? this.supervisoryWeights[condition] : this.nonSupervisoryWeights[condition];

    // Hitung rata-rata skor untuk setiap kategori
    const avgSupervisor = scores.supervisor.length > 0 ? scores.supervisor.reduce((a, b) => a + b, 0) / scores.supervisor.length : 0;
    const avgPeers = scores.peers.length > 0 ? scores.peers.reduce((a, b) => a + b, 0) / scores.peers.length : 0;
    const avgSubordinates = scores.subordinates.length > 0 ? scores.subordinates.reduce((a, b) => a + b, 0) / scores.subordinates.length : 0;

    // Hitung nilai akhir dengan bobot
    const finalScore = (
      (avgSupervisor * weights.supervisor / 100) +
      (avgPeers * weights.peers / 100) +
      (avgSubordinates * weights.subordinates / 100)
    );

    return {
      finalScore: Math.round(finalScore * 10) / 10,
      condition: condition,
      weights: weights,
      averages: {
        supervisor: Math.round(avgSupervisor * 10) / 10,
        peers: Math.round(avgPeers * 10) / 10,
        subordinates: Math.round(avgSubordinates * 10) / 10
      },
      evaluatorCount: {
        supervisor: scores.supervisor.length,
        peers: scores.peers.length,
        subordinates: scores.subordinates.length
      },
      isSupervisory: isSupervisory
    };
  }

  // Extract score dari berbagai format data evaluator
  extractScore(evaluator) {
    // Cek berbagai field yang mungkin berisi skor
    if (evaluator.final_score !== undefined) return evaluator.final_score;
    if (evaluator.score !== undefined) return evaluator.score;
    if (evaluator.nilai_akhir !== undefined) return evaluator.nilai_akhir;
    
    // Jika ada scores object (untuk behavioral assessment)
    if (evaluator.scores) {
      // Hitung rata-rata dari semua core values
      const scoreValues = Object.values(evaluator.scores);
      if (scoreValues.length > 0) {
        return scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
      }
    }

    return 0;
  }

  // Dapatkan deskripsi kondisi dalam bahasa Indonesia
  getConditionDescription(condition, isSupervisory = true) {
    const descriptions = {
      complete: 'Kondisi Normal (Lengkap)',
      noSupervisor: 'Tidak Ada Nilai dari Atasan',
      noPeers: 'Tidak Ada Nilai dari Peers',
      noSubordinates: 'Tidak Ada Nilai dari Bawahan',
      noSupervisorPeers: 'Tidak Ada Nilai dari Atasan & Peers',
      noSupervisorSubordinates: 'Tidak Ada Nilai dari Atasan & Bawahan',
      noPeersSubordinates: 'Tidak Ada Nilai dari Peers & Bawahan'
    };
    
    return descriptions[condition] || 'Kondisi Normal';
  }

  // Dapatkan informasi lengkap pembobotan
  getWeightingInfo(condition, isSupervisory = true) {
    const weights = isSupervisory ? this.supervisoryWeights[condition] : this.nonSupervisoryWeights[condition];
    
    return {
      condition: condition,
      description: this.getConditionDescription(condition, isSupervisory),
      weights: weights,
      isSupervisory: isSupervisory,
      category: isSupervisory ? 'Pejabat Struktural/Fungsional dengan Fungsi Supervisi' : 'Pejabat Fungsional TANPA Fungsi Supervisi'
    };
  }
}

// Export singleton instance
// ✅ Perilaku Kunci per Aspek (mapping untuk ditampilkan di UI)
EvaluationService.prototype.getKeyBehaviorsMapping = function() {
  return {
    berorientasi_pelayanan: [
      'Memahami dan memenuhi kebutuhan masyarakat',
      'Ramah, cekatan, solutif, dan dapat diandalkan',
      'Melakukan perbaikan tiada henti'
    ],
    kompeten: [
      'Meningkatkan kompetensi diri untuk menjawab tantangan yang selalu berubah',
      'Membantu orang lain belajar',
      'Melaksanakan tugas dengan kualitas terbaik'
    ],
    kolaboratif_harmonis: [
      'Memberi kesempatan kepada berbagai pihak untuk berkontribusi',
      'Terbuka dalam bekerja sama untuk menghasilkan nilai tambah',
      'Menghargai setiap orang apapun latar belakangnya',
      'Suka menolong orang lain',
      'Membangun lingkungan kerja yang kondusif'
    ],
    harmonis: [
      'Menghargai setiap orang apapun latar belakangnya',
      'Suka menolong orang lain',
      'Membangun lingkungan kerja yang kondusif'
    ],
    kolaboratif: [
      'Memberi kesempatan kepada berbagai pihak untuk berkontribusi',
      'Terbuka dalam bekerja sama untuk menghasilkan nilai tambah',
      'Menggerakkan pemanfaatan berbagai sumberdaya untuk tujuan bersama'
    ],
    adaptif: [
      'Cepat menyesuaikan diri menghadapi perubahan',
      'Terus berinovasi dan mengembangkan kreativitas',
      'Bertindak proaktif'
    ],
    akuntabel_loyal: [
      'Melaksanakan tugas dengan jujur, bertanggung jawab, cermat, disiplin dan berintegritas tinggi',
      'Menggunakan kekayaan dan barang milik negara secara bertanggung jawab, efektif, dan efisien',
      'Tidak menyalahgunakan kewenangan jabatan',
      'Memegang teguh ideologi Pancasila, UUD 1945, NKRI serta pemerintahan yang sah',
      'Menjaga nama baik sesama ASN, Pimpinan, Instansi, dan Negara',
      'Menjaga rahasia jabatan dan negara'
    ],
    akuntabel: [
      'Melaksanakan tugas dengan jujur, bertanggung jawab, cermat, disiplin dan berintegritas tinggi',
      'Menggunakan kekayaan dan barang milik negara secara bertanggung jawab, efektif, dan efisien',
      'Tidak menyalahgunakan kewenangan jabatan'
    ],
    loyal: [
      'Memegang teguh ideologi Pancasila, UUD 1945, NKRI serta pemerintahan yang sah',
      'Menjaga nama baik sesama ASN, Pimpinan, Instansi, dan Negara',
      'Menjaga rahasia jabatan dan negara'
    ],
    kepemimpinan: [
      'Menjadi teladan dalam perilaku dan kinerja',
      'Mampu mengarahkan dan memotivasi tim',
      'Mengambil keputusan yang tepat dan strategis'
    ]
  };
};

EvaluationService.prototype.getKeyBehaviorsForScale = function(scale) {
  const safeScale = Number(scale);
  
  if (safeScale === 120) {
    // Tool 1 (120) - 8 Aspek (Pisah)
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
    const mapping = this.getKeyBehaviorsMapping();
    return keys.map(key => ({
      key,
      name: this.getCoreValueName(key, scale),
      behaviors: mapping[key] || []
    }));
  } else {
    // Tool 2 (100) - 7 Aspek (Gabungan untuk Akuntabel/Loyal dan Kolaboratif/Harmonis)
    // Sesuai standar BerAKHLAK Tool 2
    const keys = [
      'berorientasi_pelayanan',
      'akuntabel_loyal', // Gabungan
      'kompeten',
      'kolaboratif_harmonis', // Gabungan
      'adaptif',
      'kepemimpinan'
    ];
    
    // Namun, ada request untuk memisahkan juga di Tool 2?
    // User feedback spesifik: "nilai npk loyal = akuntable..." 
    // Jika user menggunakan Tool 1, maka harus pisah.
    // Kode lama menggunakan gabungan untuk semua.
    // Mari kita pertahankan gabungan untuk Tool 2 (backward compat) tapi FIX Tool 1.
    
    // REVISI: Kode lama di getKeyBehaviorsForScale menggunakan list fixed.
    // Kita kembalikan ke list fixed tapi dengan logic if/else.
    
    const keys100 = [
      'berorientasi_pelayanan',
      'kompeten',
      'kolaboratif_harmonis',
      'adaptif',
      'akuntabel_loyal',
      'kepemimpinan'
    ];
    
    const mapping = this.getKeyBehaviorsMapping();
    return keys100.map(key => ({
      key,
      name: this.getCoreValueName(key, scale),
      behaviors: mapping[key] || []
    }));
  }
};

const evaluationService = new EvaluationService();
export default evaluationService;
