const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveType: {
    type: String,
    required: [true, 'Leave type is required'],
    enum: ['cl', 'scl', 'el', 'hpl', 'ccl']
  },
  fromDate: {
    type: Date,
    required: [true, 'From date is required']
  },
  toDate: {
    type: Date,
    required: [true, 'To date is required']
  },
  numberOfDays: {
    type: Number,
    min: [1, 'Minimum 1 day required']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: [200, 'Rejection reason cannot exceed 200 characters']
  },
  department: {
    type: String,
    required: true
  },
  employeeName: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayType: {
    type: String,
    enum: ['first-half', 'second-half'],
    required: function() {
      return this.isHalfDay;
    }
  }
}, {
  timestamps: true
});

// Calculate number of days excluding weekends
leaveSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('fromDate') || this.isModified('toDate')) {
    try {
      this.numberOfDays = this.calculateWorkingDays();
    } catch (error) {
      console.error('Error calculating working days:', error);
      return next(error);
    }
  }
  next();
});

// Calculate working days between two dates
leaveSchema.methods.calculateWorkingDays = function() {
  const start = new Date(this.fromDate);
  const end = new Date(this.toDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date values for fromDate or toDate');
  }
  
  let workingDays = 0;
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
      workingDays++;
    }
  }
  
  return workingDays;
};

// Validate date range
leaveSchema.methods.validateDateRange = function() {
  const fromDate = new Date(this.fromDate);
  const toDate = new Date(this.toDate);
  const today = new Date();
  
  // Reset time to start of day for comparison
  today.setHours(0, 0, 0, 0);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);
  
  if (fromDate < today) {
    throw new Error('From date cannot be in the past');
  }
  
  if (toDate < fromDate) {
    throw new Error('To date cannot be before from date');
  }
  
  return true;
};

// Check if leave overlaps with existing approved leaves
leaveSchema.methods.checkOverlap = async function() {
  const overlappingLeave = await this.constructor.findOne({
    employee: this.employee,
    status: { $in: ['pending', 'approved'] },
    $or: [
      {
        fromDate: { $lte: this.toDate },
        toDate: { $gte: this.fromDate }
      }
    ],
    _id: { $ne: this._id }
  });
  
  if (overlappingLeave) {
    throw new Error('Leave application overlaps with existing approved or pending leave');
  }
  
  return false;
};

// Virtual for leave status color
leaveSchema.virtual('statusColor').get(function() {
  switch (this.status) {
    case 'pending': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'danger';
    default: return 'secondary';
  }
});

// Virtual for formatted dates
leaveSchema.virtual('formattedFromDate').get(function() {
  return this.fromDate.toLocaleDateString('en-IN');
});

leaveSchema.virtual('formattedToDate').get(function() {
  return this.toDate.toLocaleDateString('en-IN');
});

// Index for better query performance
leaveSchema.index({ employee: 1, status: 1 });
leaveSchema.index({ department: 1, status: 1 });
leaveSchema.index({ fromDate: 1, toDate: 1 });

module.exports = mongoose.model('Leave', leaveSchema); 