const { body } = require('express-validator');

// User validation rules
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Complaint validation rules
const validateComplaint = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Description must be between 5 and 1000 characters'),
  
  body('category')
    .isIn([
      'Road Issues',
      'Water Problems',
      'Electricity Issues',
      'Waste Management',
      'Public Safety',
      'Parks & Recreation',
      'Traffic Issues',
      'Noise Complaints',
      'Other'
    ])
    .withMessage('Please select a valid category'),
  
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be Low, Medium, High, or Critical'),
  
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Address must be between 3 and 200 characters'),
  
  body('location.coordinates.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('location.coordinates.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  
  body('location.pincode')
    .trim()
    .notEmpty()
    .withMessage('Pincode is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Pincode must be 6 digits')
    .isNumeric()
    .withMessage('Pincode must contain only numbers')
];

const validateComplaintUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('category')
    .optional()
    .isIn([
      'Road Issues',
      'Water Problems',
      'Electricity Issues',
      'Waste Management',
      'Public Safety',
      'Parks & Recreation',
      'Traffic Issues',
      'Noise Complaints',
      'Other'
    ])
    .withMessage('Please select a valid category'),
  
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Priority must be Low, Medium, High, or Critical'),
  
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Resolved', 'Rejected'])
    .withMessage('Status must be Pending, In Progress, Resolved, or Rejected')
];

const validateStatusUpdate = [
  body('status')
    .isIn(['Pending', 'In Progress', 'Resolved', 'Rejected'])
    .withMessage('Status must be Pending, In Progress, Resolved, or Rejected'),
  
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Admin notes must be between 5 and 500 characters')
];

const validateAssignment = [
  body('assignedTo')
    .isMongoId()
    .withMessage('Please provide a valid user ID')
];

const validateAdminNote = [
  body('note')
    .trim()
    .notEmpty()
    .withMessage('Note is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Note must be between 5 and 500 characters')
];

const validateUserStatus = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateComplaint,
  validateComplaintUpdate,
  validateStatusUpdate,
  validateAssignment,
  validateAdminNote,
  validateUserStatus
};
