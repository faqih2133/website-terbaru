import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Icon from '../AppIcon';

const SecureLogoutComponent = ({ 
  sessionTimeout = 1800000, // 30 minutes default
  warningTime = 300000, // 5 minutes before timeout
  showInactivityWarning = true,
  onLogout 
}) => {
  const [timeLeft, setTimeLeft] = useState(sessionTimeout / 1000);
  const [showWarning, setShowWarning] = useState(false);
  // ❌ Hapus: const [isActive, setIsActive] = useState(true);
  const { logout } = useAuth();

  // Clear all timers function
  const clearAllTimers = useCallback(() => {
    // Implementation for clearing timers
  }, []);

  // Reset timers function  
  const resetTimers = useCallback(() => {
    setTimeLeft(sessionTimeout / 1000);
    setShowWarning(false);
    // ❌ Hapus: setIsActive(true);
  }, [sessionTimeout]);

  // Activity detection
  const handleActivity = useCallback(() => {
    // ❌ Hapus: setIsActive(true);
    resetTimers();
  }, [resetTimers]);

  // Logout handler
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, onLogout]);

  useEffect(() => {
    // Add activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        if (newTime <= warningTime / 1000 && !showWarning && showInactivityWarning) {
          setShowWarning(true);
        }
        
        if (newTime <= 0) {
          handleLogout();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearAllTimers();
      resetTimers();
    };
  }, [clearAllTimers, resetTimers, handleActivity, warningTime, showInactivityWarning, handleLogout, showWarning]); // ✅ Added handleLogout and showWarning

  const extendSession = () => {
    resetTimers();
    setShowWarning(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!showInactivityWarning) {
    return null;
  }

  return (
    <>
      {/* Session Timeout Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <Icon name="Clock" size={20} className="text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Sesi Akan Berakhir
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sesi Anda akan berakhir dalam {formatTime(Math.floor(timeLeft))}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={extendSession}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90"
              >
                Perpanjang Sesi
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-error text-error-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-error/90"
              >
                Logout Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SecureLogoutComponent;