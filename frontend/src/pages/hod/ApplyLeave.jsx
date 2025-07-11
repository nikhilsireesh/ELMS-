import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import LeavePolicyReference from '../../components/LeavePolicyReference';

const HODApplyLeave = () => {
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
  const [success, setSuccess] = useState(false);

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
    fetchCurrentLeaveBalances();
  }, []);

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
      // Fallback to profile API
      try {
        const response = await api.get('/users/profile');
        setLeaveBalance(response.data.data.user.leaveBalance || {});
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  };

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Please select a leave type';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Please select start date';
    } else {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Please select end date';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please provide a reason for leave';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters long';
    }

    // Check leave balance
    if (formData.leaveType && leaveBalance[formData.leaveType.toLowerCase()]) {
      const days = calculateDays(formData.startDate, formData.endDate);
      const available = leaveBalance[formData.leaveType.toLowerCase()];
      if (days > available) {
        newErrors.leaveType = `Insufficient ${formData.leaveType} balance. Available: ${available} days, Requested: ${days} days`;
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

    try {
      setLoading(true);
      const days = calculateDays(formData.startDate, formData.endDate);
      
      const leaveData = {
        leaveType: formData.leaveType.toLowerCase(), // Convert to lowercase
        fromDate: new Date(formData.startDate).toISOString(), // Ensure ISO8601 format
        toDate: new Date(formData.endDate).toISOString(), // Ensure ISO8601 format
        reason: formData.reason.trim() // Trim whitespace
      };

      await api.post('/leaves', leaveData);
      setSuccess(true);
      setFormData({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: ''
      });
      fetchCurrentLeaveBalances(); // Refresh leave balance
    } catch (error) {
      console.error('Error submitting leave application:', error);
      console.error('Error response:', error.response?.data); // Add detailed error logging
      
      // Extract and display the actual server error message
      let errorMessage = 'Error submitting leave application. Please try again.';
      
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const getAvailableDays = (leaveType) => {
    if (!leaveType) return 0;
    return leaveBalance[leaveType.toLowerCase()] || 0;
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

  if (loading && !success) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Apply for Leave</h1>
        <p className="text-gray-600">Submit your leave application for approval</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="card bg-green-50 border-green-200">
          <div className="card-content">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold text-green-800">Leave Application Submitted!</h3>
                <p className="text-green-700">Your leave application has been submitted successfully and is pending approval.</p>
              </div>
            </div>
            <button
              onClick={() => setSuccess(false)}
              className="btn btn-sm btn-success mt-3"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      )}

      {/* Leave Balance */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your Leave Balance</h3>
          <p className="card-description">Available leave days for different types</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {leaveTypes.map(type => {
              const info = getLeaveTypeInfo(type.value);
              return (
                <div key={type.value} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {info?.balance || 0}
                  </div>
                  <div className="text-sm font-medium text-gray-600">{type.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.label}</div>
                  {info?.quotaInfo && (
                    <div className="text-xs text-blue-600 mt-1">
                      {info.quotaInfo.period}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Leave Application Form</h3>
          <p className="card-description">Fill in the details for your leave request</p>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div>
              <label className="label">Leave Type *</label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleInputChange}
                className={`input ${errors.leaveType ? 'input-error' : ''}`}
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} (Available: {getAvailableDays(type.value)} days)
                  </option>
                ))}
              </select>
              {errors.leaveType && <p className="error-message">{errors.leaveType}</p>}
              
              {/* Leave Type Information */}
              {formData.leaveType && (
                <div className="mt-3 space-y-2">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`input ${errors.startDate ? 'input-error' : ''}`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.startDate && <p className="error-message">{errors.startDate}</p>}
              </div>
              <div>
                <label className="label">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`input ${errors.endDate ? 'input-error' : ''}`}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
                {errors.endDate && <p className="error-message">{errors.endDate}</p>}
              </div>
            </div>

            {/* Duration Display */}
            {formData.startDate && formData.endDate && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Duration:</strong> {calculateDays(formData.startDate, formData.endDate)} days
                  {formData.leaveType && (
                    <span className="ml-4">
                      <strong>Available Balance:</strong> {getAvailableDays(formData.leaveType)} days
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="label">Reason for Leave *</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows="4"
                placeholder="Please provide a detailed reason for your leave request..."
                className={`input ${errors.reason ? 'input-error' : ''}`}
              />
              {errors.reason && <p className="error-message">{errors.reason}</p>}
              <p className="text-sm text-gray-500 mt-1">
                Minimum 10 characters required. Be specific about your reason.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    leaveType: '',
                    startDate: '',
                    endDate: '',
                    reason: ''
                  });
                  setErrors({});
                }}
                className="btn btn-outline btn-form"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-form"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Guidelines */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Leave Application Guidelines</h3>
        </div>
        <div className="card-content">
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <span className="text-primary-600">•</span>
              <span>Submit applications at least 3 days in advance for planned leaves</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary-600">•</span>
              <span>For emergency leaves, submit within 24 hours of your return</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary-600">•</span>
              <span>Ensure you have sufficient leave balance before applying</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary-600">•</span>
              <span>Provide accurate contact information for emergency communication</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary-600">•</span>
              <span>Your application will be reviewed by the department head</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Policy Reference */}
      <LeavePolicyReference />
    </div>
  );
};

export default HODApplyLeave; 