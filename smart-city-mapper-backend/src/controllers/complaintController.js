const Complaint = require('../models/Complaint');
const { validationResult } = require('express-validator');

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Public
const getComplaints = async (req, res, next) => {
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

    // Build filter object - Admins see everything, public sees limited
    const filter = (req.user && req.user.role === 'admin') ? {} : { isPublic: true };
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

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Public
const getComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('adminNotes.addedBy', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const complaintData = {
      ...req.body,
      reportedBy: req.user.id
    };

    const complaint = await Complaint.create(complaintData);

    // Populate the created complaint
    await complaint.populate('reportedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint
// @route   PUT /api/complaints/:id
// @access  Private
const updateComplaint = async (req, res, next) => {
  try {
    let complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user is the reporter or admin
    if (complaint.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this complaint'
      });
    }

    // Only allow certain fields to be updated by regular users
    if (req.user.role !== 'admin') {
      const allowedFields = ['title', 'description', 'category', 'priority'];
      const updateData = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      req.body = updateData;
    }

    complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email');

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user is the reporter or admin
    if (complaint.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this complaint'
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's complaints
// @route   GET /api/complaints/my-complaints
// @access  Private
const getMyComplaints = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sort = '-createdAt'
    } = req.query;

    const filter = { reportedBy: req.user.id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(filter)
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

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

// @desc    Upvote complaint
// @route   POST /api/complaints/:id/upvote
// @access  Private
const upvoteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user already upvoted
    if (complaint.upvotes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already upvoted this complaint'
      });
    }

    complaint.upvotes.push(req.user.id);
    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint upvoted successfully',
      data: {
        upvoteCount: complaint.upvotes.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove upvote from complaint
// @route   DELETE /api/complaints/:id/upvote
// @access  Private
const removeUpvote = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    // Check if user has upvoted
    if (!complaint.upvotes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have not upvoted this complaint'
      });
    }

    complaint.upvotes.pull(req.user.id);
    await complaint.save();

    res.json({
      success: true,
      message: 'Upvote removed successfully',
      data: {
        upvoteCount: complaint.upvotes.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getMyComplaints,
  upvoteComplaint,
  removeUpvote
};
