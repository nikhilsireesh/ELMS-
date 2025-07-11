import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const HODHistory = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('my'); // 'my' or 'department'
  const [myHistory, setMyHistory] = useState([]);
  const [deptHistory, setDeptHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const leaveTypes = ['CL', 'SCL', 'EL', 'HPL', 'CCL'];

  useEffect(() => {
    fetchHistory();
  }, [tab]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      if (tab === 'my') {
        const res = await api.get('/leaves/my-leaves');
        setMyHistory(res.data.data.leaves);
      } else {
        const res = await api.get('/leaves');
        setDeptHistory(res.data.data.leaves);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
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

  const filteredHistory = (tab === 'my' ? myHistory : deptHistory).filter((leave) => {
    const matchesSearch = tab === 'my'
      ? leave.reason.toLowerCase().includes(searchTerm.toLowerCase())
      : leave.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !leaveTypeFilter || leave.leaveType === leaveTypeFilter;
    const matchesStatus = !statusFilter || leave.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave History</h1>
          <p className="text-gray-600">View your own and department leave history</p>
        </div>
        <div className="flex space-x-2">
          <button
            className={`btn btn-sm ${tab === 'my' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('my')}
          >
            My History
          </button>
          <button
            className={`btn btn-sm ${tab === 'department' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab('department')}
          >
            Department History
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">{tab === 'my' ? 'Search Reason' : 'Search Employee/Reason'}</label>
              <input
                type="text"
                placeholder={tab === 'my' ? 'Search by reason...' : 'Search by name, ID, or reason...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
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
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setLeaveTypeFilter('');
                  setStatusFilter('');
                }}
                className="btn btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card">
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {tab === 'department' && <th className="text-left py-3 px-4 font-semibold">Employee</th>}
                  <th className="text-left py-3 px-4 font-semibold">Leave Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold">Reason</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Applied On</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((leave) => (
                  <tr key={leave._id} className="border-b border-gray-100 hover:bg-gray-50">
                    {tab === 'department' && (
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{leave.employee.name}</div>
                          <div className="text-sm text-gray-500">{leave.employee.employeeId}</div>
                        </div>
                      </td>
                    )}
                    <td className="py-3 px-4">{getLeaveTypeBadge(leave.leaveType)}</td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">
                          {leave.fromDate && leave.toDate ? 
                            (() => {
                              const fromDate = new Date(leave.fromDate);
                              const toDate = new Date(leave.toDate);
                              const fromDateStr = isNaN(fromDate.getTime()) ? 'Invalid Date' : fromDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
                              const toDateStr = isNaN(toDate.getTime()) ? 'Invalid Date' : toDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
                              return `${fromDateStr} - ${toDateStr}`;
                            })() :
                            'Date not available'
                          }
                        </div>
                        <div className="text-sm text-gray-500">{leave.numberOfDays || 0} days</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="max-w-xs truncate" title={leave.reason}>{leave.reason}</div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(leave.status)}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{new Date(leave.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No leave records found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODHistory; 