# 🛍️ MyStore - Full Stack E-Commerce Platform

![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red)
![AI](https://img.shields.io/badge/AI-Hugging%20Face-FFD21E?logo=huggingface&logoColor=black)

**A modern e-commerce platform with AI-powered chatbot, seller management system, and comprehensive order tracking.**

Built with React, TypeScript, Flask, PostgreSQL (Render), and Hugging Face AI (Mistral-7B) for intelligent customer support.

---

## 📚 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Admin Tools](#-admin-tools)
- [Security Features](#-security-features)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)
- [Contact](#-contact)

---

## ✨ Features

### 🛒 Customer Features
- 🔐 **User Authentication** - Signup/Login with OTP verification via Resend API
- 🛍️ **Shopping Cart** - Add, remove, and manage cart items
- 💳 **Secure Checkout** - Complete order with address details
- 📦 **Order Tracking** - View order history and status
- 🤖 **AI Chatbot** - Product search and customer support (Hugging Face Mistral-7B)
- 📧 **Email Notifications** - Order confirmations via Resend API
- 🔍 **Product Filtering** - Browse by categories

### 👨‍💼 Seller Features
- 📝 **Seller Registration** - Apply to become a seller with approval workflow
- ➕ **Product Management** - Add, edit, delete products
- ✅ **Draft/Publish System** - Control product visibility
- 📊 **Activity Logging** - Track all product changes with audit trail
- 📧 **Email Notifications** - Get notified on approval/rejection
- 📈 **Seller Dashboard** - Manage inventory and view analytics

### 🔧 Admin Features
- ✔️ **Seller Approval System** - Approve/reject seller applications via admin script
- 📩 **Contact Management** - Handle customer inquiries
- 📊 **System Monitoring** - Overview of platform activity
- 🛠️ **Database Management** - Auto-create tables with setup script
- 📧 **Email Queue** - Automated email notifications

---

## 📸 Screenshots

### Signup Page
![Signup Page](./Images/Signup.png)

### Login Page
![Login Page](./Images/Login.png)

### Home Page
![Home Page](./Images/Home.png)

### Seller Dashboard
![Seller Dashboard](./Images/Seller_dashboard.png)

### Seller Login
![Seller Login](./Images/Seller_login.png)

### Add New Product
![Add New Product](./Images/Add_new_product.png)

### Cart Page
![Cart Page](./Images/Cart_page.png)

### My Orders
![My Orders](./Images/My_orders.png)

### AI Chatbot
![Chatbot](./Images/Chatbot.png)

### Chatbot Conversation
![Chatbot Responses](./Images/Chatbot_communication.png)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Flask** | Python web framework |
| **PostgreSQL** | Cloud database (Render) |
| **psycopg2** | PostgreSQL adapter for Python |
| **bcrypt** | Password hashing |
| **Resend API** | Email service for OTP & notifications |
| **Hugging Face** | AI chatbot (Mistral-7B-Instruct-v0.2) |
| **Flask-CORS** | Cross-origin requests |
| **python-dotenv** | Environment variables |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React** | UI library |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **Axios** | HTTP client |
| **CSS3** | Styling |

### Cloud Services
- **Hugging Face API** - Mistral-7B-Instruct-v0.2 for chatbot
- **Resend** - Transactional email API
- **Render** - PostgreSQL database hosting

---

## 📁 Project Structure
```bash
ecommerce-project/
├── Backend/ # Flask REST API (Python)
│ ├── app.py # Main Flask application
│ ├── create_tables.py # Database setup script
│ ├── approve_seller.py # Admin seller management tool
│ ├── .env.example # Environment variables template
│ └── requirements.txt # Python dependencies
├── frontend/ # React + TypeScript Frontend
│ ├── src/ # Source code
│ ├── public/ # Static assets
│ ├── .env.production # Production config
│ ├── vercel.json # Vercel deployment config
│ └── package.json # Node dependencies
├── Images/ # Project screenshots
├── sql/ # SQL schema files (reference)
│ ├── SingupDB.sql # User database schema
│ └── seller_DB.sql # Seller database schema
└── README.md # This file
```
---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- Git
- Hugging Face account (free) - [Sign up](https://huggingface.co/join)
- Resend account (free tier) - [Sign up](https://resend.com/signup)
- Render PostgreSQL database - [Create free database](https://render.com)


### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/ShashankGowni/ecommerce-fullstack.git
cd ecommerce-project
```
## Backend Setup
**Navigate to Backend:**
``bash
cd Backend
```
**Create virtual environment:**
```bash

python -m venv venv
```
**Activate virtual environment:**

```bash

# Windows:
venv\Scripts\activate
pip install -r requirements.txt
```
## Create .env file:

```env```

# Email Configuration (Resend API)
```text
EMAIL_ADDRESS=your-email@example.com
EMAIL_PASSWORD=not-used-with-resend
RESEND_API_KEY=re_your_resend_api_key_here
```

# Database Configuration (PostgreSQL on Render)
```DATABASE_URL=postgresql://username:password@host/database_name```

# Hugging Face API
``` text
HF_API_KEY=hf_your_hugging_face_token_here
HF_API_URL=https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2
```
**Setup Database (Auto-create tables):**

```bash

python create_tables.py
```

**This script will:**
- Connect to your PostgreSQL database
- Drop existing tables (if any)
- Create all required tables
- Set up indexes and triggers
- Verify setup

**Run Backend:**
```bash

python app.py
```
```🌐 Backend runs on http://localhost:5000```

## Frontend Setup
**Navigate to frontend:**

```bash

cd frontend
```
**Install dependencies:**

```bash

npm install
```
**Create .env.local for development:**

```env```

```VITE_API_URL=http://localhost:5000```

**Run development server:**
```bash
npm run dev
🌐 Frontend runs on http://localhost:5173
```

## Get API Keys
**Render PostgreSQL Database**

- Go to https://render.com/
- Sign up for free account
- Click "New" → "PostgreSQL"
- Choose free plan
- Copy the "External Database URL"
- Add to .env as DATABASE_URL
## Hugging Face API

- Go to https://huggingface.co/join
- Sign up for free
- Go to Settings → Access Tokens
- Click "New token"
- Select "Read" permission
- Copy token

## Add to .env:
```env```

```HF_API_KEY=hf_your_token_here```
## Resend API (Email/OTP)

- Go to https://resend.com/signup
- Sign up (3,000 free emails/month)
- Go to API Keys
- Click "Create API Key"
- Copy the key

## Add to .env:
```env```

```RESEND_API_KEY=re_your_key_here```

## 🔌 API Endpoints
**Authentication**
```
POST /signup - User registration
POST /login - User login
POST /send-otp - Send OTP verification via Resend
POST /verify-otp - Verify OTP code
```

**Seller Management**
```
POST /seller-signup - Seller registration (creates pending seller)
POST /seller-login - Seller login (only approved sellers)
GET /seller-products - Get seller's products
POST /check-seller-status - Check approval status
GET /seller-activity - Get activity logs
POST /update-seller-status - Approve/reject seller (admin only)
```
**Products**
```
GET /products - Get all published products
GET /products/<id> - Get single product details
POST /add-product - Add new product (seller only)
PUT /products/<id> - Update product
DELETE /products/<id> - Delete product
PATCH /products/<id>/publish - Publish product
PATCH /products/<id>/unpublish - Unpublish (draft) product
```
## Orders
```
POST /save-order - Save order to database
POST /send-order-email - Send order confirmation via Resend
GET /get-orders/<email> - Get user's order history
Chatbot (AI - Hugging Face)
POST /chat - Basic AI chat with Mistral-7B
POST /chat-with-history - Chat with conversation context
POST /chat-product-search - AI-powered product search
```
## Contact
```
POST /contact-us - Submit contact form
GET /admin/contact-messages - Get all messages (admin)
```
## 💾 Database Schema
**Tables Created by create_tables.py:**

- Users - Customer accounts with authentication
- Sellers - Seller accounts with approval status
- Products - Product catalog (draft/published states)
- Orders - Customer order information
- OrderItems - Individual items in orders
- ProductActivityLog - Audit trail for product changes
- SellerStatusChanges - Track seller approval/rejection with email queue
- ContactMessages - Customer support inquiries

## Triggers:

trg_seller_status_change - Auto-log status changes and queue emails

## Indexes:

Optimized for seller email, product ID, and timestamp queries

## 🛠️ Admin Tools
**Database Setup Script**
- File: create_tables.py

- Purpose: Automatically creates all database tables, indexes, and triggers

**Usage:**
```bash

cd Backend
python create_tables.py
```
**Features:**

- ✅ Drops old tables safely
- ✅ Creates all tables in correct order
- ✅ Sets up foreign keys
- ✅ Creates indexes for performance
- ✅ Sets up email notification triggers
- ✅ Verifies setup

## Seller Management Tool (CRUD)
- File: approve_seller.py

- Purpose: Admin interface for managing sellers

**Usage:**

```bash

cd Backend
python approve_seller.py
```
**Features:**

**READ/VIEW:**

- View all sellers
- View pending sellers
- View seller details by ID

**UPDATE:**

- Approve seller (sends email, allows login)
- Reject seller (sends email, blocks login)

## Update seller information
**CREATE:**

Manually create seller with chosen status

**DELETE:**

Delete seller and all products

**EMAIL:**
**Send pending approval emails**
- 🔒 Security Features
- ✅ Password hashing with bcrypt
- ✅ OTP verification for signup via Resend API
- ✅ Environment variables for sensitive data
- ✅ SQL injection protection (parameterized queries)
- ✅ Session management
- ✅ Secure authentication flow
- ✅ API keys never exposed to frontend
- ✅ CORS protection with Flask-CORS
- ✅ PostgreSQL SSL mode enabled

## 🐛 Troubleshooting
**Backend Issues**

**PostgreSQL connection error:**
```bash

DATABASE_URL=postgresql://user:password@host/dbname
```
**python create_tables.py**

**psycopg2 installation fails:**

```bash
pip install psycopg2-binary
```
**Hugging Face API errors:**

✅ Check if HF_API_KEY is valid
✅ First request takes 20-30 seconds (model loading)
✅ Free tier has rate limits
✅ Check https://status.huggingface.co/
```
**Resend email not sending:**

- ✅ Verify RESEND_API_KEY is correct
- ✅ Free tier: 3,000 emails/month, 100/day
- ✅ Check dashboard: https://resend.com/emails
- ✅ Verify sender email

**Import errors:**
```bash
pip install -r requirements.txt
```
## Frontend Issues
**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port already in use:**
```bash
export default defineConfig({
  server: { port: 3000 }
})
```

## CORS errors:
- Verify backend URL in frontend config
- Check Flask-CORS is installed
- Verify backend is running

## Build errors:
```bash
npm run build
```
## Database Issues
**Tables not created:**
```bash
python create_tables.py
Seller can't login after approval:
```
Run approve_seller.py to check status
Verify status is "Approved" (case-sensitive)
Products not showing:

Check product status is "published" (not "draft")
Verify seller is approved

## 📝 License
© 2025 Gowni Shashank. All Rights Reserved.

This software is proprietary and confidential. See the LICENSE file for complete terms.

**📋 License Summary**
- ✅ Viewable for portfolio/demonstration purposes only
- ❌ No permission to use, copy, modify, or distribute
- ❌ Commercial use strictly prohibited without written permission
- 💼 For licensing inquiries: shashankgowni09@gmail.com
This project is shared publicly to showcase my development capabilities.

## 🙏 Acknowledgments

**Flask - Python web framework**
- Hugging Face - AI model hosting and Mistral-7B model
- Resend - Modern email API
- React - Frontend library
- Vite - Build tool
- PostgreSQL - Database
- Render - Cloud database hosting
- Vercel - Frontend deployment


## 📬 Contact
**Gowni Shashank**

📧 Email: shashankgowni09@gmail.com
💼 LinkedIn: linkedin.com/in/shashankgowni
🐙 GitHub: @ShashankGowni

Open to collaboration on interesting projects.

**Created with 💻 by Gowni Shashank • January 2025 🌍**

