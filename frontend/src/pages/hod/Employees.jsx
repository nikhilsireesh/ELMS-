import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const HODEmployees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setEmployees(response.data.data.users || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
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

  // Filter out admin users and only show department employees
  const departmentEmployees = (employees || []).filter(emp => 
    emp.role !== 'admin' && emp.department === user?.department
  );

  // Separate HOD and regular employees
  const currentHOD = departmentEmployees.find(emp => emp.role === 'hod');
  const regularEmployees = departmentEmployees.filter(emp => emp.role === 'employee');

  // Apply search and role filters to regular employees only
  const filteredRegularEmployees = regularEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || employee.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getStats = () => {
    const total = departmentEmployees.length;
    const active = departmentEmployees.filter(emp => emp.isActive).length;
    const employeeCount = regularEmployees.length;

    return { total, active, employeeCount };
  };

  const stats = getStats();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Department Employees</h1>
          <p className="text-gray-600">Manage employees in {user?.department} department</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">{stats.employeeCount}</div>
          <div className="text-sm text-gray-500">Department Employees</div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-content text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total (Including HOD)</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content text-center">
            <div className="text-2xl font-bold text-success-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
        </div>
        <div className="card">
          <div className="card-content text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.employeeCount}</div>
            <div className="text-sm text-gray-600">Department Employees</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Search</label>
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input"
              >
                <option value="">All Roles</option>
                <option value="hod">HOD</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('');
                }}
                className="btn btn-outline w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Service</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Show HOD first if exists */}
                {currentHOD && (
                  <tr key={currentHOD._id} className="border-b border-gray-100 hover:bg-gray-50 bg-primary-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {currentHOD.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium flex items-center">
                            {currentHOD.name}
                            <span className="ml-2 text-xs bg-primary-600 text-white px-2 py-1 rounded-full">HEAD</span>
                          </div>
                          <div className="text-sm text-gray-500 font-mono">{currentHOD.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm">{currentHOD.email}</div>
                        <div className="text-xs text-gray-500">{currentHOD.mobileNo}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge role-hod">
                        HOD
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div>{getYearsOfService(currentHOD.dateOfJoining)} years</div>
                        <div className="text-xs text-gray-500">
                          Joined: {new Date(currentHOD.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewDetails(currentHOD)}
                        className="btn btn-sm btn-outline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                )}
                
                {/* Show filtered regular employees */}
                {filteredRegularEmployees.map((employee) => (
                  <tr key={employee._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">
                            {employee.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-500 font-mono">{employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm">{employee.email}</div>
                        <div className="text-xs text-gray-500">{employee.mobileNo}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge role-employee">
                        EMPLOYEE
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div>{getYearsOfService(employee.dateOfJoining)} years</div>
                        <div className="text-xs text-gray-500">
                          Joined: {new Date(employee.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleViewDetails(employee)}
                        className="btn btn-sm btn-outline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!currentHOD && filteredRegularEmployees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No employees found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Employee Details</h2>
            
            <div className="space-y-4">
              {/* Employee Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="text-gray-900">{selectedEmployee.name}</div>
                </div>
                <div>
                  <label className="label">Employee ID</label>
                  <div className="text-gray-900 font-mono">{selectedEmployee.employeeId}</div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <div className="text-gray-900">{selectedEmployee.email}</div>
                </div>
                <div>
                  <label className="label">Mobile Number</label>
                  <div className="text-gray-900">{selectedEmployee.mobileNo}</div>
                </div>
                <div>
                  <label className="label">Role</label>
                  <div>
                    <span className={`badge ${selectedEmployee.role === 'hod' ? 'role-hod' : 'role-employee'}`}>
                      {selectedEmployee.role.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="label">Blood Group</label>
                  <div className="text-gray-900">{selectedEmployee.bloodGroup}</div>
                </div>
                <div>
                  <label className="label">Age</label>
                  <div className="text-gray-900">{calculateAge(selectedEmployee.dateOfBirth)} years</div>
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <div className="text-gray-900">
                    {selectedEmployee.dateOfBirth ? new Date(selectedEmployee.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }) : ''}
                  </div>
                </div>
                <div>
                  <label className="label">Date of Joining</label>
                  <div className="text-gray-900">
                    {selectedEmployee.dateOfJoining ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' }) : ''}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="label">Address</label>
                <div className="text-gray-900 p-3 bg-gray-50 rounded-md">
                  {selectedEmployee.address}
                </div>
              </div>

              {/* Leave Balance */}
              <div>
                <label className="label">Leave Balance</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {selectedEmployee.leaveBalance && Object.entries(selectedEmployee.leaveBalance).map(([type, balance]) => (
                    <div key={type} className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-gray-900">{balance}</div>
                      <div className="text-xs text-gray-500">{type.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Years of Service</label>
                  <div className="text-gray-900">{getYearsOfService(selectedEmployee.dateOfJoining)} years</div>
                </div>
                <div>
                  <label className="label">Last Login</label>
                  <div className="text-gray-900">
                    {selectedEmployee.lastLogin ? new Date(selectedEmployee.lastLogin).toLocaleString() : 'Never'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedEmployee(null);
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

export default HODEmployees; 