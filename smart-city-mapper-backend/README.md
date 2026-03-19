# Smart City Mapper Backend API

A comprehensive backend API for the Smart City Mapper application - a citizen complaint management system.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Password encryption with bcrypt

- **Complaint Management**
  - Create, read, update, delete complaints
  - Image upload support
  - Location-based complaints with coordinates
  - Status tracking and priority management
  - Upvoting system

- **Admin Dashboard**
  - Comprehensive statistics
  - Complaint management tools
  - User management
  - Assignment system

- **Security Features**
  - Input validation
  - Rate limiting
  - CORS protection
  - Helmet security headers

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Express Validator** - Input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for image uploads)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-city-mapper-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/smartcitymapper
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/logout` - Logout user

### Complaints
- `GET /api/complaints` - Get all complaints (public)
- `GET /api/complaints/:id` - Get single complaint
- `POST /api/complaints` - Create complaint (protected)
- `PUT /api/complaints/:id` - Update complaint (protected)
- `DELETE /api/complaints/:id` - Delete complaint (protected)
- `GET /api/complaints/my-complaints` - Get user's complaints
- `POST /api/complaints/:id/upvote` - Upvote complaint
- `DELETE /api/complaints/:id/upvote` - Remove upvote

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/complaints` - Get all complaints for admin
- `PUT /api/admin/complaints/:id/status` - Update complaint status
- `PUT /api/admin/complaints/:id/assign` - Assign complaint
- `POST /api/admin/complaints/:id/notes` - Add admin note
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status

## 🔒 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Schema

### User Model
- name, email, password, role, avatar, isActive, lastLogin

### Complaint Model
- title, description, category, priority, status
- location (address, coordinates, city, pincode)
- images, reportedBy, assignedTo, adminNotes
- resolution, upvotes, isPublic

## 🚀 Deployment

1. **Environment Variables**
   - Set production environment variables
   - Use a production MongoDB instance
   - Configure Cloudinary for image storage

2. **Build & Start**
   ```bash
   npm start
   ```

3. **Process Management**
   - Use PM2 for process management
   - Configure reverse proxy (Nginx)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📝 API Documentation

For detailed API documentation, visit:
- Swagger UI: `http://localhost:5000/api-docs` (when implemented)
- Postman Collection: Available in `/docs` folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@smartcitymapper.com or create an issue in the repository.
