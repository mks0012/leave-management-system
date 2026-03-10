# Leave Management System (LMS)

A robust Full-Stack application built for the Huskyvoice recruitment assignment. This system allows employees to request leaves and employers to manage them through a secure, role-based dashboard.

## 🚀 Live Links
- **Frontend (UI)**: (https://leave-management-system-pi-black.vercel.app/)
- **Backend (API)**: (https://leave-management-system-2ocz.onrender.com)

## 🛠 Tech Stack
- **Frontend**: Vue.js 3 (Composition API), Tailwind CSS, Vue Router, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas (M0 Free Tier).
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing.

## ✨ Core Features & Bonus Implementations
- **Role-Based Access Control (RBAC)**: Strict separation of Employee and Employer capabilities.
- **JWT-Based Authentication**: Secure login sessions and protected API routes.
- **Leave Overlap Protection**: Advanced backend logic prevents employees from booking multiple leaves on the same date.
- **Input Validation**: Date-range checks (prevents past dates and invalid "End Dates").
- **UX Enhancements**: Password visibility toggle and "Enter" key form submission.

## 📐 Deployment Topology
The application is deployed using a decoupled architecture to ensure scalability and separation of concerns:

1. **Client Layer**: The Vue.js SPA is hosted on **Vercel**, providing fast global delivery of static assets.
2. **API Layer**: The Express server is hosted on **Render**, handling business logic and JWT verification.
3. **Data Layer**: **MongoDB Atlas** serves as the cloud-hosted persistence layer, managed via a secure M0 cluster.



## 📡 API Endpoints

### Authentication
- `POST /register` - Create a new Employee or Employer account.
- `POST /login` - Authenticate user and return a JWT.

### Leave Management
- `POST /leaves` - (Employee Only) Submit a new leave request with overlap check.
- `GET /my-leaves` - (Employee Only) Fetch personal leave history.
- `GET /admin/leaves` - (Employer Only) Fetch all pending and processed requests.
- `PATCH /admin/leaves/:id` - (Employer Only) Update request status to 'Approved' or 'Rejected'.

## ⚙️ Local Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas Account

### 1. Backend Setup
```bash
cd backend
npm install

Create a .env file in the /backend folder:

Code snippet

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
Start the server: node server.js

2. Frontend Setup
Bash

cd frontend
npm install
Start the development server: npm run dev

📝 Environment Variables
The following sensitive keys are managed via environment variables to ensure security:

MONGO_URI: Connection string for the database.

JWT_SECRET: Secret key used for signing and verifying authentication tokens.

PORT: The port on which the backend server runs (default: 5000).

📂 Project Structure

leave-management-system/
├── backend/            # Express.js API
│   ├── .env            # Environment variables (Git-ignored)
│   └── server.js       # Main server logic & Models
├── frontend/           # Vue.js 3 Application
│   ├── src/
│   │   ├── views/      # Page components (Login, Dashboard)
│   │   ├── router/     # Auth Guards & Navigation
│   │   └── assets/     # Tailwind CSS & Styles
│   └── package.json
└── README.md           # Project Documentation