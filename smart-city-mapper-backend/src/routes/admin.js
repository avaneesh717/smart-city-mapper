const express = require('express');
const {
  getDashboardStats,
  getAdminComplaints,
  updateComplaintStatus,
  assignComplaint,
  addAdminNote,
  getUsers,
  updateUserStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateStatusUpdate,
  validateAssignment,
  validateAdminNote,
  validateUserStatus
} = require('../middleware/validation');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Complaints management
router.get('/complaints', getAdminComplaints);
router.put('/complaints/:id/status', validateStatusUpdate, updateComplaintStatus);
router.put('/complaints/:id/assign', validateAssignment, assignComplaint);
router.post('/complaints/:id/notes', validateAdminNote, addAdminNote);

// User management
router.get('/users', getUsers);
router.put('/users/:id/status', validateUserStatus, updateUserStatus);

module.exports = router;
