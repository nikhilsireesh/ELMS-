import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const EmployeeHistory = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const leaveTypes = ['CL', 'SCL', 'EL', 'HPL', 'CCL'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves/my-leaves');
      setApplications(response.data.data.leaves);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
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

  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || application.status === statusFilter;
    const matchesLeaveType = !leaveTypeFilter || application.leaveType?.toUpperCase() === leaveTypeFilter;
    const matchesYear = !yearFilter || new Date(application.createdAt).getFullYear().toString() === yearFilter;
    return matchesSearch && matchesStatus && matchesLeaveType && matchesYear;
  });

  const getStats = () => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const rejected = applications.filter(app => app.status === 'rejected').length;
    const totalDays = applications
      .filter(app => app.status === 'approved')
      .reduce((sum, app) => sum + (app.numberOfDays || 0), 0);

    return { total, pending, approved, rejected, totalDays };
  };

  const stats = getStats();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leave History</h1>
        <p className="text-gray-600">View all your leave applications and their status</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card">
          <div className="card-content text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content text-center">
            <div className="text-2xl font-bold text-warning-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content text-center">
            <div className="text-2xl font-bold text-success-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content text-center">
            <div className="text-2xl font-bold text-danger-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.totalDays}</div>
            <div className="text-sm text-gray-600">Days Taken</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="label">Search</label>
              <input
                type="text"
                placeholder="Search by reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="label">Leave Type</label>
              <select
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="input"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setLeaveTypeFilter('');
                  setYearFilter('');
                }}
                className="btn btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card">
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">Leave Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Applied On</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((application) => (
                  <tr key={application._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {getLeaveTypeBadge(application.leaveType?.toUpperCase())}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">
                          {application.fromDate && application.toDate ? 
                            (() => {
                              const fromDate = new Date(application.fromDate);
                              const toDate = new Date(application.toDate);
                              const fromDateStr = isNaN(fromDate.getTime()) ? 'Invalid Date' : fromDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
                              const toDateStr = isNaN(toDate.getTime()) ? 'Invalid Date' : toDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
                              return `${fromDateStr} - ${toDateStr}`;
                            })() :
                            'Date not available'
                          }
                        </div>
                        <div className="text-sm text-gray-500">{application.numberOfDays || 0} days</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-xs truncate" title={application.reason}>
                        {application.reason}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {new Date(application.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewDetails(application)}
                        className="btn btn-sm btn-outline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApplications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No applications found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Application Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Leave Type</label>
                  <div>{getLeaveTypeBadge(selectedApplication.leaveType?.toUpperCase())}</div>
                </div>
                <div>
                  <label className="label">Status</label>
                  <div>{getStatusBadge(selectedApplication.status)}</div>
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <div className="text-gray-900">
                    {selectedApplication.fromDate ? 
                      (() => {
                        const date = new Date(selectedApplication.fromDate);
                        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
                      })() : 
                      'Date not available'
                    }
                  </div>
                </div>
                <div>
                  <label className="label">End Date</label>
                  <div className="text-gray-900">
                    {selectedApplication.toDate ? 
                      (() => {
                        const date = new Date(selectedApplication.toDate);
                        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
                      })() : 
                      'Date not available'
                    }
                  </div>
                </div>
                <div>
                  <label className="label">Duration</label>
                  <div className="text-gray-900">{selectedApplication.numberOfDays || 0} days</div>
                </div>
                <div>
                  <label className="label">Applied On</label>
                  <div className="text-gray-900">{new Date(selectedApplication.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}</div>
                </div>
              </div>
              
              <div>
                <label className="label">Reason for Leave</label>
                <div className="text-gray-900 p-3 bg-gray-50 rounded-md">
                  {selectedApplication.reason}
                </div>
              </div>

              {selectedApplication.status === 'rejected' && selectedApplication.rejectionReason && (
                <div>
                  <label className="label">Rejection Reason</label>
                  <div className="text-red-600 p-3 bg-red-50 rounded-md">
                    {selectedApplication.rejectionReason}
                  </div>
                </div>
              )}

              {selectedApplication.status === 'approved' && selectedApplication.approvedBy && (
                <div>
                  <label className="label">Approved By</label>
                  <div className="text-gray-900">{selectedApplication.approvedBy.name}</div>
                </div>
              )}

              {selectedApplication.status === 'rejected' && selectedApplication.rejectedBy && (
                <div>
                  <label className="label">Rejected By</label>
                  <div className="text-gray-900">{selectedApplication.rejectedBy.name}</div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedApplication(null);
                }}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeHistory; 