const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentComplaints = await Complaint.find()
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const totalUsers = await User.countDocuments();
    const totalComplaints = await Complaint.countDocuments();

    // Format status stats
    const statusCounts = {
      total: totalComplaints,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      switch (stat._id) {
        case 'Pending':
          statusCounts.pending = stat.count;
          break;
        case 'In Progress':
          statusCounts.inProgress = stat.count;
          break;
        case 'Resolved':
          statusCounts.resolved = stat.count;
          break;
        case 'Rejected':
          statusCounts.rejected = stat.count;
          break;
      }
    });

    res.json({
      success: true,
      data: {
        statusCounts,
        categoryStats,
        priorityStats,
        recentComplaints,
        totalUsers,
        totalComplaints
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints for admin
// @route   GET /api/admin/complaints
// @access  Private/Admin
const getAdminComplaints = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      city,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (city) filter['location.city'] = new RegExp(city, 'i');

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get complaints
    const complaints = await Complaint.find(filter)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Complaint.countDocuments(filter);

    res.json({
      success: true,
      count: complaints.length,
      total,
      data: complaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/admin/complaints/:id/status
// @access  Private/Admin
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Update status
    complaint.status = status;

    // Add admin notes if provided
    if (adminNotes) {
      complaint.adminNotes.push({
        note: adminNotes,
        addedBy: req.user.id
      });
    }

    // Set resolution details if resolved
    if (status === 'Resolved') {
      complaint.resolution = {
        ...complaint.resolution,
        resolvedBy: req.user.id,
        resolvedAt: new Date()
      };
    }

    await complaint.save();

    // Populate the updated complaint
    await complaint.populate('reportedBy', 'name email');
    await complaint.populate('assignedTo', 'name email');
    await complaint.populate('adminNotes.addedBy', 'name email');

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign complaint to admin
// @route   PUT /api/admin/complaints/:id/assign
// @access  Private/Admin
const assignComplaint = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Verify assigned user is admin
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser || assignedUser.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Can only assign to admin users'
      });
    }

    complaint.assignedTo = assignedTo;
    await complaint.save();

    await complaint.populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add admin note to complaint
// @route   POST /api/admin/complaints/:id/notes
// @access  Private/Admin
const addAdminNote = async (req, res, next) => {
  try {
    const { note } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.adminNotes.push({
      note,
      addedBy: req.user.id
    });

    await complaint.save();

    await complaint.populate('adminNotes.addedBy', 'name email');

    res.json({
      success: true,
      message: 'Note added successfully',
      data: complaint.adminNotes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: users.length,
      total,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAdminComplaints,
  updateComplaintStatus,
  assignComplaint,
  addAdminNote,
  getUsers,
  updateUserStatus
};
