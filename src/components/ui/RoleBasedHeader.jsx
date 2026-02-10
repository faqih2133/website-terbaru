import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import ConfirmationModal from './ConfirmationModal';

const RoleBasedHeader = ({ hideUserLabel = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    navigate('/');
    setShowLogoutModal(false);
  };

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'evaluator': return 'Evaluator';
      default: return 'User';
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', path: user?.role === 'admin' ? '/admin-dashboard' : '/evaluator-dashboard', icon: '🏠' }
    ];

    if (user?.role === 'evaluator') {
      baseItems.push({
        name: 'Penilaian',
        path: '/behavioral-assessment',
        icon: '📝'
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            
            {/* Logo - Minimal */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base font-semibold text-slate-900">NPK 360°</h1>
                </div>
              </div>
            </div>

            {/* Desktop Navigation - Clean */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all duration-200"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            {/* User Section - Minimal */}
            <div className="flex items-center space-x-3">
              
              {/* User Info - Compact */}
              {!hideUserLabel && (
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500">{getRoleDisplay(user?.role)}</p>
                  </div>
                  <div className="h-8 w-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </div>
              )}

              {/* Logout Button - Clean */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all duration-200"
              >
                <Icon name="LogOut" size={16} color="currentColor" />
                <span className="hidden sm:inline">Keluar</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showMobileMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Slide Down */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
            
            {/* Mobile User Info */}
            <div className="border-t border-slate-200 pt-3 mt-3">
              <div className="flex items-center space-x-3 px-3">
                <div className="h-10 w-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{getRoleDisplay(user?.role)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar aplikasi?"
        confirmText="Keluar"
        variant="danger"
      />
    </>
  );
};

export default RoleBasedHeader;