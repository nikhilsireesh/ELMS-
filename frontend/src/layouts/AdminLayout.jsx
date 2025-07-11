import { Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  FileText, 
  User, 
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminApplications from '../pages/admin/Applications';
import AdminEmployees from '../pages/admin/Employees';
import AdminProfile from '../pages/admin/Profile';
import logo from '../logo/image.png';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Applications', href: '/admin/applications', icon: FileText },
    { name: 'Employees', href: '/admin/employees', icon: Users },
    { name: 'Profile', href: '/admin/profile', icon: User },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          {/* Mobile Header */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg p-1 shadow-md">
                <img 
                  src={logo} 
                  alt="MIC College Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold" style={{ color: 'var(--mic-deep-blue)' }}>
                  MIC ELMS
                </h1>
                <p className="text-xs" style={{ color: 'var(--mic-bright-red)' }}>
                  Admin Portal
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                  isActive(item.href)
                    ? 'text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={isActive(item.href) ? {
                  background: 'linear-gradient(135deg, var(--mic-bright-red), var(--mic-red-dark))'
                } : {}}
              >
                <item.icon className={`mr-3 h-5 w-5 ${
                  isActive(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                <span className="relative">
                  {item.name}
                  {isActive(item.href) && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full"></div>
                  )}
                </span>
              </a>
            ))}
          </nav>

          {/* Mobile User Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--mic-bright-red)' }}>
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs" style={{ color: 'var(--mic-bright-red)' }}>Admin</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          {/* Desktop Header */}
          <div className="flex h-20 items-center px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl p-2 shadow-lg border border-gray-100">
                <img 
                  src={logo} 
                  alt="MIC College Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--mic-deep-blue)' }}>
                  MIC ELMS
                </h1>
                <p className="text-sm" style={{ color: 'var(--mic-bright-red)' }}>
                  Admin Portal
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                  isActive(item.href)
                    ? 'text-white shadow-md transform scale-105'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:scale-102'
                }`}
                style={isActive(item.href) ? {
                  background: 'linear-gradient(135deg, var(--mic-bright-red), var(--mic-red-dark))'
                } : {}}
              >
                <item.icon className={`mr-3 h-5 w-5 transition-colors ${
                  isActive(item.href) ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                <span className="relative font-semibold">
                  {item.name}
                  {isActive(item.href) && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full"></div>
                  )}
                </span>
                {isActive(item.href) && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full -ml-4"></div>
                )}
              </a>
            ))}
          </nav>

          {/* Desktop User Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4 p-3 rounded-xl bg-gray-50">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--mic-bright-red)' }}>
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs" style={{ color: 'var(--mic-bright-red)' }}>Admin</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-all duration-200 hover:scale-102"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center gap-x-4">
                <span className="text-sm font-medium" style={{ color: 'var(--mic-deep-blue)' }}>
                  Welcome, {user?.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="employees" element={<AdminEmployees />} />
              <Route path="profile" element={<AdminProfile />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;