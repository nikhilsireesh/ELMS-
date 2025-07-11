import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import InstitutionalHeader from '../../components/InstitutionalHeader';

const EmployeeProfile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [earnedLeaveData, setEarnedLeaveData] = useState(null);
  const [elLoading, setElLoading] = useState(false);
  const [currentLeaveBalances, setCurrentLeaveBalances] = useState(null);
  const [clQuotaInfo, setClQuotaInfo] = useState(null);
  const [sclQuotaInfo, setSclQuotaInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    address: '',
    mobileNo: '',
    bloodGroup: '',
    dateOfBirth: '',
    dateOfJoining: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics', 
    'Mechanical', 'Civil', 'Management', 'Human Resources'
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        address: user.address || '',
        mobileNo: user.mobileNo || '',
        bloodGroup: user.bloodGroup || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        dateOfJoining: user.dateOfJoining ? user.dateOfJoining.split('T')[0] : ''
      });
    }
  }, [user]);

  useEffect(() => {
    fetchCurrentLeaveBalances();
    fetchEarnedLeaveDetails();
  }, []);

  const fetchCurrentLeaveBalances = async () => {
    try {
      const response = await api.get('/users/current-leave-balances');
      if (response.data.success) {
        const { cl, scl, el, hpl, ccl, clInfo, sclInfo } = response.data.data;
        setCurrentLeaveBalances({
          cl,
          scl,
          el,
          hpl,
          ccl
        });
        setClQuotaInfo(clInfo);
        setSclQuotaInfo(sclInfo);
      }
    } catch (error) {
      console.error('Error fetching leave balances:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userId = user.id || user._id;
      const response = await api.put(`/users/${userId}`, formData);
      await updateProfile(formData);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordMode(false);
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return '';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getYearsOfService = (dateOfJoining) => {
    if (!dateOfJoining) return '';
    const today = new Date();
    const joiningDate = new Date(dateOfJoining);
    let years = today.getFullYear() - joiningDate.getFullYear();
    const monthDiff = today.getMonth() - joiningDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < joiningDate.getDate())) {
      years--;
    }
    return years;
  };

  // Fetch earned leave calculation details
  const fetchEarnedLeaveDetails = async () => {
    try {
      setElLoading(true);
      const response = await api.get('/users/earned-leave-details');
      setEarnedLeaveData(response.data.data);
    } catch (error) {
      console.error('Error fetching earned leave details:', error);
      alert('Failed to fetch earned leave details');
    } finally {
      setElLoading(false);
    }
  };

  // Calculate and update earned leave
  const calculateEarnedLeave = async () => {
    try {
      setElLoading(true);
      const response = await api.post('/users/calculate-earned-leave');
      setEarnedLeaveData(response.data.data.earnedLeaveCalculation);
      alert('Earned leave calculated and updated successfully!');
      // Refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Error calculating earned leave:', error);
      alert('Failed to calculate earned leave');
    } finally {
      setElLoading(false);
    }
  };

  // Fetch earned leave details on component mount
  useEffect(() => {
    fetchEarnedLeaveDetails();
  }, []);

  if (!user) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Institutional Header */}
        <InstitutionalHeader 
          userRole="Employee" 
          userName={user?.name} 
          showUserInfo={true} 
        />

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div>
            <h1 className="text-4xl font-bold" style={{ 
              background: 'linear-gradient(135deg, var(--mic-logo-green), var(--mic-green-dark))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              My Profile
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Manage your profile information and settings</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {!editMode && !passwordMode && (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  style={{
                    background: 'linear-gradient(135deg, var(--mic-logo-green), var(--mic-green-dark))',
                    color: 'var(--mic-white)',
                    border: '1px solid var(--mic-logo-green)'
                  }}
                  className="px-6 py-3 text-white rounded-xl font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
                <button
                  onClick={() => setPasswordMode(true)}
                  style={{
                    background: 'linear-gradient(135deg, var(--mic-deep-blue), var(--mic-blue-dark))',
                    color: 'var(--mic-white)',
                    border: '1px solid var(--mic-deep-blue)'
                  }}
                  className="px-6 py-3 text-white rounded-xl font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>
              </>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Basic Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div style={{ background: 'linear-gradient(135deg, var(--mic-logo-green), var(--mic-green-dark))' }} className="h-24"></div>
              <div className="relative px-6 pb-6">
                <div className="flex flex-col items-center -mt-12">
                  <div style={{ background: 'linear-gradient(135deg, var(--mic-logo-green), var(--mic-green-dark))' }} className="w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                    <span className="text-3xl font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mt-4 text-center">{user.name}</h3>
                  <div style={{ 
                    background: 'rgba(0, 128, 0, 0.1)',
                    color: 'var(--mic-logo-green)'
                  }} className="px-4 py-2 rounded-full text-sm font-semibold mt-3">
                    👤 Employee
                  </div>
                  <div className="w-full mt-6 space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Employee ID</p>
                          <p className="font-semibold text-gray-900">{user.employeeId}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="font-semibold text-gray-900">{user.department}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Service</p>
                          <p className="font-semibold text-gray-900">{getYearsOfService(user.dateOfJoining)} years</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Balance Summary */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-8">
              <div style={{ background: 'linear-gradient(135deg, var(--mic-logo-green), var(--mic-green-dark))' }} className="p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h4a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V8a1 1 0 011-1h4z" />
                  </svg>
                  Leave Balance
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {currentLeaveBalances ? (
                    Object.entries(currentLeaveBalances).map(([type, balance]) => {
                      let quotaInfo = null;
                      if (type === 'cl' && clQuotaInfo) {
                        quotaInfo = clQuotaInfo;
                      } else if (type === 'scl' && sclQuotaInfo) {
                        quotaInfo = sclQuotaInfo;
                      }
                      
                      return (
                        <div key={type} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <span className="font-semibold text-gray-700">{type.toUpperCase()}</span>
                              {quotaInfo && (
                                <div className="text-xs text-blue-600 mt-1">
                                  {quotaInfo.period} ({quotaInfo.quota} total)
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-600">{balance}</span>
                            <span className="text-sm text-gray-500">days</span>
                          </div>
                        </div>
                      );
                    })
                  ) : user?.leaveBalance && Object.entries(user.leaveBalance).map(([type, balance]) => (
                    <div key={type} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-semibold text-gray-700">{type.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">{balance}</span>
                        <span className="text-sm text-gray-500">days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Earned Leave Calculation */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mt-8">
              <div style={{ background: 'linear-gradient(135deg, var(--mic-deep-blue), var(--mic-blue-dark))' }} className="p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Earned Leave Calculation
                </h3>
              </div>
              <div className="p-6">
                {elLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {earnedLeaveData ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="text-sm text-blue-600 font-medium">Total Working Days</div>
                            <div className="text-2xl font-bold text-blue-700">{earnedLeaveData.totalWorkingDays}</div>
                            <div className="text-xs text-blue-500">Since joining</div>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                            <div className="text-sm text-red-600 font-medium">Leaves Taken</div>
                            <div className="text-2xl font-bold text-red-700">{earnedLeaveData.totalLeavesTaken}</div>
                            <div className="text-xs text-red-500">Approved leaves</div>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                            <div className="text-sm text-green-600 font-medium">Actual Working Days</div>
                            <div className="text-2xl font-bold text-green-700">{earnedLeaveData.actualWorkingDays}</div>
                            <div className="text-xs text-green-500">Total - Leaves taken</div>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                            <div className="text-sm text-purple-600 font-medium">Earned Leave (EL)</div>
                            <div className="text-2xl font-bold text-purple-700">{earnedLeaveData.earnedLeave}</div>
                            <div className="text-xs text-purple-500">Working days ÷ 2</div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-sm text-yellow-800">
                              <div className="font-semibold mb-1">EL Calculation Formula:</div>
                              <div>Actual Working Days ÷ 2 = {earnedLeaveData.actualWorkingDays} ÷ 2 = {earnedLeaveData.earnedLeave} days</div>
                              <div className="mt-1">Current EL Balance: {earnedLeaveData.currentELBalance} days</div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>Click "Calculate EL" to see your earned leave calculation</p>
                      </div>
                    )}
                    
                    <div className="flex justify-center">
                      <button
                        onClick={calculateEarnedLeave}
                        disabled={elLoading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {elLoading ? 'Calculating...' : 'Calculate & Update EL'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                {editMode ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">Edit Profile</h4>
                      <p className="text-gray-600">Update your personal information</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Mobile Number</label>
                        <input
                          type="tel"
                          pattern="[0-9]{10}"
                          value={formData.mobileNo}
                          onChange={(e) => setFormData({...formData, mobileNo: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                          placeholder="Enter your mobile number"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Blood Group</label>
                        <select
                          value={formData.bloodGroup}
                          onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          required
                        >
                          <option value="">Select Blood Group</option>
                          {bloodGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Date of Joining</label>
                        <input
                          type="date"
                          value={formData.dateOfJoining}
                          onChange={(e) => setFormData({...formData, dateOfJoining: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed opacity-60"
                          disabled
                        />
                        <p className="text-xs text-gray-500">Date of joining cannot be changed</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
                        rows="4"
                        placeholder="Enter your address"
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                      >
                        {loading && (
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h4>
                      <p className="text-gray-600">Your profile details and contact information</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                        <div className="text-gray-900 font-medium">{user.name}</div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Email</label>
                        <div className="text-gray-900 font-medium">{user.email}</div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Mobile Number</label>
                        <div className="text-gray-900 font-medium">{user.mobileNo}</div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Blood Group</label>
                        <div className="text-gray-900 font-medium">{user.bloodGroup}</div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Age</label>
                        <div className="text-gray-900 font-medium">{calculateAge(user.dateOfBirth)} years</div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
                        <div className="text-gray-900 font-medium">
                          {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }) : ''}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Date of Joining</label>
                        <div className="text-gray-900 font-medium">
                          {user.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }) : ''}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Years of Service</label>
                        <div className="text-gray-900 font-medium">{getYearsOfService(user.dateOfJoining)} years</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Address</label>
                      <div className="text-gray-900 font-medium p-4 bg-gray-50 rounded-xl">{user.address}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {passwordMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-screen overflow-y-auto">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
                  <p className="text-gray-600">Update your account password</p>
                </div>
                
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Current Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                        placeholder="Enter current password"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      placeholder="Enter new password (min 6 characters)"
                      required
                      minLength="6"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                      placeholder="Confirm new password"
                      required
                      minLength="6"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordMode(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                      }}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {loading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;