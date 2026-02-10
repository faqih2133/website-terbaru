import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { authAPI } from '../../../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Send object with nip and password keys as expected by AuthContext
      const result = await login({
        nip: formData.username,
        password: formData.password
      });
      
      if (result.success) {
        // Redirect to original destination if available, otherwise based on role
        if (location.state?.from?.pathname) {
          const { pathname, search, hash } = location.state.from;
          navigate(`${pathname}${search || ''}${hash || ''}`);
          return;
        }

        // Default redirect based on role
        switch (result.user.role) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'evaluator':
            navigate('/evaluator-dashboard');
            break;
          case 'supervisor':
            navigate('/supervisor-approval');
            break;
          case 'evaluee':
            navigate('/evaluee-dashboard');
            break;
          default:
            navigate('/evaluee-dashboard');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    setError('');
    setIsLoading(true); // Tambahkan indikator loading
    
    try {
      const response = await authAPI.forgotPassword(forgotEmail);
      if (response.success) {
        setForgotMessage(response.message);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Gagal mengirim permintaan reset password.');
    } finally {
      setIsLoading(false); // Matikan indikator loading
    }
  };

  if (showForgotPassword) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Reset Password</h2>
          <p className="text-slate-600 mt-2">Masukkan email Anda untuk menerima link reset password.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {forgotMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
            {forgotMessage}
          </div>
        )}

        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="nama@kemenkeu.go.id"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>

          <button
            type="button"
            onClick={() => setShowForgotPassword(false)}
            className="w-full text-slate-600 hover:text-slate-800 text-sm font-medium"
          >
            Kembali ke Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Selamat Datang</h2>
        <p className="text-slate-600 mt-2">Silakan masuk ke akun Anda</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            NIP / Employee ID
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Masukkan NIP Anda"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Password (password + dd)"
            required
          />
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Lupa Password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
