const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'hod', 'employee'],
    default: 'employee'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Management', 'Human Resources']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  mobileNo: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  dateOfJoining: {
    type: Date,
    required: [true, 'Date of joining is required'],
    default: Date.now
  },
  profilePicture: {
    type: String,
    default: ''
  },
  leaveBalance: {
    cl: { type: Number, default: 12 },
    scl: { type: Number, default: 8 },
    el: { type: Number, default: 0 },
    hpl: { type: Number, default: 10 },
    ccl: { type: Number, default: 7 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate employee ID before saving
userSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  // Skip if employeeId is already set (e.g., during seeding)
  if (this.employeeId) return next();
  
  try {
    // Use a more reliable method to get the next ID
    const lastUser = await this.constructor.findOne({}, {}, { sort: { 'employeeId': -1 } });
    let nextNumber = 1;
    
    if (lastUser && lastUser.employeeId) {
      const lastNumber = parseInt(lastUser.employeeId.slice(-4));
      nextNumber = lastNumber + 1;
    }
    
    const year = new Date().getFullYear();
    this.employeeId = `MIC${year}${String(nextNumber).padStart(4, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate earned leave based on days worked
userSchema.methods.calculateEarnedLeave = function() {
  const now = new Date();
  const joiningDate = new Date(this.dateOfJoining);
  const daysWorked = Math.floor((now - joiningDate) / (1000 * 60 * 60 * 24));
  return Math.floor(daysWorked / 2);
};

// Update leave balance
userSchema.methods.updateLeaveBalance = function(leaveType, days) {
  if (this.leaveBalance[leaveType] !== undefined) {
    this.leaveBalance[leaveType] -= days;
  }
  return this.save();
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for age
userSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Method to calculate actual working days
userSchema.methods.getWorkingDays = function() {
  const startDate = new Date(this.dateOfJoining);
  const endDate = new Date();
  
  let workingDays = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Count only weekdays (Monday to Friday)
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

// Method to calculate earned leave based on working days minus leaves taken
userSchema.methods.calculateEarnedLeave = async function() {
  try {
    const Leave = require('./Leave');
    
    // Get total working days since joining
    const totalWorkingDays = this.getWorkingDays();
    
    // Get total approved leaves taken by this employee
    const approvedLeaves = await Leave.aggregate([
      {
        $match: {
          employee: this._id,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalLeavesTaken: { $sum: '$numberOfDays' }
        }
      }
    ]);
    
    const totalLeavesTaken = approvedLeaves.length > 0 ? approvedLeaves[0].totalLeavesTaken : 0;
    
    // Calculate actual working days (total working days - leaves taken)
    const actualWorkingDays = Math.max(0, totalWorkingDays - totalLeavesTaken);
    
    // Calculate earned leave: actual working days ÷ 2
    const earnedLeave = Math.floor(actualWorkingDays / 2);
    
    return {
      totalWorkingDays,
      totalLeavesTaken,
      actualWorkingDays,
      earnedLeave
    };
  } catch (error) {
    console.error('Error calculating earned leave:', error);
    return {
      totalWorkingDays: 0,
      totalLeavesTaken: 0,
      actualWorkingDays: 0,
      earnedLeave: 0
    };
  }
};

// Method to calculate CL quota based on current half-year period
userSchema.methods.getCLQuota = function() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
  
  // Jan-Jun (1-6) = First half-year: 6 CL days
  // Jul-Dec (7-12) = Second half-year: 6 CL days
  if (currentMonth >= 1 && currentMonth <= 6) {
    return {
      period: 'Jan-Jun',
      quota: 6,
      description: 'First half-year quota (Jan-Jun): 6 days'
    };
  } else {
    return {
      period: 'Jul-Dec',
      quota: 6,
      description: 'Second half-year quota (Jul-Dec): 6 days'
    };
  }
};

// Method to calculate SCL quota based on current half-year period
userSchema.methods.getSCLQuota = function() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
  
  // Jan-Jun (1-6) = First half-year: 4 SCL days
  // Jul-Dec (7-12) = Second half-year: 4 SCL days
  if (currentMonth >= 1 && currentMonth <= 6) {
    return {
      period: 'Jan-Jun',
      quota: 4,
      description: 'First half-year quota (Jan-Jun): 4 days'
    };
  } else {
    return {
      period: 'Jul-Dec',
      quota: 4,
      description: 'Second half-year quota (Jul-Dec): 4 days'
    };
  }
};

// Method to get current leave balances with correct CL/SCL quotas
userSchema.methods.getCurrentLeaveBalances = function() {
  const clQuota = this.getCLQuota();
  const sclQuota = this.getSCLQuota();
  
  return {
    cl: clQuota.quota,
    scl: sclQuota.quota,
    el: this.leaveBalance.el,
    hpl: this.leaveBalance.hpl,
    ccl: this.leaveBalance.ccl,
    clInfo: clQuota,
    sclInfo: sclQuota
  };
};

// JSON serialization
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);