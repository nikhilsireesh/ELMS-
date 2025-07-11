import React from 'react';
import logo from '../logo/image.png';

const InstitutionalHeader = ({ userRole, userName, showUserInfo = true }) => {
  const getRoleGradient = () => {
    switch (userRole) {
      case 'Admin':
        return 'linear-gradient(135deg, var(--mic-bright-red), var(--mic-red-dark))';
      case 'HOD':
        return 'linear-gradient(135deg, var(--mic-deep-blue), var(--mic-blue-dark))';
      case 'Employee':
        return 'linear-gradient(135deg, var(--mic-logo-green), var(--mic-green-dark))';
      default:
        return 'linear-gradient(135deg, var(--mic-bright-red), var(--mic-red-dark))';
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'Admin':
        return 'var(--mic-bright-red)';
      case 'HOD':
        return 'var(--mic-deep-blue)';
      case 'Employee':
        return 'var(--mic-logo-green)';
      default:
        return 'var(--mic-bright-red)';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
      <div 
        className="px-8 py-6"
        style={{ background: getRoleGradient() }}
      >
        <div className="flex items-center justify-between">
          {/* Logo and Institution Section */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-lg">
              <img 
                src={logo} 
                alt="MIC College Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">
                DVR & Dr. HS MIC College of Technology
              </h1>
              <p className="text-white/90 text-sm font-medium">
                An Autonomous Institution
              </p>
            </div>
          </div>

          {/* User Info Section */}
          {showUserInfo && (
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                <p className="text-white text-sm font-medium">
                  {userRole} Portal
                </p>
                <p className="text-white/90 text-xs">
                  Welcome, {userName}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstitutionalHeader;
