const express = require('express');
const User = require('../models/User');
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'admin') {
      // Admin dashboard stats
      const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });
      const totalHODs = await User.countDocuments({ role: 'hod', isActive: true });
      const totalAdmins = await User.countDocuments({ role: 'admin', isActive: true });
      
      const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
      const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
      const rejectedLeaves = await Leave.countDocuments({ status: 'rejected' });

      // Department-wise leave distribution
      const departmentLeaves = await Leave.aggregate([
        { $match: { status: 'pending' } },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Recent leave applications
      const recentLeaves = await Leave.find({ status: 'pending' })
        .populate('employee', 'name employeeId department')
        .sort({ appliedAt: -1 })
        .limit(5);

      stats = {
        totalEmployees,
        totalHODs,
        totalAdmins,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        departmentLeaves,
        recentLeaves
      };

    } else if (req.user.role === 'hod') {
      // HOD dashboard stats - exclude HOD's own applications
      const departmentEmployees = await User.countDocuments({ 
        department: req.user.department, 
        role: 'employee', 
        isActive: true 
      });

      // Get department employee IDs (exclude HODs)
      const departmentEmployeeIds = await User.find({
        department: req.user.department,
        role: 'employee',
        isActive: true
      }).distinct('_id');

      const pendingLeaves = await Leave.countDocuments({ 
        status: 'pending', 
        employee: { $in: departmentEmployeeIds }
      });
      
      const approvedLeaves = await Leave.countDocuments({ 
        status: 'approved', 
        employee: { $in: departmentEmployeeIds }
      });

      // Approved leaves this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const approvedThisMonth = await Leave.countDocuments({
        status: 'approved',
        employee: { $in: departmentEmployeeIds },
        updatedAt: { $gte: startOfMonth }
      });

      // Total leave days for approved leaves in department (employee only)
      const totalLeaveDaysResult = await Leave.aggregate([
        { 
          $match: { 
            status: 'approved', 
            employee: { $in: departmentEmployeeIds }
          } 
        },
        {
          $group: {
            _id: null,
            totalDays: { $sum: '$numberOfDays' }
          }
        }
      ]);
      
      const totalLeaveDays = totalLeaveDaysResult.length > 0 ? totalLeaveDaysResult[0].totalDays : 0;

      // HOD's own leave balance
      const user = await User.findById(req.user.id);
      const leaveBalance = user.leaveBalance;

      // Recent leave applications from department (employee only)
      const recentLeaves = await Leave.find({ 
        status: 'pending', 
        employee: { $in: departmentEmployeeIds }
      })
        .populate('employee', 'name employeeId')
        .sort({ appliedAt: -1 })
        .limit(5);

      stats = {
        departmentEmployees,
        pendingLeaves,
        approvedLeaves,
        approvedThisMonth,
        totalLeaveDays,
        leaveBalance,
        recentLeaves
      };

    } else {
      // Employee dashboard stats
      const user = await User.findById(req.user.id);
      const leaveBalance = user.leaveBalance;

      const myPendingLeaves = await Leave.countDocuments({ 
        employee: req.user.id, 
        status: 'pending' 
      });
      
      const myApprovedLeaves = await Leave.countDocuments({ 
        employee: req.user.id, 
        status: 'approved' 
      });
      
      const myRejectedLeaves = await Leave.countDocuments({ 
        employee: req.user.id, 
        status: 'rejected' 
      });

      const totalApplications = myPendingLeaves + myApprovedLeaves + myRejectedLeaves;

      // Calculate total days taken from approved leaves
      const totalDaysTakenResult = await Leave.aggregate([
        { 
          $match: { 
            employee: req.user.id, 
            status: 'approved'
          } 
        },
        {
          $group: {
            _id: null,
            totalDays: { $sum: '$numberOfDays' }
          }
        }
      ]);
      
      const totalDaysTaken = totalDaysTakenResult.length > 0 ? totalDaysTakenResult[0].totalDays : 0;

      // Recent leave applications
      const recentLeaves = await Leave.find({ employee: req.user.id })
        .populate('approvedBy', 'name employeeId')
        .sort({ appliedAt: -1 })
        .limit(5);

      stats = {
        leaveBalance,
        totalApplications,
        pendingApplications: myPendingLeaves,
        approvedApplications: myApprovedLeaves,
        rejectedApplications: myRejectedLeaves,
        totalDaysTaken,
        recentLeaves
      };
    }

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get leave analytics
// @route   GET /api/dashboard/analytics
// @access  Private (Admin, HOD)
router.get('/analytics', [
  protect,
  authorize('admin', 'hod')
], async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Build date filter
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Build query
    const query = { appliedAt: { $gte: startDate } };
    
    // HOD can only see their department's analytics
    if (req.user.role === 'hod') {
      query.department = req.user.department;
    }

    // Leave type distribution
    const leaveTypeStats = await Leave.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly trend
    const monthlyTrend = await Leave.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$appliedAt' },
            month: { $month: '$appliedAt' }
          },
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Department-wise distribution (for admin only)
    let departmentStats = [];
    if (req.user.role === 'admin') {
      departmentStats = await Leave.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
            }
          }
        },
        { $sort: { count: -1 } }
      ]);
    }

    res.json({
      success: true,
      data: {
        leaveTypeStats,
        monthlyTrend,
        departmentStats,
        period,
        startDate,
        endDate: now
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get quick actions data
// @route   GET /api/dashboard/quick-actions
// @access  Private
router.get('/quick-actions', protect, async (req, res) => {
  try {
    let quickActions = {};

    if (req.user.role === 'admin') {
      // Admin quick actions
      const pendingLeavesCount = await Leave.countDocuments({ status: 'pending' });
      const totalEmployees = await User.countDocuments({ role: 'employee', isActive: true });
      
      quickActions = {
        pendingLeavesCount,
        totalEmployees,
        canAddEmployee: true,
        canViewAllDepartments: true
      };

    } else if (req.user.role === 'hod') {
      // HOD quick actions
      const pendingLeavesCount = await Leave.countDocuments({ 
        status: 'pending', 
        department: req.user.department 
      });
      const departmentEmployees = await User.countDocuments({ 
        department: req.user.department, 
        role: 'employee', 
        isActive: true 
      });
      
      quickActions = {
        pendingLeavesCount,
        departmentEmployees,
        canAddEmployee: true,
        canViewDepartment: true
      };

    } else {
      // Employee quick actions
      const user = await User.findById(req.user.id);
      const canApplyLeave = Object.values(user.leaveBalance).some(balance => balance > 0);
      const pendingLeavesCount = await Leave.countDocuments({ 
        employee: req.user.id, 
        status: 'pending' 
      });
      
      quickActions = {
        canApplyLeave,
        pendingLeavesCount,
        leaveBalance: user.leaveBalance
      };
    }

    res.json({
      success: true,
      data: { quickActions }
    });
  } catch (error) {
    console.error('Get quick actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 