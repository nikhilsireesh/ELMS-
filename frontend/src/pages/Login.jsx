import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Building2, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import logo from '../logo/image.png';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(() => {
    // Initialize from sessionStorage if available
    return sessionStorage.getItem('loginError') || '';
  });
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Update sessionStorage whenever loginError changes
  useEffect(() => {
    console.log('loginError changed to:', loginError); // Debug log
    if (loginError) {
      sessionStorage.setItem('loginError', loginError);
    } else {
      sessionStorage.removeItem('loginError');
    }
  }, [loginError]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setLoginError(''); // Clear any existing error
    
    try {
      const result = await login(data.email, data.password);
      console.log('Login result:', result); // Debug log
      
      // Only proceed if login was unsuccessful
      if (!result || !result.success) {
        const errorMessage = result?.message || 'Invalid credentials';
        console.log('Setting error:', errorMessage); // Debug log
        setLoginError(errorMessage);
        // No automatic timeout - error persists until manually cleared
      } else {
        console.log('Login successful, clearing any errors'); // Debug log
        setLoginError(''); // Clear error on successful login
      }
    } catch (error) {
      console.error('Login exception:', error);
      setLoginError('Invalid credentials');
      // No automatic timeout - error persists until manually cleared
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    console.log('Manually clearing error'); // Debug log
    setLoginError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" 
         style={{ 
           background: 'linear-gradient(135deg, var(--mic-white), var(--mic-gray-50))',
           backgroundImage: `radial-gradient(circle at 20% 80%, rgba(211, 47, 47, 0.05) 0%, transparent 50%), 
                           radial-gradient(circle at 80% 20%, rgba(0, 43, 127, 0.05) 0%, transparent 50%)`
         }}>
      <div className="max-w-md w-full space-y-8">
        {/* MIC College Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 p-2 bg-white rounded-full shadow-lg border-2 border-gray-100">
            <img 
              src={logo} 
              alt="MIC College Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="mt-4 text-2xl font-bold" style={{ color: 'var(--mic-deep-blue)' }}>
            DVR & Dr. HS MIC College of Technology
          </h1>
          <p className="text-sm font-medium" style={{ color: 'var(--mic-dark-gray)' }}>
            An Autonomous Institution
          </p>
          <h2 className="mt-4 text-xl font-semibold" style={{ color: 'var(--mic-bright-red)' }}>
            Employee Leave Management System
          </h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--mic-dark-gray)' }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="card" style={{ 
          border: '1px solid var(--mic-gray-200)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}>
          <div className="card-header" style={{ 
            background: 'linear-gradient(135deg, var(--mic-deep-blue), var(--mic-bright-red))',
            color: 'var(--mic-white)',
            borderRadius: '0.5rem 0.5rem 0 0'
          }}>
            <h3 className="text-lg font-semibold text-center">
              Sign In to Your Account
            </h3>
          </div>
          <div className="card-content">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Login Error */}
              {loginError && (
                <div style={{ 
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  borderLeft: '4px solid var(--mic-bright-red)',
                  color: 'var(--mic-bright-red)',
                  padding: '1rem',
                  borderRadius: '0.375rem',
                  marginBottom: '1rem'
                }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="font-semibold">
                        {loginError}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearError}
                      className="ml-4 hover:opacity-70 focus:outline-none"
                      style={{ color: 'var(--mic-bright-red)' }}
                      aria-label="Close error message"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="label">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="input pl-10"
                    placeholder="Enter your email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    onFocus={clearError}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-danger-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="input pl-10 pr-10"
                    placeholder="Enter your password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    onFocus={clearError}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-danger-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-lg w-full"
                  style={{
                    background: 'linear-gradient(135deg, var(--mic-bright-red), var(--mic-red-dark))',
                    color: 'var(--mic-white)',
                    border: '1px solid var(--mic-bright-red)',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, var(--mic-red-dark), var(--mic-bright-red))';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(211, 47, 47, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, var(--mic-bright-red), var(--mic-red-dark))';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm" style={{ color: 'var(--mic-dark-gray)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium hover:underline"
              style={{ color: 'var(--mic-deep-blue)' }}
            >
              Contact your administrator
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="card" style={{ border: '1px solid var(--mic-gray-200)' }}>
          <div className="card-header" style={{ 
            backgroundColor: 'var(--mic-gray-50)',
            borderBottom: '1px solid var(--mic-gray-200)'
          }}>
            <h3 className="text-sm font-medium" style={{ color: 'var(--mic-deep-blue)' }}>
              Demo Credentials
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-1 text-xs" style={{ color: 'var(--mic-dark-gray)' }}>
              <p><strong style={{ color: 'var(--mic-bright-red)' }}>Admin:</strong> admin@mic.edu / admin123</p>
              <p><strong style={{ color: 'var(--mic-deep-blue)' }}>HOD:</strong> hod@mic.edu / hod123</p>
              <p><strong style={{ color: 'var(--mic-logo-green)' }}>Employee:</strong> employee@mic.edu / employee123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 