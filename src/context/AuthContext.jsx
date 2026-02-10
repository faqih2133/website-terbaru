import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Helper: Simple "Encryption" (Base64) to hide data in localStorage
  const encryptData = (data) => {
    try {
      // Handle Unicode characters by encoding first
      return btoa(encodeURIComponent(JSON.stringify(data)));
    } catch (e) {
      console.error('Encryption failed', e);
      return null;
    }
  };

  const decryptData = (ciphertext) => {
    try {
      // Decode Unicode characters after decoding Base64
      return JSON.parse(decodeURIComponent(atob(ciphertext)));
    } catch (e) {
      console.error('Decryption failed', e);
      return null;
    }
  };

  // ✅ PERBAIKAN: Initialize auth state dari localStorage saja (tanpa API)
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const encryptedData = localStorage.getItem('user_session'); // Changed key to user_session
        
        console.log('🔄 AuthContext: Initializing auth state...');
        
        if (encryptedData) {
          const parsedUser = decryptData(encryptedData);
          if (parsedUser) {
            console.log('✅ AuthContext: User found, setting authenticated:', parsedUser.name);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
             // Invalid data
             localStorage.removeItem('user_session');
             setUser(null);
             setIsAuthenticated(false);
          }
        } else {
          // Backward compatibility check (old 'user' key)
          const oldUser = localStorage.getItem('user');
          if (oldUser) {
             try {
                const parsed = JSON.parse(oldUser);
                setUser(parsed);
                setIsAuthenticated(true);
                // Upgrade to encrypted
                localStorage.setItem('user_session', encryptData(parsed));
                localStorage.removeItem('user');
             } catch (e) {
                localStorage.removeItem('user');
             }
          } else {
             console.log('⚠️ AuthContext: No user data found, staying logged out');
             setUser(null);
             setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('💥 AuthContext: Failed to parse user data:', error);
        localStorage.removeItem('user_session');
        setUser(null);
        setIsAuthenticated(false);
      }
      
      console.log('✅ AuthContext: Auth initialization completed');
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // ✅ Helper untuk menangani kegagalan login
  const handleFailedAttempt = () => {
    const currentAttempts = parseInt(localStorage.getItem('login_attempts') || '0');
    const newAttempts = currentAttempts + 1;
    localStorage.setItem('login_attempts', newAttempts.toString());
    
    if (newAttempts >= 5) {
      const lockoutTime = new Date(new Date().getTime() + 5 * 60000); // 5 menit dari sekarang
      localStorage.setItem('login_lockout_until', lockoutTime.toISOString());
      console.warn('⛔ Account locked due to too many failed attempts');
      throw new Error('Terlalu banyak percobaan gagal (5x). Akun dikunci selama 5 menit.');
    }
  };

  // ✅ Login menggunakan API Backend
  const login = async (credentials) => {
    console.log('🚀 AuthContext: Login function called with:', {
      nip: credentials.nip,
      password: credentials.password ? '***masked***' : 'undefined'
    });
    
    // 1. Cek status lockout (Local check)
    const lockoutUntil = localStorage.getItem('login_lockout_until');
    if (lockoutUntil) {
      const lockoutTime = new Date(lockoutUntil);
      if (new Date() < lockoutTime) {
        const remainingMinutes = Math.ceil((lockoutTime - new Date()) / 60000);
        throw new Error(`Akun terkunci sementara. Silakan coba lagi dalam ${remainingMinutes} menit.`);
      } else {
        localStorage.removeItem('login_lockout_until');
        localStorage.removeItem('login_attempts');
      }
    }

    try {
      setError(null);
      console.log('📊 AuthContext: Calling Backend API...');
      
      // ✅ Validasi input
      if (!credentials.nip || !credentials.password) {
        throw new Error('NIP dan password harus diisi');
      }

      // ✅ Call API
      // Backend expects 'employee_id', frontend sends 'nip'
      const response = await authAPI.login({
        employee_id: credentials.nip,
        password: credentials.password
      });

      if (response.success) {
        console.log('✅ AuthContext: Login successful for:', response.data.user.name);
        
        // Reset failed attempts
        localStorage.removeItem('login_attempts');
        localStorage.removeItem('login_lockout_until');
        
        const userData = response.data.user;
        const tokens = response.data.tokens;

        // Store tokens
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);

        // Store user session (Encrypted)
        localStorage.setItem('user_session', encryptData(userData));
        
        // Clean up legacy
        localStorage.removeItem('user');
        
        console.log('🔄 AuthContext: Updating state...');
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        throw new Error(response.message || 'Login failed');
      }

    } catch (error) {
      console.error('💥 AuthContext: Login error:', error.message);
      handleFailedAttempt(); // Track failed attempts locally for UI feedback
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  // ✅ HELPER: Generate password dari NIP + tanggal lahir (DEPRECATED & REMOVED)
  // Logic dipindah ke Backend


  // ✅ Logout tanpa API call
  const logout = async () => {
    console.log('🚪 AuthContext: Logout function called');
    
    console.log('🧹 AuthContext: Clearing localStorage and state...');
    try {
      // Clear local storage
      localStorage.removeItem('user_session');
      localStorage.removeItem('user'); // Clean up old key if exists
      localStorage.removeItem('accessToken'); // Clear jika ada
      localStorage.removeItem('refreshToken'); // Clear jika ada
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('✅ AuthContext: Logout completed successfully');
      return { success: true };
    } catch (error) {
      console.error('💥 AuthContext: Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  // ✅ Remove refreshToken function (tidak diperlukan untuk localStorage)
  const refreshToken = async () => {
    console.log('⚠️ AuthContext: Refresh token not implemented for localStorage auth');
    return { success: true };
  };

  // ✅ Remove verify function (tidak diperlukan untuk localStorage)
  const verify = async () => {
    console.log('⚠️ AuthContext: Verify not implemented for localStorage auth');
    return { success: true };
  };

  // ✅ Helper function untuk check authentication status
  const checkAuth = () => {
    const encryptedData = localStorage.getItem('user_session');
    if (encryptedData) {
      const parsedUser = decryptData(encryptedData);
      if (parsedUser) {
        return { isAuthenticated: true, user: parsedUser };
      }
    }
    // Fallback old key
    const oldData = localStorage.getItem('user');
    if (oldData) {
        try {
            return { isAuthenticated: true, user: JSON.parse(oldData) };
        } catch {
            return { isAuthenticated: false, user: null };
        }
    }
    return { isAuthenticated: false, user: null };
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    refreshToken,
    verify,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};