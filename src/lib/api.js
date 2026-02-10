// Tambahkan console.log lebih detail di API client
// API Base Configuration
// Menggunakan relative path '/api' agar proxy di package.json bekerja (terutama saat akses via Ngrok)
// Hardcoded to 5000 to fix connection refused on 5001
export const API_BASE_URL = 'http://localhost:5000/api';

// ✅ MOCK MODE TOGGLE
// Set to TRUE to use localStorage instead of Backend API
export const MOCK_MODE = false;

console.log('🌐 API: Initializing API client with base URL:', API_BASE_URL);
console.log('🛠️ API: Mock Mode is:', MOCK_MODE ? 'ENABLED (Using localStorage)' : 'DISABLED (Using Backend)');

// ✅ MOCK REQUEST HANDLER
const mockRequest = async (url, options = {}) => {
  console.log('🎭 MOCK API: Handling request for:', url);
  
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  // --- AUTH ---
  if (url === '/auth/login' && options.method === 'POST') {
    const { employee_id, password } = JSON.parse(options.body);
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    
    // ✅ AUTO-SEED & REPAIR: Ensure critical users exist
    const seedUsers = [
        {
            id: '1839',
            nip: '198203152010012001',
            nama: 'Saifullah Noer',
            role: 'evaluator',
            jabatan: 'Analis Keuangan Negara Ahli Madya',
            tanggal_lahir: '1982-03-15',
            password: '19820315201001200115',
            email: 'noer.saifullah@kemenkeu.go.id'
        },
        {
            id: '1592',
            nip: '197811082005022002',
            nama: 'Poejowati Probo Wardani',
            role: 'evaluee',
            jabatan: 'Penilai Ahli Muda',
            tanggal_lahir: '1978-11-08',
            password: '19781108200502200208',
            email: 'wardani.poejowati@kemenkeu.go.id'
        },
        {
            id: '1770',
            nip: '199004202015051001',
            nama: 'Rizky Dharmawan',
            role: 'admin',
            jabatan: 'Pengawas Keuangan Negara Ahli Pertama',
            tanggal_lahir: '1990-04-20',
            password: '19900420201505100120',
            email: 'dharmawan.rizky@kemenkeu.go.id'
        },
        {
            id: '910',
            nip: '199506112021072002',
            nama: 'Hanna Amalia Azzahra',
            role: 'evaluator',
            jabatan: 'Analis Keuangan Negara Ahli Pertama',
            tanggal_lahir: '1995-06-11',
            password: '19950611202107200211',
            email: 'azzahra.hanna@kemenkeu.go.id'
        },
        {
            id: '250',
            nip: '198712252008022002',
            nama: 'Anindita Nur Rachmi',
            role: 'evaluee',
            jabatan: 'Penilai Ahli Madya',
            tanggal_lahir: '1987-12-25',
            password: '19871225200802200225',
            email: 'rachmi.anindita@kemenkeu.go.id'
        },
        {
            id: '2057',
            nip: '198905102012011001',
            nama: 'Taufiq Istianto',
            role: 'evaluator',
            jabatan: 'Analis Keuangan Negara Ahli Muda',
            tanggal_lahir: '1989-05-10',
            password: '19890510201201100110',
            email: 'istianto.taufiq@kemenkeu.go.id'
        },
        {
            id: '210',
            nip: '199203082019062002',
            nama: 'Andhita Vidya Putri',
            role: 'admin',
            jabatan: 'Pengawas Keuangan Negara Ahli Madya',
            tanggal_lahir: '1992-03-08',
            password: '19920308201906200208',
            email: 'putri.andhita@kemenkeu.go.id'
        },
        {
            id: '752',
            nip: '197605152003031001',
            nama: 'Faisal',
            role: 'evaluator',
            jabatan: 'Penilai Ahli Pertama',
            tanggal_lahir: '1976-05-15',
            password: '19760515200303100115',
            email: 'faisal@kemenkeu.go.id'
        },
        {
            id: '732',
            nip: '199107202016041001',
            nama: 'Evan Widyatama',
            role: 'evaluee',
            jabatan: 'Analis Keuangan Negara Ahli Madya',
            tanggal_lahir: '1991-07-20',
            password: '19910720201604100120',
            email: 'widyatama.evan@kemenkeu.go.id'
        },
        {
            id: '1734',
            nip: '198410112009022002',
            nama: 'Rina Ariyati',
            role: 'evaluator',
            jabatan: 'Pengawas Keuangan Negara Ahli Pertama',
            tanggal_lahir: '1984-10-11',
            password: '19841011200902200211',
            email: 'ariyati.rina@kemenkeu.go.id'
        },
        {
            id: '2002',
            nip: '196812051991031001',
            nama: 'Supriadi',
            role: 'admin',
            jabatan: 'Penilai Ahli Madya',
            tanggal_lahir: '1968-12-05',
            password: '19681205199103100105',
            email: 'supriadi@kemenkeu.go.id'
        },
        {
            id: '1428',
            nip: '199008152017051001',
            nama: 'Muhammad Romi Kurniawan',
            role: 'evaluator',
            jabatan: 'Analis Keuangan Negara Ahli Pertama',
            tanggal_lahir: '1990-08-15',
            password: '19900815201705100115',
            email: 'kurniawan.romi@kemenkeu.go.id'
        },
        {
            id: '1469',
            nip: '199401102022082002',
            nama: 'Nancy Grace Pasaribu',
            role: 'evaluee',
            jabatan: 'Pengawas Keuangan Negara Ahli Muda',
            tanggal_lahir: '1994-01-10',
            password: '19940110202208200210',
            email: 'pasaribu.nancy@kemenkeu.go.id'
        },
        {
            id: '1313',
            nip: '198306202008011001',
            nama: 'Mirsal',
            role: 'evaluator',
            jabatan: 'Penilai Ahli Pertama',
            tanggal_lahir: '1983-06-20',
            password: '19830620200801100120',
            email: 'mirsal@kemenkeu.go.id'
        },
        {
            id: '823',
            nip: '199512052021031002',
            nama: 'Fitrah Maula',
            role: 'admin',
            jabatan: 'Analis Keuangan Negara Ahli Muda',
            tanggal_lahir: '1995-12-05',
            password: '19951205202103100205',
            email: 'maula.fitrah@kemenkeu.go.id'
        },
        {
            id: '1069',
            nip: '197902152004041001',
            nama: 'Ishak Ismail',
            role: 'evaluator',
            jabatan: 'Pengawas Keuangan Negara Ahli Madya',
            tanggal_lahir: '1979-02-15',
            password: '19790215200404100115',
            email: 'ismail.ishak@kemenkeu.go.id'
        },
        {
            id: '74',
            nip: '198711082011022001',
            nama: 'Aedy Syam',
            role: 'evaluee',
            jabatan: 'Penilai Ahli Madya',
            tanggal_lahir: '1987-11-08',
            password: '19871108201102200108',
            email: 'syam.aedy@kemenkeu.go.id'
        },
        {
            id: '594',
            nip: '199309202018061001',
            nama: 'Dimas Surya Putra',
            role: 'evaluator',
            jabatan: 'Analis Keuangan Negara Ahli Pertama',
            tanggal_lahir: '1993-09-20',
            password: '19930920201806100120',
            email: 'putra.dimas@kemenkeu.go.id'
        },
        {
            id: '546',
            nip: '198805112013072002',
            nama: 'Dewi Lestari',
            role: 'admin',
            jabatan: 'Pengawas Keuangan Negara Ahli Pertama',
            tanggal_lahir: '1988-05-11',
            password: '19880511201307200211',
            email: 'lestari.dewi@kemenkeu.go.id'
        }
    ];

    let hasChanges = false;
    seedUsers.forEach(seedUser => {
        if (!employees.find(e => String(e.nip) === String(seedUser.nip))) {
            employees.push(seedUser);
            hasChanges = true;
            console.log(`🌱 MOCK API: Auto-seeded missing user ${seedUser.nip}`);
        }
    });

    if (hasChanges) {
        localStorage.setItem('employees', JSON.stringify(employees));
    }

    // Find user by NIP (employee_id)
    const user = employees.find(e => String(e.nip) === String(employee_id));
    
    if (!user) {
      return { success: false, message: 'NIP tidak ditemukan' };
    }

    // Password Validation Logic (NIP + DD)
    let isValid = false;
    
    // 1. Check stored password (if exists)
    if (user.password && user.password === password) {
      isValid = true;
    } 
    // 2. Check Default Pattern: NIP + DD (Day of Birth)
    else if (user.tanggal_lahir) {
      // Parse YYYY-MM-DD
      const parts = user.tanggal_lahir.split('-'); // [YYYY, MM, DD]
      if (parts.length === 3) {
        const day = parts[2]; // DD
        const expectedPassword = `${user.nip}${day}`;
        if (password === expectedPassword) {
            isValid = true;
        }
      }
    }
    // 3. Dev Backdoor (Optional, remove in prod)
    if (password === 'admin123') isValid = true;

    if (isValid) {
      const token = 'mock_access_token_' + Date.now();
      return {
        success: true,
        data: {
          user: user,
          tokens: {
            accessToken: token,
            refreshToken: 'mock_refresh_token_' + Date.now()
          }
        }
      };
    } else {
      return { success: false, message: 'Password salah (Format: NIP + 2 digit Tanggal Lahir)' };
    }
  }

  // --- USERS ---
  if (url === '/users' && options.method === 'GET') {
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    return { success: true, data: employees };
  }

  if (url === '/users' && options.method === 'POST') {
    const data = JSON.parse(options.body);
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    
    const newUser = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    employees.push(newUser);
    localStorage.setItem('employees', JSON.stringify(employees));
    return { success: true, data: newUser };
  }

  if (url.startsWith('/users/') && options.method === 'PUT') {
    const id = url.split('/')[2];
    const data = JSON.parse(options.body);
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    
    const index = employees.findIndex(e => String(e.id) === String(id));
    if (index !== -1) {
      employees[index] = { ...employees[index], ...data };
      localStorage.setItem('employees', JSON.stringify(employees));
      return { success: true, data: employees[index] };
    }
    return { success: false, message: 'User not found' };
  }
  
  if (url.startsWith('/users/') && options.method === 'DELETE') {
      const id = url.split('/')[2];
      let employees = JSON.parse(localStorage.getItem('employees') || '[]');
      employees = employees.filter(e => String(e.id) !== String(id));
      localStorage.setItem('employees', JSON.stringify(employees));
      return { success: true, message: 'User deleted' };
  }

  // --- NPK / ASSESSMENTS ---
  // Submit Behavioral Assessment V2
  if (url === '/npk/behavioral-assessment' && options.method === 'POST') {
    const data = JSON.parse(options.body);
    const assessments = JSON.parse(localStorage.getItem('core_value_assessments') || '[]');
    
    const exists = assessments.some(a => 
      String(a.evaluee_id) === String(data.evaluee_id) &&
      String(a.evaluator_id) === String(data.evaluator_id) &&
      Number(a.scale || 120) === Number(data.scale || 120)
    );

    if (exists) {
      return { success: false, status: 409, message: 'Penilaian sudah terkirim. Evaluator hanya bisa menilai 1 kali.' };
    }
    
    assessments.push({ ...data, id: Date.now(), created_at: new Date().toISOString() });
    localStorage.setItem('core_value_assessments', JSON.stringify(assessments));
    return { success: true, message: 'Assessment saved locally' };
  }
  
  // Save Assignments
  if (url === '/npk/assignments' && options.method === 'POST') {
     const data = JSON.parse(options.body);
     // EvaluationService usually handles this, but if API is called:
     // Expected data: { evaluatorId, evalueeIds }
     const assignments = JSON.parse(localStorage.getItem('evaluatorAssignments') || '[]');
     
     // Remove old assignment for this evaluator if exists (or update)
     const existingIndex = assignments.findIndex(a => String(a.evaluatorId) === String(data.evaluatorId));
     
     const employees = JSON.parse(localStorage.getItem('employees') || '[]');
     const evalueeSnaps = (data.evalueeIds || []).map(id => {
         const emp = employees.find(e => String(e.id) === String(id)) || {};
         return {
             id: String(emp.id || id),
             nip: emp.nip || '',
             nama: emp.nama || emp.name || '',
             jabatan: emp.jabatan || emp.position || ''
         };
     });

     const newAssignment = {
         id: existingIndex !== -1 ? assignments[existingIndex].id : `assign_${Date.now()}`,
         evaluatorId: data.evaluatorId,
         evalueeIds: data.evalueeIds,
         evalueeSnaps: evalueeSnaps,
         updatedAt: new Date().toISOString()
     };

     if (existingIndex !== -1) {
         assignments[existingIndex] = newAssignment;
     } else {
         assignments.push(newAssignment);
     }
     
     localStorage.setItem('evaluatorAssignments', JSON.stringify(assignments));
     return { success: true, message: 'Assignment saved locally' };
  }

  // Default fallback for unknown routes
  console.warn('⚠️ MOCK API: No handler for', url);
  return { success: false, message: 'Endpoint not implemented in Mock Mode' };
};


// Helper function for API requests with token refresh logic
const apiRequest = async (url, options = {}) => {
  console.log('📡 API: Making request to:', url);

  // ✅ REDIRECT TO MOCK IF ENABLED
  if (MOCK_MODE) {
      try {
          const mockResponse = await mockRequest(url, options);
          if (mockResponse && mockResponse.success === false) {
              // Allow caller to handle conflict (per-tool submission rule)
              if (mockResponse.status === 409) {
                  return mockResponse;
              }
              // Other errors: throw
              const error = new Error(mockResponse.message || 'Mock API error');
              error.response = { status: mockResponse.status || 400, data: mockResponse };
              throw error;
          }
          return mockResponse; // Return full response object or data depending on expected format
      } catch (err) {
          console.error('💥 MOCK API Error:', err);
          throw err;
      }
  }

  // ... Original Logic ...
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (parseErr) {
      data = { message: raw || 'Non-JSON response from server' };
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.response = { status: response.status, data: data };
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  logout: () => {
    if (MOCK_MODE) return Promise.resolve({ success: true });
    return apiRequest('/auth/logout', { method: 'POST' });
  },
  refresh: (data) => {
    if (MOCK_MODE) return Promise.resolve({ success: true, data: { accessToken: 'mock', refreshToken: 'mock' } });
    return apiRequest('/auth/refresh', { method: 'POST', body: JSON.stringify(data) });
  },
  verify: () => {
     if (MOCK_MODE) return Promise.resolve({ success: true });
     return apiRequest('/auth/verify');
  },
  verifyToken: () => {
    if (MOCK_MODE) return Promise.resolve({ success: true });
    return apiRequest('/auth/verify');
  },
  refreshToken: (refreshToken) => {
    if (MOCK_MODE) return Promise.resolve({ success: true });
    return apiRequest('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) });
  },
  forgotPassword: (email) => {
    if (MOCK_MODE) return Promise.resolve({ success: true, message: 'Link reset password telah dikirim ke email Anda (Simulasi)' });
    return apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  },
  resetPassword: (token, newPassword) => {
    if (MOCK_MODE) return Promise.resolve({ success: true, message: 'Password berhasil diubah (Simulasi)' });
    return apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) });
  },
};

// NPK API
export const npkAPI = {
  getProposals: (evalueeId) => apiRequest(`/npk/proposals/${evalueeId}`),
  createProposal: (data) => apiRequest('/npk/proposals', { method: 'POST', body: JSON.stringify(data) }),
  approveProposal: (proposalId) => apiRequest(`/npk/proposals/${proposalId}/approve`, { method: 'PUT' }),
  getEvaluators: (evalueeId, periodId) => apiRequest(`/npk/evaluators/${evalueeId}/${periodId}`),
  submitAssessment: (data) => apiRequest('/npk/assessments', { method: 'POST', body: JSON.stringify(data) }),
  submitBehavioralAssessmentV2: (data) => apiRequest('/npk/behavioral-assessment', { method: 'POST', body: JSON.stringify(data) }),
  getCoreValues: () => apiRequest('/npk/core-values'),
  calculateNPK: (data) => apiRequest('/npk/calculate', { method: 'POST', body: JSON.stringify(data) }),
  getEvaluatorAssignments: (evaluatorId) => apiRequest(`/npk/assignments/${evaluatorId}`),
  saveAssignment: (data) => apiRequest('/npk/assignments', { method: 'POST', body: JSON.stringify(data) }),
  getAllAssignments: () => apiRequest('/npk/assignments'),
  getEvaluatorHistory: (evaluatorId) => apiRequest(`/npk/assessments/evaluator/${evaluatorId}`),
  getAssessmentStatus: (evaluatorId, evalueeId, periodId) => apiRequest(`/npk/assessment-status/${evaluatorId}/${evalueeId}/${periodId}`),
};

// Evaluator API
export const evaluatorAPI = {
  getAssignments: (evaluatorId) => apiRequest(`/npk/assignments/${evaluatorId}`),
  getAssessmentStatus: (evaluatorId, evalueeId, periodId) => apiRequest(`/npk/assessment-status/${evaluatorId}/${evalueeId}/${periodId}`),
};

// Users API
export const usersAPI = {
  getAll: () => apiRequest('/users'),
  getProfile: (userId) => apiRequest(`/users/${userId}`),
  create: (data) => apiRequest('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (userId, data) => apiRequest(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (userId) => apiRequest(`/users/${userId}`, { method: 'DELETE' }),
};

// Assessments API
export const assessmentsAPI = {
  getAll: () => apiRequest('/assessments'),
  getById: (id) => apiRequest(`/assessments/${id}`),
  seed: () => apiRequest('/assessments/seed', { method: 'POST' }),
};
