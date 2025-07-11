import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, applicationsResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/leaves/my-leaves')
      ]);
      setStats(statsResponse.data.data.stats);
      setRecentApplications(applicationsResponse.data.data.leaves.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge status-pending">Pending</span>;
      case 'approved':
        return <span className="badge status-approved">Approved</span>;
      case 'rejected':
        return <span className="badge status-rejected">Rejected</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
    }
  };

  const getLeaveTypeBadge = (type) => {
    const colors = {
      'CL': 'bg-blue-100 text-blue-800',
      'SCL': 'bg-green-100 text-green-800',
      'EL': 'bg-purple-100 text-purple-800',
      'HPL': 'bg-orange-100 text-orange-800',
      'CCL': 'bg-pink-100 text-pink-800'
    };
    return (
      <span className={`badge ${colors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="rounded-lg p-6 text-white" style={{ background: 'var(--employee-gradient)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="text-white/90 mt-2">
              Employee ID: {user?.employeeId} | Department: {user?.department}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/80">Today's Date</div>
            <div className="text-xl font-semibold">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-warning-600">{stats.pendingApplications || 0}</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-full">
                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Leaves</p>
                <p className="text-2xl font-bold text-success-600">{stats.approvedApplications || 0}</p>
              </div>
              <div className="p-3 bg-success-100 rounded-full">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Days Taken</p>
                <p className="text-2xl font-bold text-primary-600">{stats.totalDaysTaken || 0}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balance and Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Balance */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Leave Balance</h3>
            <p className="card-description">Your current leave entitlements</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {user?.leaveBalance && Object.entries(user.leaveBalance).map(([type, balance]) => (
                <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span className="font-medium">{type.toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{balance}</div>
                    <div className="text-sm text-gray-500">days remaining</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Applications</h3>
            <p className="card-description">Your latest leave applications</p>
          </div>
          <div className="card-content">
            {recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <div key={application._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getLeaveTypeBadge(application.leaveType)}
                      <div>
                        <div className="font-medium text-sm">
                          {new Date(application.fromDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })} - {new Date(application.toDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}
                        </div>
                        <div className="text-xs text-gray-500">{application.numberOfDays} days</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(application.status)}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(application.appliedAt || application.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No applications yet</p>
                <p className="text-sm">Start by applying for leave</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-description">Common tasks and shortcuts</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/employee/apply-leave'}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Apply for Leave</div>
                  <div className="text-sm text-gray-500">Submit a new leave request</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/employee/history'}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">View History</div>
                  <div className="text-sm text-gray-500">Check your leave history</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/employee/profile'}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Update Profile</div>
                  <div className="text-sm text-gray-500">Edit your information</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard; 