# <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTT8EqzjhTM2m8tvUxSKxLeMqG8liK9JV0CKA&s" style="vertical-align: middle; margin-right: 10px;"> MIC-ELMS Setup Guide

## 📋 Project Description
*MIC College of Technology Employee Leave Management System (MIC-ELMS)* - A MERN stack application with role-based authentication for managing employee leave applications.

## User Interface
*Login*
![screencapture-localhost-5173-login-2025-07-06-16_58_36](https://github.com/user-attachments/assets/f1446bc9-a471-4874-bbfc-af828098cbb2)

*Admin: **Profile*
![screencapture-localhost-5173-admin-profile-2025-07-06-16_42_11](https://github.com/user-attachments/assets/b3e8f2bd-cf11-452b-8570-343693c65cb6)

*Admin: **Dashboard*
![screencapture-localhost-5173-admin-dashboard-2025-07-06-16_47_40](https://github.com/user-attachments/assets/7f2073d0-c0f0-471c-9998-2b2ebd13489f)

*Admin: **Applications*
![screencapture-localhost-5173-admin-applications-2025-07-06-16_48_14](https://github.com/user-attachments/assets/9dcf3bf4-f5cc-47b9-b903-fe5ede613371)

*Admin: **Employees*
![screencapture-localhost-5173-admin-employees-2025-07-06-16_46_02](https://github.com/user-attachments/assets/756f1372-6255-47f6-bf86-5e969eb2d5f4)

*HOD: **Profile*
![screencapture-localhost-5173-hod-profile-2025-07-06-16_50_19](https://github.com/user-attachments/assets/8247bec7-3396-4a5c-834e-e0982f56cc27)

*HOD: **Dashboard*
![screencapture-localhost-5173-hod-dashboard-2025-07-06-16_51_16](https://github.com/user-attachments/assets/6b2de017-4db4-4925-ab8a-2aac54336dc0)

*HOD: **Applications*
![screencapture-localhost-5173-hod-applications-2025-07-06-16_51_42](https://github.com/user-attachments/assets/891019f5-c879-49a2-9062-5877197977cc)

*HOD: **Apply Leave*
![screencapture-localhost-5173-hod-apply-leave-2025-07-06-16_52_38](https://github.com/user-attachments/assets/6eae1ea0-a04d-4728-86f3-99358d61e3d5)

*HOD: **History*
![screencapture-localhost-5173-hod-history-2025-07-06-16_53_55](https://github.com/user-attachments/assets/82031ecf-c0f3-4b8b-ae3d-aed31bcd91c2)

*HOD: **Employees*
![screencapture-localhost-5173-hod-employees-2025-07-06-16_54_32](https://github.com/user-attachments/assets/e71ef8b3-b3f3-4e19-8140-ab21da501974)

*Employee: **Profile*
![screencapture-localhost-5173-employee-profile-2025-07-06-16_56_04](https://github.com/user-attachments/assets/be110cf1-cf06-447c-a8b7-6256ed2e6e5c)

*Employee: **Dashboard*
![screencapture-localhost-5173-employee-dashboard-2025-07-06-16_55_22](https://github.com/user-attachments/assets/842ab0d0-2eef-47f5-8fb9-ce29e544a414)

*Employee: **Apply Leave*
![screencapture-localhost-5173-employee-apply-leave-2025-07-06-16_56_45](https://github.com/user-attachments/assets/e23c1cad-83be-4075-b430-14704ce1647c)

*Employee: **History*
![screencapture-localhost-5173-employee-history-2025-07-06-16_57_14](https://github.com/user-attachments/assets/03e1dc75-ebdc-46b7-8266-a75489b1383a)

## 📁 Project Structure

MIC-ELMS/
├── backend/                    # Node.js Backend
│   ├── models/                 # Database models
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── config.env              # Environment variables
│   ├── server.js               # Express server
│   ├── seed.js                 # Database seeding
│   └── package.json            # Backend dependencies
├── frontend/                   # React Frontend
│   ├── src/                    # Source code
│   ├── public/                 # Public assets
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
└── README.md                   # Project overview


## 🔧 Prerequisites
- *Node.js* (v16+)
- *MongoDB* (v5.0+)
- *Git*

## 🚀 Setup Instructions

### Step 1: Clone/Download Project
bash
# Option 1: Clone from GitHub
git clone https://github.com/YOUR_USERNAME/MIC-ELMS.git
cd MIC-ELMS

# Option 2: Download and extract the provided folder
# (node_modules folders are excluded - you'll install them next)


### Step 2: Environment Configuration
Create backend/config.env file:
env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mic-elms
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:5173


### Step 3: Install Dependencies
bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install


### Step 4: Database Setup & Seeding
bash
# Start MongoDB service
# Windows: net start MongoDB
# macOS/Linux: sudo systemctl start mongod

# Seed the database
cd backend
node seed.js


### Step 5: Start Application
bash
# Terminal 1 - Start Backend Server
cd backend
npm start
# Backend runs on: http://localhost:5000

# Terminal 2 - Start Frontend Server
cd frontend
npm run dev
# Frontend runs on: http://localhost:5173


## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| *Admin* | admin@mic.edu | admin123 |
| *HOD* | hod@mic.edu | hod123 |
| *Employee* | employee@mic.edu | employee123 |

## ✅ Verification
1. Open browser: http://localhost:5173
2. Login with any of the above credentials
3. Test the dashboard and leave management features

## 🔧 Common Issues
- *MongoDB not running*: Start MongoDB service
- *Port in use*: Kill process using port 5000/5173
- *Dependencies error*: Delete node_modules and run npm install again

---

*🎓 MIC College of Technology - Employee Leave Management System*
