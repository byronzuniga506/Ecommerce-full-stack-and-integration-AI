# 🛍️ MyStore - Full Stack E-Commerce Platform

A modern e-commerce platform with AI-powered chatbot, seller management system, and comprehensive order tracking.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![Flask](https://img.shields.io/badge/flask-3.0-green.svg)

## 📁 Project Structure

ecommerce-project/
├── Backend/ # Flask REST API (Python)
│ ├── app.py # Main Flask application
│ ├── .env.example # Environment variables template
│ └── requirements.txt # Python dependencies
├── frontend/ # React + TypeScript Frontend
│ ├── src/ # Source code
│ ├── public/ # Static assets
│ └── package.json # Node dependencies
├── Images/ # Project screenshots
└── sql/ # Database scripts
├── SingupDB.sql # User database
└── seller_DB.sql # Seller database

## ✨ Features

### 🛒 Customer Features
- 🔐 **User Authentication** - Signup/Login with OTP verification
- 🛍️ **Shopping Cart** - Add, remove, and manage cart items
- 💳 **Secure Checkout** - Complete order with address details
- 📦 **Order Tracking** - View order history and status
- 🤖 **AI Chatbot** - Product search and customer support (Ollama llama3.2:1b)
- 📧 **Email Notifications** - Order confirmations via email
- 🔍 **Product Filtering** - Browse by categories

### 👨‍💼 Seller Features
- 📝 **Seller Registration** - Apply to become a seller with approval workflow
- ➕ **Product Management** - Add, edit, delete products
- ✅ **Draft/Publish System** - Control product visibility
- 📊 **Activity Logging** - Track all product changes
- 📧 **Email Notifications** - Get notified on product actions
- 📈 **Seller Dashboard** - Manage inventory and view analytics

### 🔧 Admin Features
- ✔️ **Seller Approval System** - Approve/reject seller applications
- 📩 **Contact Management** - Handle customer inquiries
- 📊 **System Monitoring** - Overview of platform activity

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Flask** | Python web framework |
| **SQL Server** | Database (pyodbc) |
| **bcrypt** | Password hashing |
| **SMTP** | Email service (Gmail) |
| **Ollama** | AI chatbot (llama3.2:1b) |
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

### Database Schema
- **Users** - Customer accounts
- **Sellers** - Seller accounts with status
- **Products** - Product catalog (draft/published)
- **Orders** - Order information
- **OrderItems** - Order line items
- **ProductActivityLog** - Product change history
- **ContactMessages** - Customer support messages

## 🚀 Getting Started

### Prerequisites
```
Python 3.8+
Node.js 16+
SQL Server
Ollama
Git 
```
### Clone the Repository:
```
git clone https://github.com/ShashankGowni/ecommerce-fullstack.git
cd ecommerce-fullstack
```

### Backend Setup:

 Navigate to Backend
cd Backend

Create virtual environment
python -m venv venv

 Activate virtual environment
 Windows:
venv\Scripts\activate
 Mac/Linux:
source venv/bin/activate

 Install dependencies
pip install -r requirements.txt

.env file
Email Configuration
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

 Database Configuration
server=YOUR-SERVER-NAME\SQLEXPRESS
database=SignupDB
seller_database=SellerDB

Run Backend:
python app.py

🌐 Backend runs on http://localhost:5000

Frontend Setup

 Navigate to frontend
cd frontend

 Install dependencies
npm install

 Run development server
npm run dev

🌐 Frontend runs on http://localhost:5173

Database Setup:

Open SQL Server Management Studio
Execute scripts from sql/ folder:
    SingupDB.sql - Creates user database and tables
    seller_DB.sql - Creates seller database and tables


Ollama Setup (AI Chatbot)


 Install Ollama from https://ollama.ai/

 Pull the model
ollama pull llama3.2:1b

 Verify installation
ollama list


Gmail SMTP Configuration
Get App Password:
Go to Google Account Security
Enable 2-Step Verification
Go to App passwords
Select Mail and generate password
Copy the 16-character password
Add to .env file

🔌 API Endpoints
Authentication


POST   /signup          - User registration
POST   /login           - User login
POST   /send-otp        - Send OTP verification
POST   /verify-otp      - Verify OTP code
Seller Management


POST   /seller-signup         - Seller registration
POST   /seller-login          - Seller login
GET    /seller-products       - Get seller's products
POST   /check-seller-status   - Check approval status
GET    /seller-activity       - Get activity logs
POST   /update-seller-status  - Approve/reject seller (admin)
Products


GET    /products              - Get all published products
GET    /products/<id>         - Get single product
POST   /add-product           - Add new product (seller)
PUT    /products/<id>         - Update product
DELETE /products/<id>         - Delete product
PATCH  /products/<id>/publish   - Publish product
PATCH  /products/<id>/unpublish - Unpublish product
Orders


POST   /save-order            - Save order to database
POST   /send-order-email      - Send order confirmation
GET    /get-orders/<email>    - Get user's orders
Chatbot (AI)


POST   /chat                  - Basic AI chat
POST   /chat-with-history     - Chat with conversation context
POST   /chat-product-search   - AI-powered product search
Contact


POST   /contact-us                 - Submit contact form
GET    /admin/contact-messages     - Get all messages (admin)




🔒 Security Features
 Password hashing with bcrypt
OTP verification for signup
 Environment variables for sensitive data
 SQL injection protection (parameterized queries)
 CORS configuration
 Email verification
 Session management
 Secure authentication flow

Troubleshooting
Backend Issues
pyodbc installation fails:



 Install Microsoft C++ Build Tools
Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
Then: pip install pyodbc
Email not sending:

 Check Gmail App Password is correct:
Verify 2FA is enabled on Gmail
Check SMTP settings in .env
Database connection error:

Verify SQL Server is running
Check server name in .env
Ensure databases are created
Frontend Issues
Module not found:



Delete node_modules and reinstall
rm -rf node_modules
npm install
Port already in use:



Change port in vite.config.js
server: { port: 3000 }
🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository
Create a feature branch


git checkout -b feature/AmazingFeature
Commit your changes
ash

git commit -m 'Add some AmazingFeature'
Push to the branch


git push origin feature/AmazingFeature
Open a Pull Request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

👨‍💻 Author
Shashank Gowni

🐙 GitHub: @ShashankGowni
📧 Email: shashankgowni09@gmail.com
💼 LinkedIn: [Add your LinkedIn]
🙏 Acknowledgments
Flask Documentation
Ollama AI
React Documentation
Vite
SQL Server
Community contributors and testers
📞 Support
If you have any questions or need help, feel free to:

📧 Email: shashankgowni09@gmail.com
🐛 Open an issue on GitHub
💬 Use the contact form in the application
⭐ If you found this project helpful, please give it a star!

Made with ❤️ by Shashank Gowni

---
