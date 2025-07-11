const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect, authorize, authorizeDepartment } = require('../middleware/auth');

const router = express.Router();

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee, HOD)
router.post('/', [
  protect,
  authorize('employee', 'hod'),
  body('leaveType').isIn(['cl', 'scl', 'el', 'hpl', 'ccl']).withMessage('Invalid leave type'),
  body('fromDate').isISO8601().withMessage('Please provide a valid from date'),
  body('toDate').isISO8601().withMessage('Please provide a valid to date'),
  body('reason').trim().isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
  body('isHalfDay').optional().isBoolean().withMessage('isHalfDay must be a boolean'),
  body('halfDayType').optional().isIn(['first-half', 'second-half']).withMessage('Invalid half day type')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { leaveType, fromDate, toDate, reason, isHalfDay, halfDayType } = req.body;

    // Create leave object
    const leaveData = {
      employee: req.user.id,
      leaveType,
      fromDate,
      toDate,
      reason,
      department: req.user.department,
      employeeName: req.user.name,
      employeeId: req.user.employeeId,
      isHalfDay: isHalfDay || false,
      halfDayType: isHalfDay ? halfDayType : undefined
    };

    const leave = new Leave(leaveData);

    // Validate date range
    try {
      leave.validateDateRange();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Check for overlapping leaves
    try {
      await leave.checkOverlap();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Check leave balance
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get current leave balances with correct quotas for CL and SCL
    const currentBalances = user.getCurrentLeaveBalances();
    const availableBalance = currentBalances[leaveType];
    
    // For EL, allow negative balance (employees can take more than currently earned)
    if (leaveType !== 'el' && availableBalance < leave.numberOfDays) {
      const quotaInfo = leaveType === 'cl' ? currentBalances.clInfo : 
                       leaveType === 'scl' ? currentBalances.sclInfo : null;
      const quotaText = quotaInfo ? ` (${quotaInfo.period})` : '';
      
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType.toUpperCase()} balance${quotaText}. Available: ${availableBalance} days, Required: ${leave.numberOfDays} days`
      });
    }

    // Save leave application
    await leave.save();

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: {
        leave: {
          id: leave._id,
          leaveType: leave.leaveType,
          fromDate: leave.fromDate,
          toDate: leave.toDate,
          numberOfDays: leave.numberOfDays,
          reason: leave.reason,
          status: leave.status,
          appliedAt: leave.appliedAt
        }
      }
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during leave application'
    });
  }
});

// @desc    Get all leave applications (for admin/HOD)
// @route   GET /api/leaves
// @access  Private (Admin, HOD)
router.get('/', [
  protect,
  authorize('admin', 'hod')
], async (req, res) => {
  try {
    const { status, department, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    // HOD can only see their department's employee leaves (not other HODs or their own)
    if (req.user.role === 'hod') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    const skip = (page - 1) * limit;
    
    let leaves;
    
    if (req.user.role === 'hod') {
      // For HODs, use aggregation to filter out HOD applications
      leaves = await Leave.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'employee',
            foreignField: '_id',
            as: 'employee'
          }
        },
        { $unwind: '$employee' },
        { $match: { 'employee.role': { $ne: 'hod' } } }, // Exclude HOD applications
        { $sort: { appliedAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'approvedBy',
            foreignField: '_id',
            as: 'approvedBy'
          }
        },
        {
          $addFields: {
            'employee': {
              _id: '$employee._id',
              name: '$employee.name',
              email: '$employee.email',
              employeeId: '$employee.employeeId',
              role: '$employee.role'
            },
            'approvedBy': {
              $cond: {
                if: { $gt: [{ $size: '$approvedBy' }, 0] },
                then: {
                  _id: { $arrayElemAt: ['$approvedBy._id', 0] },
                  name: { $arrayElemAt: ['$approvedBy.name', 0] },
                  employeeId: { $arrayElemAt: ['$approvedBy.employeeId', 0] }
                },
                else: null
              }
            }
          }
        }
      ]);
    } else {
      // For Admin, show all applications
      leaves = await Leave.find(query)
        .populate('employee', 'name email employeeId role')
        .populate('approvedBy', 'name employeeId')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    let total;
    if (req.user.role === 'hod') {
      // Count only employee applications for HODs
      total = await Leave.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'employee',
            foreignField: '_id',
            as: 'employee'
          }
        },
        { $unwind: '$employee' },
        { $match: { 'employee.role': { $ne: 'hod' } } },
        { $count: 'total' }
      ]);
      total = total.length > 0 ? total[0].total : 0;
    } else {
      total = await Leave.countDocuments(query);
    }

    res.json({
      success: true,
      data: {
        leaves,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's leave history
// @route   GET /api/leaves/my-leaves
// @access  Private (Employee, HOD)
router.get('/my-leaves', [
  protect,
  authorize('employee', 'hod')
], async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { employee: req.user.id };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const leaves = await Leave.find(query)
      .populate('approvedBy', 'name employeeId')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Leave.countDocuments(query);

    res.json({
      success: true,
      data: {
        leaves,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single leave application
// @route   GET /api/leaves/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leave application ID format'
      });
    }

    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'name email employeeId department')
      .populate('approvedBy', 'name employeeId');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }

    // Check if user can access this leave
    if (req.user.role === 'employee' && leave.employee.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this leave application'
      });
    }

    if (req.user.role === 'hod' && leave.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this leave application'
      });
    }

    res.json({
      success: true,
      data: { leave }
    });
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Approve/Reject leave application
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin, HOD)
router.put('/:id/status', [
  protect,
  authorize('admin', 'hod'),
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
  body('rejectionReason').optional().trim().isLength({ max: 200 }).withMessage('Rejection reason cannot exceed 200 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { status, rejectionReason } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }

    // Check if leave is already processed
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave application has already been processed'
      });
    }

    // HOD can only approve/reject leaves from their department
    if (req.user.role === 'hod' && leave.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'You can only process leaves from your department'
      });
    }

    // Update leave status
    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date();

    if (status === 'rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    // If approved, update user's leave balance
    if (status === 'approved') {
      const user = await User.findById(leave.employee);
      await user.updateLeaveBalance(leave.leaveType, leave.numberOfDays);
    }

    await leave.save();

    res.json({
      success: true,
      message: `Leave application ${status} successfully`,
      data: { leave }
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during status update'
    });
  }
});

// @desc    Cancel leave application
// @route   DELETE /api/leaves/:id
// @access  Private (Employee, HOD - only their own leaves)
router.delete('/:id', protect, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found'
      });
    }

    // Check if user can cancel this leave
    if (req.user.role === 'employee' && leave.employee.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own leave applications'
      });
    }

    if (req.user.role === 'hod' && leave.employee.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own leave applications'
      });
    }

    // Check if leave can be cancelled
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leave applications can be cancelled'
      });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Leave application cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during cancellation'
    });
  }
});

module.exports = router; 