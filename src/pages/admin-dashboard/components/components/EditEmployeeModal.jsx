import React, { useState, useEffect } from 'react';
import Button from '../../../../components/ui/Button';

const EditEmployeeModal = ({ isOpen, onClose, employee, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    nip: '',
    nama: '',
    jabatan: '',
    role: 'evaluator',
    status: 'active',
    birthDate: '',
    department: '',
    email: ''
  });
  const departmentOptions = [
    'Sekretariat Jenderal',
    'Inspektorat Jenderal',
    'Direktorat Jenderal Strategi Ekonomi dan Fiskal',
    'Direktorat Jenderal Anggaran',
    'Direktorat Jenderal Pajak',
    'Direktorat Jenderal Bea dan Cukai',
    'Direktorat Jenderal Perbendaharaan',
    'Direktorat Jenderal Kekayaan Negara',
    'Direktorat Jenderal Perimbangan Keuangan',
    'Direktorat Jenderal Pengelolaan Pembiayaan dan Risiko',
    'Direktorat Jenderal Stabilitas dan Pengembangan Sektor Keuangan',
    'Badan Teknologi, Informasi, dan Intelijen Keuangan',
    'Badan Pendidikan dan Pelatihan Keuangan'
  ];
  const [departmentChoice, setDepartmentChoice] = useState('');

  useEffect(() => {
    if (employee) {
      // Handle date format from backend
      let formattedDate = '';
      const dateVal = employee.birth_date || employee.birthDate;
      
      if (dateVal) {
        try {
          // Priority 1: If it's a string, try to extract YYYY-MM-DD
          if (typeof dateVal === 'string') {
            // Check if it matches ISO format with Time
            if (dateVal.includes('T')) {
               // Direct split to avoid Timezone issues (Off-by-one)
               formattedDate = dateVal.split('T')[0];
            } else {
               // It's likely already YYYY-MM-DD (e.g. 2003-07-17)
               formattedDate = dateVal.substring(0, 10);
            }
          } 
          // Priority 2: If it's a Date object
          else if (dateVal instanceof Date) {
            const year = dateVal.getFullYear();
            const month = String(dateVal.getMonth() + 1).padStart(2, '0');
            const day = String(dateVal.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
          }
        } catch (e) {
          console.error("Error formatting date:", e);
        }
      }

      setFormData({
        id: employee.id || '',
        nip: employee.nip || '',
        nama: employee.nama || '',
        jabatan: employee.jabatan || '',
        role: employee.role || 'evaluator',
        status: employee.status || 'active',
        birthDate: formattedDate,
        department: employee.department || '',
        email: employee.email || ''
      });
      const dep = employee.department || '';
      const match = departmentOptions.find(d => d === dep);
      setDepartmentChoice(match ? dep : (dep ? 'Lainnya' : ''));
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {employee?.id ? 'Edit' : 'Tambah'} Pegawai
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIP
                </label>
                <input
                  type="text"
                  name="nip"
                  value={formData.nip}
                  onChange={(e) => {
                    // Hanya izinkan angka
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setFormData(prev => ({ ...prev, nip: val }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={(e) => {
                    // Hanya izinkan huruf dan spasi
                    const val = e.target.value.replace(/[^a-zA-Z\s.,]/g, '');
                    setFormData(prev => ({ ...prev, nama: val }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jabatan
                </label>
                <select
                  name="jabatan-select"
                  value={formData.jabatan}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, jabatan: e.target.value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-2"
                  required
                >
                  <option value="">Pilih Jabatan...</option>
                  <option value="Jabatan Fungsional dengan Supervisi">Jabatan Fungsional dengan Supervisi</option>
                  <option value="Jabatan Fungsional Tanpa Supervisi">Jabatan Fungsional Tanpa Supervisi</option>
                </select>
              </div>

              <div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="evaluator">Evaluator</option>
                  <option value="user">Evaluee (User)</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  max="9999-12-31"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Penting! Password login default: NIP + 2 digit Tanggal (DD).
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={departmentChoice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDepartmentChoice(val);
                    if (val !== 'Lainnya') {
                      setFormData(prev => ({ ...prev, department: val }));
                    } else {
                      setFormData(prev => ({ ...prev, department: prev.department || '' }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-2"
                >
                  <option value="">Pilih Department...</option>
                  {departmentOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                  <option value="Lainnya">Lainnya</option>
                </select>
                {departmentChoice === 'Lainnya' && (
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, department: val }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Isi nama departemen lainnya"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="nama@kemenkeu.go.id"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Wajib diisi untuk login dan fitur lupa password.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {employee?.id ? 'Update' : 'Tambah'} Pegawai
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
