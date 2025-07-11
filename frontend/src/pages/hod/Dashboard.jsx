import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const HODDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, employeesResponse, applicationsResponse] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/users'),
        api.get('/leaves')
      ]);
      
      // Map backend stats to frontend expectations
      const backendStats = statsResponse.data.data.stats;
      
      const mappedStats = {
        totalEmployees: backendStats.departmentEmployees || 0,
        pendingApplications: backendStats.pendingLeaves || 0,
        approvedThisMonth: backendStats.approvedThisMonth || 0,
        totalLeaveDays: backendStats.totalLeaveDays || 0
      };
      
      setStats(mappedStats);
      
      // Filter employees by department
      const allEmployees = employeesResponse.data.data.users || [];
      const deptEmployees = allEmployees.filter(emp => 
        emp.department === user?.department && emp.role === 'employee'
      );
      setDepartmentEmployees(deptEmployees);
      
      // Filter applications by department
      const allApplications = applicationsResponse.data.data.leaves || [];
      const deptApplications = allApplications.filter(app => 
        app.department === user?.department
      );
      setRecentApplications(deptApplications.slice(0, 5));
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
      <div className="bg-gradient-to-r rounded-lg p-6 text-white" style={{ background: 'var(--hod-gradient)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
            <p className="text-white/90 mt-2">
              Head of Department - {user?.department} | Employee ID: {user?.employeeId}
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

      {/* Department Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Department Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                <p className="text-sm font-medium text-gray-600">Approved This Month</p>
                <p className="text-2xl font-bold text-success-600">{stats.approvedThisMonth || 0}</p>
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
                <p className="text-sm font-medium text-gray-600">Total Leave Days</p>
                <p className="text-2xl font-bold text-primary-600">{stats.totalLeaveDays || 0}</p>
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

      {/* Department Overview and Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Employees */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Department Employees</h3>
            <p className="card-description">Your department team members</p>
          </div>
          <div className="card-content">
            {departmentEmployees.length > 0 ? (
              <div className="space-y-3">
                {departmentEmployees.slice(0, 5).map((employee) => (
                  <div key={employee._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-600">
                          {employee.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{employee.name}</div>
                        <div className="text-xs text-gray-500">{employee.employeeId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${employee.role === 'hod' ? 'role-hod' : 'role-employee'}`}>
                        {employee.role.toUpperCase()}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                ))}
                {departmentEmployees.length > 5 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => window.location.href = '/hod/employees'}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View all {departmentEmployees.length} employees →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No employees in your department yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Applications</h3>
            <p className="card-description">Latest leave requests from your department</p>
          </div>
          <div className="card-content">
            {recentApplications.length > 0 ? (
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <div key={application._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getLeaveTypeBadge(application.leaveType)}
                      <div>
                        <div className="font-medium text-sm">{application.employee?.name || 'Unknown Employee'}</div>
                        <div className="text-xs text-gray-500">
                          {application.fromDate && application.toDate ? 
                            `${new Date(application.fromDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })} - ${new Date(application.toDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}` :
                            'Date not available'
                          }
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(application.status)}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(application.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <button
                    onClick={() => window.location.href = '/hod/applications'}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View all applications →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No applications yet</p>
                <p className="text-sm">Employees will appear here when they apply for leave</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => window.location.href = '/hod/applications'}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Review Applications</div>
                  <div className="text-sm text-gray-500">Approve or reject leave requests</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/hod/employees'}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Manage Employees</div>
                  <div className="text-sm text-gray-500">View department employees</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/hod/apply-leave'}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Apply for Leave</div>
                  <div className="text-sm text-gray-500">Submit your own leave request</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => window.location.href = '/hod/history'}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">View History</div>
                  <div className="text-sm text-gray-500">Check department leave history</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODDashboard; 