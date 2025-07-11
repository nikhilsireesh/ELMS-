import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: 'var(--mic-deep-blue)',
      textColor: 'var(--mic-deep-blue)',
    },
    {
      title: 'Total HODs',
      value: stats?.totalHODs || 0,
      icon: Users,
      color: 'var(--mic-logo-yellow)',
      textColor: 'var(--mic-logo-yellow)',
    },
    {
      title: 'Pending Applications',
      value: stats?.pendingLeaves || 0,
      icon: Clock,
      color: 'var(--mic-logo-yellow)',
      textColor: 'var(--mic-logo-yellow)',
    },
    {
      title: 'Approved Applications',
      value: stats?.approvedLeaves || 0,
      icon: CheckCircle,
      color: 'var(--mic-logo-green)',
      textColor: 'var(--mic-logo-green)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--mic-deep-blue)' }}>Admin Dashboard</h1>
        <p className="text-gray-600">Overview of the MIC ELMS system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="p-2 rounded-lg" style={{ backgroundColor: card.color }}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      {stats?.recentLeaves && stats.recentLeaves.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Leave Applications</h2>
            <p className="card-description">Latest pending leave applications</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {stats.recentLeaves.map((leave) => (
                <div key={leave._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {leave.employee?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {leave.employee?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {leave.employee?.department} • {leave.leaveType.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {leave.numberOfDays} day(s)
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(leave.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Department Distribution */}
      {stats?.departmentLeaves && stats.departmentLeaves.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Department-wise Pending Applications</h2>
            <p className="card-description">Distribution of pending leave applications by department</p>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {stats.departmentLeaves.map((dept) => (
                <div key={dept._id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{dept._id}</span>
                  <span className="text-sm text-gray-500">{dept.count} applications</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;