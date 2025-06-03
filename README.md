# PulseVault

**PulseVault** is a full-stack web application featuring a React frontend and an Express backend.

---

## 🧱 Project Structure

```
PulseVault/
├── pulsevault-frontend/   # React-based frontend
└── pulsevault-backend/    # Node.js + Express backend
```

---

## 🔧 Tech Stack

### Frontend
- React 19
- Chart.js & Recharts
- React Router
- React Toastify
- Styled Components
- Google reCAPTCHA

### Backend
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Bcrypt (for password hashing)
- Nodemailer (emailing)
- dotenv (config management)

---

##  Getting Started

### Prerequisites
- Node.js (v18 or later)
- PostgreSQL
- npm

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/PulseVault.git
cd PulseVault
```

### 2. Backend Setup
```bash
cd pulsevault-backend
npm install
# Add your environment variables in a .env file
npm start
```

### 3. Frontend Setup
```bash
cd ../pulsevault-frontend
npm install
npm start
```

---

## 📂 Environment Variables

Create a `.env` file inside `pulsevault-backend/` with values like:

```
PORT=5000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

---

##  Scripts

### Frontend
- `npm start` — Runs the React dev server
- `npm build` — Builds the app for production

### Backend
- `npm start` — Runs the Express server

---

## 📊 Features

- Secure authentication
- Data visualization with charts
- Email support
- Google reCAPTCHA integration

---

## 📃 License

This project is licensed under the ISC License.
