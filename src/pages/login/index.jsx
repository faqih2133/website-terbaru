import React from 'react';
import BrandingHeader from './components/BrandingHeader';
import LoginForm from './components/LoginForm';
import ComplianceFooter from './components/ComplianceFooter';
import InfoPanel from './components/InfoPanel';

const Login = () => {
  return (
    <div className="login-page h-screen bg-slate-50 relative overflow-x-hidden overflow-y-auto font-sans">
      
      {/* Background - Clean & Professional */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/50"></div>

      {/* Main Content Container - Responsive */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Content Wrapper */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              
              {/* Left Panel - Information - Hidden on Mobile */}
              <div className="hidden lg:flex lg:items-center lg:justify-center">
                <div className="w-full max-w-md">
                  <InfoPanel />
                </div>
              </div>

              {/* Right Panel - Login Form - Full Width on Mobile */}
              <div className="flex items-center justify-center lg:justify-start">
                <div className="w-full max-w-md">
                  
                  {/* Login Card - Clean & Minimal */}
                  <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/40 p-6 sm:p-8">
                    
                    <div className="space-y-6 sm:space-y-8">
                      <BrandingHeader />
                      <LoginForm />
                      <ComplianceFooter />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security Badge - Fixed Position */}
        <div className="flex-shrink-0 pb-6">
          <div className="flex justify-center">
            <div className="flex items-center space-x-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/40">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-sm text-slate-600 font-medium">
                Sistem Aman & Terlindungi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;