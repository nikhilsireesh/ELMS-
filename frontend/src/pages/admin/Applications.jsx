import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics', 
    'Mechanical', 'Civil', 'Management', 'Human Resources'
  ];

  const leaveTypes = ['CL', 'SCL', 'EL', 'HPL', 'CCL'];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves');
      setApplications(response.data.data.leaves || []);
    } catch (error) {
      setApplications([]);
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    try {
      await api.put(`/leaves/${applicationId}/status`, { status: 'approved' });
      fetchApplications();
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleReject = async (applicationId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    try {
      await api.put(`/leaves/${applicationId}/status`, { 
        status: 'rejected', 
        rejectionReason: rejectionReason 
      });
      setRejectionReason('');
      setShowDetailsModal(false);
      fetchApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
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

  const filteredApplications = (applications || []).filter(application => {
    const matchesSearch = application.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || application.status === statusFilter;
    const matchesDepartment = !departmentFilter || application.employee.department === departmentFilter;
    const matchesLeaveType = !leaveTypeFilter || application.leaveType === leaveTypeFilter;
    return matchesSearch && matchesStatus && matchesDepartment && matchesLeaveType;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Applications</h1>
          <p className="text-gray-600">Review and manage all leave applications</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">
            {(applications || []).filter(app => app.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-500">Pending Applications</div>
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
                placeholder="Search by name or ID..."
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
              <label className="label">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="input"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
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
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setDepartmentFilter('');
                  setLeaveTypeFilter('');
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
                  <th className="text-left py-3 px-4 font-semibold">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold">Leave Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Applied On</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(filteredApplications || []).map((application) => (
                  <tr key={application._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{application.employee.name}</div>
                        <div className="text-sm text-gray-500">{application.employee.employeeId}</div>
                        <div className="text-xs text-gray-400">{application.employee.department}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getLeaveTypeBadge(application.leaveType)}
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
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(application)}
                          className="btn btn-sm btn-outline"
                        >
                          View
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(application._id)}
                              className="btn btn-sm btn-success"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleViewDetails(application)}
                              className="btn btn-sm btn-danger"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredApplications.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No applications found matching your criteria.
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
                  <label className="label">Employee Name</label>
                  <div className="text-gray-900">{selectedApplication.employee.name}</div>
                </div>
                <div>
                  <label className="label">Employee ID</label>
                  <div className="text-gray-900 font-mono">{selectedApplication.employee.employeeId}</div>
                </div>
                <div>
                  <label className="label">Role</label>
                  <div className="text-gray-900 uppercase">{selectedApplication.employee.role}</div>
                </div>
                <div>
                  <label className="label">Department</label>
                  <div className="text-gray-900">{selectedApplication.employee.department}</div>
                </div>
                <div>
                  <label className="label">Leave Type</label>
                  <div>{getLeaveTypeBadge(selectedApplication.leaveType?.toUpperCase())}</div>
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
                  <label className="label">Status</label>
                  <div>{getStatusBadge(selectedApplication.status)}</div>
                </div>
              </div>
              
              <div>
                <label className="label">Reason</label>
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

              {selectedApplication.status === 'pending' && (
                <div>
                  <label className="label">Rejection Reason (if rejecting)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="input"
                    rows="3"
                    placeholder="Provide a reason for rejection..."
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedApplication(null);
                  setRejectionReason('');
                }}
                className="btn btn-outline"
              >
                Close
              </button>
              {selectedApplication.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedApplication._id)}
                    className="btn btn-success"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedApplication._id)}
                    className="btn btn-danger"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApplications; 