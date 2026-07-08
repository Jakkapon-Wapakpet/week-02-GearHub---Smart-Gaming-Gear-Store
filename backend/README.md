# 🎮 GearHub Backend API Server

This folder contains the backend API server for the **GearHub - Smart Gaming Gear Store** web application. It connects to MongoDB Atlas, enforces schema validation, and handles authentication, product listings, side-by-side comparisons, and orders.

---

## 🛠 Tech Stack

* **Runtime Environment**: Node.js
* **Framework**: Express.js
* **Database Driver**: MongoDB Native NodeJS Driver (`mongodb`)
* **Security & Tokens**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`)

---

## 🚀 Getting Started

### 1. Install Dependencies
Navigate to the `backend` directory and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create or verify the `.env` file in the `backend/` directory with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_for_tokens
```

### 3. Run the Server
* **Production Mode**:
  ```bash
  npm start
  ```
* **Development Mode (Auto-reloads via nodemon)**:
  ```bash
  npm run dev
  ```
The server will start listening at `http://localhost:5000`.

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
* `POST /register` - Register a new customer account
* `POST /login` - Login check, returns a signed JWT
* `GET /profile` - Retrieve the currently authenticated user profile (Header: `Authorization: Bearer <token>`)

### 📦 Product Catalog (`/api/products`)
* `GET /` - Retrieve all products (Supports queries: `?category=Mouse` and `?search=viper`)
* `GET /compare` - Compare up to 3 products side-by-side (Query: `?ids=id1,id2,id3`)
* `GET /:id` - Get individual product details by database ObjectId
* `POST /` - Insert a new product into the database (Admin only)

### 🛒 Orders & Stock Checkout (`/api/orders`)
* `POST /` - Places a new checkout order, validates stock, and automatically decrements inventory (Requires customer token)
* `GET /my-orders` - Retrieve historical orders placed by the current customer (Requires customer token)
* `GET /` - List all orders in the store (Admin only)
* `PUT /:id/status` - Update order processing state and insert shipping tracking number (Admin only)
