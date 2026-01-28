# 📇 Contact Manager

A full-stack contact management application built with **React**, **Node.js**, **Express**, and **MongoDB**.

---

## ✨ Features

* **Contact Management**: Full CRUD operations with advanced filtering
* **Starred Contacts**: Mark and quickly access important contacts
* **Activity Log**: Track all important system actions
* **Bulk Operations**: Perform actions on multiple contacts at once
* **Export Functionality**: Export contacts to CSV
* **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

---

## 🚀 Quick Start

### Prerequisites

* Node.js **v18+**
* MongoDB **v6+**
* npm or yarn

---

## 📦 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/chetanmadiwalar/Contact-Manager.git
cd Contact-Manager
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit the `.env` file and add your MongoDB connection string.

**backend/.env**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/contact_manager
JWT_SECRET=your_secret_key
```

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
```

**frontend/.env**

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## ▶️ Running the Application

### Method 1: Run Separately

**Terminal 1 – Backend**

```bash
cd backend
npm run dev
```

**Terminal 2 – Frontend**

```bash
cd frontend
npm start
```

---

### Method 2: Run from Root (Optional)

> Requires `concurrently` package

```bash
npm install
npm run dev
```

---

## 🌐 Access URLs

* **Frontend**: [http://localhost:3000](http://localhost:3000)
* **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 📁 Project Structure

```text
contact-manager/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── models/
│   │   ├── Contact.js
│   │   ├── ContactGroup.js
│   │   └── ActivityLog.js
│   ├── routes/
│   │   ├── contacts.js
│   │   ├── groups.js
│   │   └── analytics.js
│   └── .env
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.js
│       │   │   ├── Sidebar.js
│       │   │   └── ThemeToggle.js
│       │   ├── dashboard/
│       │   │   ├── AnalyticsDashboard.js
│       │   │   └── StatsCard.js
│       │   ├── contacts/
│       │   │   ├── ContactForm.js
│       │   │   ├── ContactList.js
│       │   │   ├── ContactItem.js
│       │   │   ├── ContactFilters.js
│       │   │   ├── BulkActions.js
│       │   │   └── ExportButton.js
│       │   ├── groups/
│       │   │   ├── GroupManager.js
│       │   │   └── GroupSelector.js
│       │   └── common/
│       │       ├── FormWizard.js
│       │       ├── Pagination.js
│       │       └── ActivityLog.js
│       ├── context/
│       │   └── ThemeContext.js
│       ├── services/
│       │   ├── api.js
│       │   ├── exportService.js
│       │   └── validationService.js
│       ├── hooks/
│       │   ├── useDebounce.js
│       │   └── useLocalStorage.js
│       ├── utils/
│       │   ├── animations.js
│       │   └── formatters.js
│       ├── styles/
│       │   ├── App.css
│       │   ├── theme.css
│       │   └── animations.css
│       └── assets/
│           └── icons/
```

---

## 🔧 API Endpoints

### 📇 Contacts

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| GET    | `/api/contacts`          | Get all contacts      |
| GET    | `/api/contacts/:id`      | Get a single contact  |
| POST   | `/api/contacts`          | Create a new contact  |
| PUT    | `/api/contacts/:id`      | Update a contact      |
| DELETE | `/api/contacts/:id`      | Delete a contact      |
| POST   | `/api/contacts/:id/star` | Star / Unstar contact |

---

### 🕒 Activities

| Method | Endpoint          | Description         |
| ------ | ----------------- | ------------------- |
| GET    | `/api/activities` | Fetch activity logs |

---

### 👥 Groups

| Method | Endpoint      | Description        |
| ------ | ------------- | ------------------ |
| GET    | `/api/groups` | Get all groups     |
| POST   | `/api/groups` | Create a new group |

---

## 👤 Author

**Chetan Madiwalar**

* GitHub: [@chetanmadiwalar](https://github.com/chetanmadiwalar)

---

## 📄 License

This project is licensed under the **MIT License**.

---

⭐ If you like this project, don’t forget to star the repository!
