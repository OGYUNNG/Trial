# FrosstBank - Online Banking System

A modern online banking application with user management, transactions, and live chat functionality.

## Features

- ✅ **User Authentication** - Secure login system with JWT tokens
- ✅ **Admin Dashboard** - Complete user and transaction management
- ✅ **Live Chat** - Real-time communication between users and admin
- ✅ **Responsive Design** - Works on all devices (desktop, tablet, mobile)
- ✅ **Transaction Management** - Create, edit, and track financial transactions
- ✅ **User Management** - Admin can create, edit, and delete users

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express.js, Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io for live chat
- **Database**: In-memory storage (development) / PostgreSQL (production ready)

## Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cursor-of-jswork
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies (if any)
   cd ..
   npm install
   ```

3. **Start the servers**
   ```bash
   # Terminal 1 - Backend (Port 4000)
   cd backend
   npm start
   
   # Terminal 2 - Frontend (Port 3000)
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - Admin Login: admin@frosstbank.com / admin123

## Deployment on Render

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy both services

### Option 2: Manual Deployment

#### Backend Service
1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `10000`
     - `JWT_SECRET`: (generate a secure secret)
     - `CORS_ORIGIN`: `https://your-frontend-url.onrender.com`

#### Frontend Service
1. Create a new **Static Site** on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `echo "Static files already built"`
   - **Publish Directory**: `frontend`
   - **Environment Variables**:
     - `BACKEND_URL`: `https://your-backend-url.onrender.com`

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

### Frontend
Update the API URLs in your frontend files to point to your deployed backend URL.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Health Check
- `GET /health` - Server health status

## Mobile Responsiveness

The application is fully responsive and works on:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (320px - 767px)
- ✅ Small Mobile (320px - 480px)

## Default Admin Credentials

- **Email**: admin@frosstbank.com
- **Password**: admin123

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- Secure headers

## Future Enhancements

- [ ] PostgreSQL database integration
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Advanced transaction analytics
- [ ] Mobile app development

## Support

For issues or questions, please check the documentation or create an issue in the repository.

## License

This project is licensed under the ISC License. "# Trial" 
