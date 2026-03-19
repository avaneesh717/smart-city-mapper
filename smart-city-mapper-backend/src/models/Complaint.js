const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Road Issues',
      'Water Problems',
      'Electricity Issues',
      'Waste Management',
      'Public Safety',
      'Parks & Recreation',
      'Traffic Issues',
      'Noise Complaints',
      'Other'
    ]
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide an address'],
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Please provide latitude']
      },
      longitude: {
        type: Number,
        required: [true, 'Please provide longitude']
      }
    },
    city: {
      type: String,
      required: [true, 'Please provide city name'],
      trim: true
    },
    pincode: {
      type: String,
      required: [true, 'Please provide pincode'],
      trim: true
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminNotes: [{
    note: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    description: {
      type: String,
      trim: true
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    },
    images: [{
      url: String,
      publicId: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ reportedBy: 1 });
complaintSchema.index({ createdAt: -1 });

// Virtual for upvote count
complaintSchema.virtual('upvoteCount').get(function() {
  return this.upvotes.length;
});

// Ensure virtual fields are serialized
complaintSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Complaint', complaintSchema);
