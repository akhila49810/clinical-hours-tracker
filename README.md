# 🏥 VOM Clinical Hours Tracker
### Full-Stack — React · Node.js · Express · MySQL · Sequelize

A production-ready web portal for VOM Medical College. Students log clinical rotation hours and procedures; supervisors review, approve, or request revisions — with live dashboards and charts for both roles.

---

## ✨ Features

### 👨‍🎓 Student Portal
- 🔐 JWT-authenticated login & registration
- 📋 Log rotation hours with department, location, date, and patient encounters
- 🩺 Track procedures by category (Observed / Assisted / Performed / Supervised)
- 📝 Learning objectives & personal reflections
- 📊 Dashboard: monthly hours bar chart, department pie chart, status breakdown
- 🔄 Real-time status: Pending → Approved / Rejected / Revision Needed
- 💬 View supervisor feedback inline

### 👩‍⚕️ Supervisor Portal
- 📋 Filter and paginate all student submissions by status
- ✅ Approve / ↩ Request Revision / ✕ Reject with optional feedback
- 👥 Searchable student directory
- 📊 Overview dashboard: stats, department bar chart, status pie chart

---

## 🛠️ Tech Stack

| Layer     | Technology                                 |
|-----------|--------------------------------------------|
| Frontend  | React 18, React Router v6, Recharts, Tailwind CSS |
| Backend   | Node.js, Express.js                        |
| Database  | **MySQL** (via Sequelize ORM v6)           |
| Auth      | JWT + bcryptjs                             |
| Fonts     | DM Sans + Playfair Display (Google Fonts)  |

---

## 📁 Project Structure

```
vom-clinical-hours-tracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              ← Sequelize + MySQL connection
│   │   ├── models/
│   │   │   ├── User.js            ← Sequelize User model
│   │   │   ├── ClinicalLog.js     ← Sequelize ClinicalLog model
│   │   │   └── index.js           ← Associations (hasMany / belongsTo)
│   │   ├── middleware/
│   │   │   └── authMiddleware.js  ← JWT protect + role guards
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── logController.js
│   │   │   ├── supervisorController.js
│   │   │   └── dashboardController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── logRoutes.js
│   │   │   ├── supervisorRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── components/            ← Navbar, StatusBadge, PrivateRoute
│       ├── context/AuthContext.js ← Global JWT state
│       ├── hooks/useApi.js        ← All Axios API calls
│       ├── pages/                 ← All page components
│       ├── App.js
│       └── index.css              ← Tailwind + custom component classes
│
└── database/
    └── schema.sql                 ← Reference SQL (optional, Sequelize auto-syncs)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MySQL 8.0+ (or MySQL 5.7+ with JSON support)
- npm

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/vom-clinical-hours-tracker.git
cd vom-clinical-hours-tracker
```

### 2. Create MySQL Database
```sql
CREATE DATABASE vom_clinical_tracker;
```
Or run the provided schema:
```bash
mysql -u root -p < database/schema.sql
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vom_clinical_tracker
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=change_this_to_something_long_and_random
JWT_EXPIRE=7d
NODE_ENV=development
```

```bash
npm run dev
# Sequelize auto-creates tables on first run
# Server: http://localhost:5000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
# App: http://localhost:3000
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login → JWT |
| GET  | `/api/auth/profile` | Auth | Get own profile |

### Student Logs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET    | `/api/logs` | Student | Get my logs (paginated) |
| POST   | `/api/logs` | Student | Submit new log |
| GET    | `/api/logs/:id` | Auth | Get single log |
| PUT    | `/api/logs/:id` | Student | Edit log (not approved) |
| DELETE | `/api/logs/:id` | Student | Delete log (not approved) |

### Supervisor
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/supervisor/logs` | Supervisor | All logs (filterable) |
| PUT | `/api/supervisor/logs/:id/review` | Supervisor | Approve/reject/revise |
| GET | `/api/supervisor/students` | Supervisor | Student list |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/student` | Student | Stats + charts data |
| GET | `/api/dashboard/supervisor` | Supervisor | Overview stats + data |

---

## 🗄️ Database Schema (MySQL)

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(150) | |
| email | VARCHAR(255) UNIQUE | |
| password | VARCHAR(255) | bcrypt hashed |
| role | ENUM('student','supervisor') | |
| studentId | VARCHAR(50) | nullable |
| department | VARCHAR(150) | nullable |
| createdAt / updatedAt | DATETIME | Sequelize timestamps |

### `clinical_logs`
| Column | Type | Notes |
|--------|------|-------|
| id | INT PK AUTO_INCREMENT | |
| studentId | INT FK → users.id | CASCADE delete |
| supervisorId | INT FK → users.id | nullable |
| date | DATE | |
| department | VARCHAR(150) | |
| location | VARCHAR(255) | |
| hoursLogged | DECIMAL(4,1) | 0.5–24 |
| patientEncounters | INT | |
| procedures | JSON | Array of {name, category, notes} |
| learningObjectives | TEXT | |
| reflections | TEXT | |
| status | ENUM | pending/approved/rejected/revision_requested |
| supervisorFeedback | TEXT | |
| reviewedAt | DATETIME | |

---

## 🔒 Auth Flow

1. User registers → password hashed with bcrypt → stored in MySQL
2. Login → JWT token returned to client
3. Token stored in `localStorage` as `vom_user`
4. Every request sends `Authorization: Bearer <token>`
5. `protect` middleware verifies token → attaches `req.user`
6. `studentOnly` / `supervisorOnly` middleware enforces role access

---

## 🐙 Push to GitHub

```bash
git init
git add .
git commit -m "feat: VOM Clinical Hours Tracker - React + Node.js + MySQL"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/vom-clinical-hours-tracker.git
git push -u origin main
```

---

## 👩‍💻 Built By

Akhila — Full Stack Developer Portfolio Project for VOM Medical College

---

## 📄 License

MIT
