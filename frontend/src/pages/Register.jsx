import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Building2, User, Mail, Lock, Phone, MapPin, Calendar, Droplets } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password');

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Management',
    'Human Resources'
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser(data);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join MIC ELMS - Employee Leave Management System
          </p>
        </div>

        {/* Registration Form */}
        <div className="card">
          <div className="card-content">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="label">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      className="input pl-10"
                      placeholder="Enter your full name"
                      {...register('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      })}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

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
                      className="input pl-10"
                      placeholder="Enter your email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Department Field */}
                <div>
                  <label htmlFor="department" className="label">
                    Department
                  </label>
                  <select
                    id="department"
                    className="input"
                    {...register('department', {
                      required: 'Department is required',
                    })}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.department.message}
                    </p>
                  )}
                </div>

                {/* Role Field */}
                <div>
                  <label htmlFor="role" className="label">
                    Role
                  </label>
                  <select
                    id="role"
                    className="input"
                    {...register('role', {
                      required: 'Role is required',
                    })}
                  >
                    <option value="">Select Role</option>
                    <option value="employee">Employee</option>
                    <option value="hod">HOD</option>
                    <option value="admin">Admin</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                {/* Mobile Number Field */}
                <div>
                  <label htmlFor="mobileNo" className="label">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="mobileNo"
                      type="tel"
                      className="input pl-10"
                      placeholder="Enter mobile number"
                      {...register('mobileNo', {
                        required: 'Mobile number is required',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Please enter a valid 10-digit mobile number',
                        },
                      })}
                    />
                  </div>
                  {errors.mobileNo && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.mobileNo.message}
                    </p>
                  )}
                </div>

                {/* Blood Group Field */}
                <div>
                  <label htmlFor="bloodGroup" className="label">
                    Blood Group
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Droplets className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="bloodGroup"
                      className="input pl-10"
                      {...register('bloodGroup', {
                        required: 'Blood group is required',
                      })}
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.bloodGroup && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.bloodGroup.message}
                    </p>
                  )}
                </div>

                {/* Date of Birth Field */}
                <div>
                  <label htmlFor="dateOfBirth" className="label">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="dateOfBirth"
                      type="date"
                      className="input pl-10"
                      {...register('dateOfBirth', {
                        required: 'Date of birth is required',
                      })}
                    />
                  </div>
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                {/* Date of Joining Field */}
                <div>
                  <label htmlFor="dateOfJoining" className="label">
                    Date of Joining
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="dateOfJoining"
                      type="date"
                      className="input pl-10"
                      {...register('dateOfJoining', {
                        required: 'Date of joining is required',
                      })}
                    />
                  </div>
                  {errors.dateOfJoining && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.dateOfJoining.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Address Field */}
              <div>
                <label htmlFor="address" className="label">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="address"
                    rows={3}
                    className="input pl-10 resize-none"
                    placeholder="Enter your address"
                    {...register('address', {
                      required: 'Address is required',
                      minLength: {
                        value: 10,
                        message: 'Address must be at least 10 characters',
                      },
                    })}
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-danger-600">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="input pl-10 pr-10"
                      placeholder="Enter password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
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

                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="input pl-10"
                      placeholder="Confirm password"
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match',
                      })}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-danger-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 