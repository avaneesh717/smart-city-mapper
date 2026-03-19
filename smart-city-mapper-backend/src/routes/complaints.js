const express = require('express');
const {
  getComplaints,
  getComplaint,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getMyComplaints,
  upvoteComplaint,
  removeUpvote
} = require('../controllers/complaintController');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  validateComplaint,
  validateComplaintUpdate
} = require('../middleware/validation');

const router = express.Router();

// Protected routes (Move my-complaints up to avoid collision with :id)
router.get('/my-complaints', protect, getMyComplaints);
router.post('/', protect, validateComplaint, createComplaint);
router.put('/:id', protect, validateComplaintUpdate, updateComplaint);
router.delete('/:id', protect, deleteComplaint);
router.post('/:id/upvote', protect, upvoteComplaint);
router.delete('/:id/upvote', protect, removeUpvote);

// Public routes
router.get('/', optionalAuth, getComplaints);
router.get('/:id', optionalAuth, getComplaint);

module.exports = router;
