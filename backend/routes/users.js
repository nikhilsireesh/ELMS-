const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize, authorizeDepartment } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (with role-based filtering)
// @route   GET /api/users
// @access  Private (Admin, HOD)
router.get('/', [
  protect,
  authorize('admin', 'hod')
], async (req, res) => {
  try {
    const { role, department, page = 1, limit = 10, search } = req.query;
    
    // Build query
    const query = { isActive: true };
    
    if (role) {
      query.role = role;
    }
    
    // HOD can only see users from their department
    if (req.user.role === 'hod') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get departments list
// @route   GET /api/users/departments
// @access  Private
router.get('/departments', protect, async (req, res) => {
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

    res.json({
      success: true,
      data: {
        departments
      }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get stats overview
// @route   GET /api/users/stats/overview
// @access  Private (Admin, HOD)
router.get('/stats/overview', [
  protect,
  authorize('admin', 'hod')
], async (req, res) => {
  try {
    const query = {};
    
    // If HOD, filter by department
    if (req.user.role === 'hod') {
      query.department = req.user.department;
    }

    const totalUsers = await User.countDocuments(query);
    const activeUsers = await User.countDocuments({ ...query, isActive: true });
    const inactiveUsers = await User.countDocuments({ ...query, isActive: false });
    
    const departmentBreakdown = await User.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } }
        }
      }
    ]);

    const roleBreakdown = await User.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          departmentBreakdown,
          roleBreakdown
        }
      }
    });
  } catch (error) {
    console.error('Get stats overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Calculate and update earned leave
// @route   POST /api/users/calculate-earned-leave
// @access  Private
router.post('/calculate-earned-leave', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate earned leave
    const earnedLeaveData = await user.calculateEarnedLeave();
    
    // Update the user's EL balance
    user.leaveBalance.el = earnedLeaveData.earnedLeave;
    await user.save();

    res.json({
      success: true,
      message: 'Earned leave calculated and updated successfully',
      data: {
        earnedLeaveCalculation: earnedLeaveData,
        updatedBalance: user.leaveBalance
      }
    });
  } catch (error) {
    console.error('Calculate earned leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get earned leave calculation details
// @route   GET /api/users/earned-leave-details
// @access  Private
router.get('/earned-leave-details', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get earned leave calculation details
    const earnedLeaveData = await user.calculateEarnedLeave();

    res.json({
      success: true,
      data: {
        dateOfJoining: user.dateOfJoining,
        ...earnedLeaveData,
        currentELBalance: user.leaveBalance.el
      }
    });
  } catch (error) {
    console.error('Get earned leave details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get current leave balances with correct CL/SCL quotas
// @route   GET /api/users/current-leave-balances
// @access  Private
router.get('/current-leave-balances', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get current leave balances with correct half-year quotas
    const currentBalances = user.getCurrentLeaveBalances();

    res.json({
      success: true,
      data: currentBalances
    });
  } catch (error) {
    console.error('Get current leave balances error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Validate if the id is a valid ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can access this profile
    if (req.user.role === 'employee' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this profile'
      });
    }

    if (req.user.role === 'hod' && user.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this profile'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', [
  protect,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('address').optional().trim().isLength({ min: 10, max: 200 }).withMessage('Address must be between 10 and 200 characters'),
  body('mobileNo').optional().matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit mobile number'),
  body('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  body('department').optional().isIn(['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Management', 'Human Resources']).withMessage('Invalid department'),
  body('role').optional().isIn(['admin', 'hod', 'employee']).withMessage('Invalid role')
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

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can update this profile
    if (req.user.role === 'employee' && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    // HOD can only update users from their department and cannot change role/department
    if (req.user.role === 'hod') {
      if (user.department !== req.user.department) {
        return res.status(403).json({
          success: false,
          message: 'You can only update users from your department'
        });
      }
      
      // Remove role and department from update if HOD is trying to change them
      delete req.body.role;
      delete req.body.department;
    }

    // Only admin can change role and department
    if (req.user.role !== 'admin') {
      delete req.body.role;
      delete req.body.department;
    }

    // Remove password from update if it's empty or not provided
    if (!req.body.password || req.body.password.trim() === '') {
      delete req.body.password;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { 
        user: {
          id: updatedUser._id,
          employeeId: updatedUser.employeeId,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          department: updatedUser.department,
          address: updatedUser.address,
          mobileNo: updatedUser.mobileNo,
          bloodGroup: updatedUser.bloodGroup,
          dateOfBirth: updatedUser.dateOfBirth,
          dateOfJoining: updatedUser.dateOfJoining,
          profilePicture: updatedUser.profilePicture,
          leaveBalance: updatedUser.leaveBalance,
          isActive: updatedUser.isActive,
          lastLogin: updatedUser.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during update'
    });
  }
});

// @desc    Deactivate user
// @route   PUT /api/users/:id/deactivate
// @access  Private (Admin, HOD)
router.put('/:id/deactivate', [
  protect,
  authorize('admin', 'hod')
], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // HOD can only deactivate users from their department
    if (req.user.role === 'hod' && user.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'You can only deactivate users from your department'
      });
    }

    // Prevent self-deactivation
    if (req.user.id === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during deactivation'
    });
  }
});

// @desc    Reactivate user
// @route   PUT /api/users/:id/reactivate
// @access  Private (Admin, HOD)
router.put('/:id/reactivate', [
  protect,
  authorize('admin', 'hod')
], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // HOD can only reactivate users from their department
    if (req.user.role === 'hod' && user.department !== req.user.department) {
      return res.status(403).json({
        success: false,
        message: 'You can only reactivate users from your department'
      });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: 'User reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during reactivation'
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', [
  protect,
  authorize('admin')
], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get CL quota info for a specific user
// @route   GET /api/users/:id/cl-quota
// @access  Private
router.get('/:id/cl-quota', protect, async (req, res) => {
  try {
    // Validate if the id is a valid ObjectId
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get current leave balances with correct half-year quotas
    const currentBalances = user.getCurrentLeaveBalances();

    res.json({
      success: true,
      data: {
        clQuota: currentBalances.clInfo,
        sclQuota: currentBalances.sclInfo,
        currentBalances: {
          cl: currentBalances.cl,
          scl: currentBalances.scl,
          el: currentBalances.el,
          hpl: currentBalances.hpl,
          ccl: currentBalances.ccl
        }
      }
    });
  } catch (error) {
    console.error('Get CL quota error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;