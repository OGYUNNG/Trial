# FrosstBank Backend - PostgreSQL Setup

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** (version 14 or higher)
3. **npm** or **yarn**

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   # Copy this content to backend/.env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=frosstbank
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   PORT=4000
   NODE_ENV=development
   ```

3. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE frosstbank;
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## Default Admin User

The system automatically creates an admin user on first run:
- **Email:** admin@frosstbank.com
- **Password:** admin123
- **Account:** ADMIN001

## API Endpoints

- **Authentication:** `/api/auth`
- **Users:** `/api/users`
- **Transactions:** `/api/transactions`
- **Chat:** `/api/chat`

## Database Schema

- **users:** User accounts and profiles
- **transactions:** Financial transactions
- **messages:** Chat messages

## Features

- ✅ JWT Authentication
- ✅ Role-based Authorization
- ✅ Real-time Chat (Socket.io)
- ✅ User Management
- ✅ Transaction Management
- ✅ PostgreSQL Database
- ✅ Sequelize ORM 