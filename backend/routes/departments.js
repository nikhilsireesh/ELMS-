const express = require('express');
const User = require('../models/User');
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all departments with statistics
// @route   GET /api/departments
// @access  Private (Admin, HOD)
router.get('/', [
  protect,
  authorize('admin', 'hod')
], async (req, res) => {
  try {
    const departments = [
      'Computer Science',
      'Information Technology',
      'Electronics',
      'Mechanical',
      'Civil',
      'Management',
      'Human Resources'
    ];

    const departmentStats = [];

    for (const dept of departments) {
      // Skip if HOD is not from this department
      if (req.user.role === 'hod' && req.user.department !== dept) {
        continue;
      }

      const employeeCount = await User.countDocuments({ 
        department: dept, 
        role: 'employee', 
        isActive: true 
      });

      const hodCount = await User.countDocuments({ 
        department: dept, 
        role: 'hod', 
        isActive: true 
      });

      const pendingLeaves = await Leave.countDocuments({ 
        department: dept, 
        status: 'pending' 
      });

      const approvedLeaves = await Leave.countDocuments({ 
        department: dept, 
        status: 'approved' 
      });

      departmentStats.push({
        name: dept,
        employeeCount,
        hodCount,
        pendingLeaves,
        approvedLeaves,
        totalLeaves: pendingLeaves + approvedLeaves
      });
    }

    res.json({
      success: true,
      data: { departments: departmentStats }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get department details
// @route   GET /api/departments/:name
// @access  Private (Admin, HOD)
router.get('/:name', [
  protect,
  authorize('admin', 'hod')
], async (req, res) => {
  try {
    const { name } = req.params;

    // Check if HOD can access this department
    if (req.user.role === 'hod' && req.user.department !== name) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own department'
      });
    }

    const employees = await User.find({ 
      department: name, 
      isActive: true 
    })
      .select('name employeeId email role')
      .sort({ name: 1 });

    const pendingLeaves = await Leave.find({ 
      department: name, 
      status: 'pending' 
    })
      .populate('employee', 'name employeeId')
      .sort({ appliedAt: -1 })
      .limit(10);

    const leaveStats = await Leave.aggregate([
      { $match: { department: name } },
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
      }
    ]);

    res.json({
      success: true,
      data: {
        department: name,
        employees,
        pendingLeaves,
        leaveStats
      }
    });
  } catch (error) {
    console.error('Get department details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 