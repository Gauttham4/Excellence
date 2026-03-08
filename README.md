# Excellence — Success Academy Management System

> **Where Excellence Meets Guidance**

A full-stack student coaching management platform for **Success Academy, Puducherry** — handling student registrations, PDF archival to Google Drive, top performer showcases, and admin operations.

---

## Overview

Excellence is a three-part system:

| Part | Description | Tech |
|------|-------------|------|
| **Public Website** | Student registration, achievements display | React 18, Vite, Tailwind CSS |
| **Admin Dashboard** | Application management, user control | React 19, Vite, Tailwind CSS |
| **Backend API** | Data processing, Drive & Firestore integration | Node.js, Express 5, Firebase |

---

## Features

### Public Website (`Dhanoos_website/`)
- **Hero landing page** with institute stats (500+ students, 98% pass rate, 10+ years)
- **Student registration form** — collects student, parental, and contact details
  - Standards supported: 10th, 11th, 12th
  - Board support: CBSE, State Board, ICSE
  - Photo upload with PDF auto-generation (jsPDF)
  - 60+ Puducherry school autocomplete
- **Top Performers section** — filterable by standard and academic year
- **Testimonials section**
- Scroll-reveal animations via GSAP
- Fully responsive design

### Admin Dashboard (`admin-dashboard/`)
- **Applications tab** — Browse submitted PDFs from Google Drive, filter by standard/board, open directly in browser
- **Top Performers tab** — Add/delete achievers per standard with subject-wise marks
- **User Management tab** — Register, edit, delete admin users with search
- **Settings** — Update current academic year (e.g., `2025-26`)
- Dark glassmorphism UI, mobile-friendly

### Backend API (`backend/`)
- RESTful API on port `5000`
- Firebase Firestore for structured data
- Google Drive API for PDF archival (OAuth2)
- Header-based admin authentication (`adminemail`)

---

## API Reference

### Auth & Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Admin login |
| `POST` | `/api/admin/verify` | Verify admin session |
| `POST` | `/api/admin/register` | Register new admin (protected) |
| `GET` | `/api/admin/users` | List all admins (protected) |
| `PUT` | `/api/admin/users/:userId` | Update admin user (protected) |
| `DELETE` | `/api/admin/users/:userId` | Delete admin user (protected) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/submit-application` | Submit student form (uploads PDF to Drive + Firestore) |
| `GET` | `/api/pdfs/all` | Get all submitted PDFs with counts |
| `GET` | `/api/pdfs/10th` | Get 10th standard PDFs |
| `GET` | `/api/pdfs/11th` | Get 11th standard PDFs |
| `GET` | `/api/pdfs/12th` | Get 12th standard PDFs |

### Top Performers
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/top-performers` | List all top performers (public) |
| `POST` | `/api/top-performers` | Add top performer (protected) |
| `DELETE` | `/api/top-performers/:id` | Delete performer (protected) |

### Misc
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/academic-year` | Get current academic year |
| `POST` | `/api/academic-year` | Set academic year (format: `YYYY-YY`) |
| `GET` | `/api/health` | Server health check |

---

## Tech Stack

**Frontend (Website)**
- React 18.2, React Router DOM 6
- Vite 5, Tailwind CSS 3
- GSAP (animations), jsPDF (PDF generation), Firebase SDK

**Frontend (Dashboard)**
- React 19.2, React Router DOM 7
- Vite 7, Tailwind CSS 4

**Backend**
- Node.js, Express 5
- Firebase Admin SDK 13 (Firestore)
- Google APIs (Drive, OAuth2)
- Multer, PDFKit, dotenv, CORS, Nodemon

---

## Project Structure

```
Excellence/
├── Dhanoos_website/
│   └── Dhanoos_website/
│       ├── src/
│       │   ├── App.jsx               # Routes & main layout
│       │   ├── AdminDashboard.jsx    # Inline admin view
│       │   └── ...
│       ├── vite.config.js
│       └── package.json
│
├── admin-dashboard/
│   └── admin-dashboard/
│       └── dashboard/
│           ├── src/
│           │   ├── App.jsx
│           │   └── components/
│           │       ├── Login.jsx
│           │       ├── Dashboard.jsx
│           │       ├── ApplicationsTable.jsx
│           │       ├── TopPerformers.jsx
│           │       ├── UserManagement.jsx
│           │       ├── StatsCards.jsx
│           │       ├── AcademicYearModal.jsx
│           │       ├── RegisterUserModal.jsx
│           │       └── EditUserModal.jsx
│           └── package.json
│
├── backend/
│   └── backend/
│       ├── server.js                 # Express API server
│       ├── .env                      # 🔒 Not committed
│       ├── google-credentials.json   # 🔒 Not committed
│       ├── serviceAccountKey.json    # 🔒 Not committed
│       └── package.json
│
└── .gitignore
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with Firestore enabled
- Google Cloud project with Drive API enabled and OAuth2 credentials

### 1. Backend

```bash
cd backend/backend
npm install
```

Create a `.env` file:
```env
PORT=5000
# Add your Firebase and Google Drive config here
```

Place your credential files (not committed):
- `serviceAccountKey.json` — Firebase service account
- `google-credentials.json` — Google Drive API credentials
- `oauth-credentials.json` — OAuth2 credentials

```bash
npm run dev      # development (nodemon)
npm start        # production
```

### 2. Public Website

```bash
cd Dhanoos_website/Dhanoos_website
npm install
npm run dev
```

Runs on `http://localhost:5173` by default.

### 3. Admin Dashboard

```bash
cd admin-dashboard/admin-dashboard/dashboard
npm install
npm run dev
```

Runs on `http://localhost:5174` by default.

---

## Firestore Collections

| Collection | Purpose |
|------------|---------|
| `application-docs` | Student registration data + Drive file references |
| `top-performers` | Achiever records with subject-wise marks |
| `authorized-persons` | Admin user accounts |
| `academic-details` | Current academic year config |

---

## Security Notes

- Credential files (`.env`, `serviceAccountKey.json`, `google-credentials.json`, etc.) are excluded via `.gitignore` and must **never** be committed.
- Admin routes are protected by validating the `adminemail` request header against the `authorized-persons` Firestore collection.
- An admin cannot delete their own account.

---

## License

This project is proprietary software developed for **Success Academy, Puducherry**.
All rights reserved.
