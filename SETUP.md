# 🏙️ Smart City Mapper - Complete Setup Guide

This guide will help you set up both the frontend and backend for the Smart City Mapper application.

## 📋 Prerequisites

Before starting, make sure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd smart-city-mapper-backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# At minimum, update MONGODB_URI if using a different MongoDB setup

# Start MongoDB (if running locally)
# On macOS with Homebrew:
brew services start mongodb-community

# Start the backend server
npm run dev
```

The backend will be available at `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd smart-city-mapper-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### Backend Configuration (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/smartcitymapper

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary Configuration (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

The frontend is already configured to connect to the backend at `http://localhost:5000`. No additional configuration needed.

## 🧪 Testing the Setup

### Test Backend API

```bash
# From the backend directory
node test-api.js
```

This will test all major API endpoints to ensure everything is working.

### Test Frontend

1. Open `http://localhost:5173` in your browser
2. Try registering a new user
3. Login with your credentials
4. Submit a test complaint
5. Check if the complaint appears in the admin dashboard

## 👤 Creating Admin Users

To create an admin user, you can either:

### Option 1: Use the API directly

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Option 2: Modify the database directly

1. Register a regular user through the frontend
2. Use MongoDB Compass or command line to update the user's role:
   ```javascript
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## 📊 Database Schema

### Users Collection
- `name`, `email`, `password`, `role`, `avatar`, `isActive`, `lastLogin`

### Complaints Collection
- `title`, `description`, `category`, `priority`, `status`
- `location` (address, coordinates, city, pincode)
- `images`, `reportedBy`, `assignedTo`, `adminNotes`
- `resolution`, `upvotes`, `isPublic`

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Input Validation** - Express validator
- **CORS Protection** - Configured for frontend
- **Helmet Security** - Security headers
- **Rate Limiting** - (Can be added)

## 🚀 Deployment

### Backend Deployment

1. **Environment Variables**
   - Set production environment variables
   - Use a production MongoDB instance (MongoDB Atlas)
   - Configure Cloudinary for image storage

2. **Process Management**
   ```bash
   # Install PM2
   npm install -g pm2
   
   # Start with PM2
   pm2 start src/server.js --name "smart-city-backend"
   ```

### Frontend Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**
   - Connect your GitHub repository
   - Configure build settings
   - Deploy automatically

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify MongoDB is accessible

2. **CORS Errors**
   - Check FRONTEND_URL in backend .env
   - Ensure frontend URL matches exactly

3. **JWT Token Errors**
   - Check JWT_SECRET in .env file
   - Ensure token is being sent in Authorization header

4. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing processes using the port

### Logs

- **Backend logs**: Check console output
- **Frontend logs**: Check browser console
- **MongoDB logs**: Check MongoDB log files

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Complaint Endpoints
- `GET /api/complaints` - Get all complaints
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard stats
- `PUT /api/admin/complaints/:id/status` - Update status
- `GET /api/admin/users` - Get all users

## 🤝 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Ensure all prerequisites are installed
4. Verify configuration files are correct

## 🎉 You're Ready!

Once both frontend and backend are running:

1. **Frontend**: `http://localhost:5173`
2. **Backend API**: `http://localhost:5000`
3. **Health Check**: `http://localhost:5000/api/health`

Start reporting city issues and managing them through the admin dashboard! 🏙️✨
