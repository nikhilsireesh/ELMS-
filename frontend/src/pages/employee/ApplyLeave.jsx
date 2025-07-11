import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import LeavePolicyReference from '../../components/LeavePolicyReference';

const EmployeeApplyLeave = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [clQuotaInfo, setClQuotaInfo] = useState(null);
  const [sclQuotaInfo, setSclQuotaInfo] = useState(null);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [errors, setErrors] = useState({});
  const [calculatedDays, setCalculatedDays] = useState(0);

  const leaveTypes = [
    { 
      value: 'CL', 
      label: 'Casual Leave (CL)', 
      maxDays: 6, // Will be updated dynamically
      meaning: 'For unexpected personal needs (sudden errands, emergencies).',
      rules: 'Given in two parts: 6 days for Jan–Jun, 6 days for Jul–Dec. Cannot carry forward to next half-year.',
      description: 'For unexpected personal needs and emergencies'
    },
    { 
      value: 'SCL', 
      label: 'Special Casual Leave (SCL)', 
      maxDays: 4, // Will be updated dynamically
      meaning: 'For special situations like family functions, personal matters needing extra time.',
      rules: 'Given in two parts: 4 days for Jan–Jun, 4 days for Jul–Dec. Cannot carry forward to next half-year.',
      description: 'For special situations and family functions'
    },
    { 
      value: 'EL', 
      label: 'Earned Leave (EL)', 
      maxDays: '∞',
      meaning: 'For longer planned leaves — vacation, rest, or personal work.',
      rules: 'Earned by working: (Total working days - Leaves taken) ÷ 2. E.g., if worked 200 days and took 10 days leave → EL = (200-10) ÷ 2 = 95 days.',
      description: 'For longer planned leaves and vacations (varies based on actual working days)'
    },
    { 
      value: 'HPL', 
      label: 'Half Pay Leave (HPL)', 
      maxDays: 10,
      meaning: 'For extended sickness or special conditions where full pay is not needed.',
      rules: 'Allotted once every 3 years from the Date of Joining (DOJ). After 3 years of service → gets 10 HPL days.',
      description: 'For extended sickness with half salary'
    },
    { 
      value: 'CCL', 
      label: 'Child Care Leave (CCL)', 
      maxDays: 7,
      meaning: 'Leave to take care of children (school, health, emergencies).',
      rules: 'Fixed quota per year. Cannot exceed this limit in a year.',
      description: 'For child care purposes'
    }
  ];

  useEffect(() => {
    // Fetch current leave balances with correct quotas
    fetchCurrentLeaveBalances();
  }, [user]);

  const fetchCurrentLeaveBalances = async () => {
    try {
      const response = await api.get('/users/current-leave-balances');
      if (response.data.success) {
        const { cl, scl, el, hpl, ccl, clInfo, sclInfo } = response.data.data;
        setLeaveBalance({
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
      // Fallback to user data if API fails
      if (user?.leaveBalance) {
        setLeaveBalance(user.leaveBalance);
      }
    }
  };

  useEffect(() => {
    calculateDays();
  }, [formData.startDate, formData.endDate]);

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start > end) {
        setCalculatedDays(0);
        return;
      }

      let days = 0;
      const current = new Date(start);
      
      while (current <= end) {
        // Skip weekends (Saturday = 6, Sunday = 0)
        if (current.getDay() !== 0 && current.getDay() !== 6) {
          days++;
        }
        current.setDate(current.getDate() + 1);
      }
      
      setCalculatedDays(days);
    } else {
      setCalculatedDays(0);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Please select a leave type';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Please select start date';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Please select end date';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }

      if (start > end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for leave';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters long';
    } else if (formData.reason.trim().length > 500) {
      newErrors.reason = 'Reason cannot exceed 500 characters';
    }

    // Check leave balance
    if (formData.leaveType && calculatedDays > 0) {
      const availableBalance = leaveBalance[formData.leaveType.toLowerCase()] || 0;
      if (calculatedDays > availableBalance) {
        newErrors.leaveType = `Insufficient ${formData.leaveType} balance. You have ${availableBalance} days remaining, but requested ${calculatedDays} days.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const applicationData = {
        leaveType: formData.leaveType.toLowerCase(), // Convert to lowercase
        fromDate: new Date(formData.startDate).toISOString(), // Ensure ISO8601 format
        toDate: new Date(formData.endDate).toISOString(), // Ensure ISO8601 format
        reason: formData.reason.trim() // Trim whitespace
      };

      await api.post('/leaves', applicationData);
      
      // Reset form
      setFormData({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      setCalculatedDays(0);
      setErrors({});
      
      alert('Leave application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      console.error('Error response:', error.response?.data); // Add detailed error logging
      
      // Extract and display the actual server error message
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors[0].msg;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getLeaveTypeInfo = (type) => {
    const leaveType = leaveTypes.find(lt => lt.value === type);
    if (!leaveType) return null;

    const balance = leaveBalance[type.toLowerCase()] || 0;
    
    // Update max days for CL and SCL based on current quota
    let maxDays = leaveType.maxDays;
    let quotaInfo = null;
    
    if (type === 'CL' && clQuotaInfo) {
      maxDays = clQuotaInfo.quota;
      quotaInfo = clQuotaInfo;
    } else if (type === 'SCL' && sclQuotaInfo) {
      maxDays = sclQuotaInfo.quota;
      quotaInfo = sclQuotaInfo;
    }
    
    // EL is always available regardless of balance (it can be negative)
    const isAvailable = type === 'EL' ? true : balance > 0;
    
    return {
      ...leaveType,
      maxDays,
      balance,
      available: isAvailable,
      quotaInfo
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Apply for Leave</h1>
        <p className="text-gray-600">Submit a new leave application</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Leave Balance</h3>
              <p className="card-description">Your current entitlements</p>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {leaveTypes.map((type) => {
                  const info = getLeaveTypeInfo(type.value);
                  return (
                    <div key={type.value} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs text-gray-500">
                          {info?.quotaInfo ? 
                            `${info.quotaInfo.period}: ${info.quotaInfo.quota} days` : 
                            `Max: ${info?.maxDays || type.maxDays}${type.maxDays === '∞' ? '' : ' days'}`
                          }
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${info?.available ? 'text-green-600' : 'text-red-600'}`}>
                          {info?.balance || 0}
                        </div>
                        <div className="text-xs text-gray-500">remaining</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Leave Application Form</h3>
              <p className="card-description">Fill in the details for your leave request</p>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="label">Leave Type *</label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                    className={`input ${errors.leaveType ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map((type) => {
                      const info = getLeaveTypeInfo(type.value);
                      return (
                        <option 
                          key={type.value} 
                          value={type.value}
                          disabled={!info?.available}
                        >
                          {type.label} ({info?.balance || 0} days remaining)
                        </option>
                      );
                    })}
                  </select>
                  {errors.leaveType && (
                    <p className="text-red-500 text-sm mt-1">{errors.leaveType}</p>
                  )}
                  
                  {/* Leave Type Information */}
                  {formData.leaveType && (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm space-y-2">
                        <div className="font-semibold text-blue-900 mb-2">
                          {leaveTypes.find(t => t.value === formData.leaveType)?.label} Policy:
                        </div>
                        <div className="text-blue-800">
                          <strong>Purpose:</strong> {leaveTypes.find(t => t.value === formData.leaveType)?.meaning}
                        </div>
                        <div className="text-blue-800">
                          <strong>Allotment:</strong> {(() => {
                            const info = getLeaveTypeInfo(formData.leaveType);
                            if (info?.quotaInfo) {
                              return `${info.quotaInfo.quota} days (${info.quotaInfo.period})`;
                            }
                            return `${info?.maxDays || 'Varies'} days per year`;
                          })()}
                        </div>
                        <div className="text-blue-800">
                          <strong>Rules:</strong> {leaveTypes.find(t => t.value === formData.leaveType)?.rules}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className={`input ${errors.startDate ? 'border-red-500' : ''}`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">End Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className={`input ${errors.endDate ? 'border-red-500' : ''}`}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                    )}
                  </div>
                </div>

                {calculatedDays > 0 && (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">Working Days:</span>
                        <span className="text-lg font-bold text-blue-900">{calculatedDays} days</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Weekends are automatically excluded from the calculation
                      </p>
                    </div>
                    
                    {/* Balance Check Warning */}
                    {formData.leaveType && (
                      <div className={`p-3 rounded-lg border ${
                        calculatedDays > (leaveBalance[formData.leaveType.toLowerCase()] || 0)
                          ? 'bg-red-50 border-red-200'
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${
                            calculatedDays > (leaveBalance[formData.leaveType.toLowerCase()] || 0)
                              ? 'text-red-800'
                              : 'text-green-800'
                          }`}>
                            {formData.leaveType} Balance:
                          </span>
                          <span className={`text-lg font-bold ${
                            calculatedDays > (leaveBalance[formData.leaveType.toLowerCase()] || 0)
                              ? 'text-red-900'
                              : 'text-green-900'
                          }`}>
                            {leaveBalance[formData.leaveType.toLowerCase()] || 0} days available
                          </span>
                        </div>
                        {calculatedDays > (leaveBalance[formData.leaveType.toLowerCase()] || 0) && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            ⚠️ Insufficient balance! You need {calculatedDays - (leaveBalance[formData.leaveType.toLowerCase()] || 0)} more days.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="label">Reason for Leave *</label>
                  <textarea
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className={`input ${errors.reason ? 'border-red-500' : ''}`}
                    rows="4"
                    placeholder="Please provide a detailed reason for your leave request..."
                  />
                  {errors.reason && (
                    <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                  )}
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Minimum 10 characters required. Be specific about your reason.</span>
                    <span>{formData.reason.length}/500 characters</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        leaveType: '',
                        startDate: '',
                        endDate: '',
                        reason: ''
                      });
                      setCalculatedDays(0);
                      setErrors({});
                    }}
                    className="btn btn-outline btn-form"
                  >
                    Reset Form
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-form" 
                    disabled={loading || calculatedDays === 0}
                    style={{
                      minWidth: '160px',
                      boxShadow: loading ? 'none' : '0 4px 12px rgba(211, 47, 47, 0.3)'
                    }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Policy Reference */}
      <LeavePolicyReference />
    </div>
  );
};

export default EmployeeApplyLeave; 