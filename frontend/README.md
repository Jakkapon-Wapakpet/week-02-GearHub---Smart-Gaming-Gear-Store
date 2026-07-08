# 🎮 GearHub Frontend Web App

This folder contains the React Single Page Application (SPA) client for **GearHub - Smart Gaming Gear Store**. It features a modern dark-themed gaming setup visual, glassmorphic menus, real-time cart tracking, a side-by-side spec comparison grid, and PromptPay payment code simulations.

---

## 🛠 Tech Stack

* **Framework**: React 18+ (using Vite)
* **CSS Styling**: Tailwind CSS v4.0 (utilizing the new `@theme` configuration directives)
* **Icons**: Lucide React
* **Typography**: Outfit Google Font

---

## ✨ Features

* **Home Catalog Grid**: Live inventory updates, category filters, and tags search bar queries.
* **Smart Compare Sheet**: Put up to 3 mice, keyboards, or headsets side-by-side to review dimensions, weights, connections, and sensors.
* **Reactive Shopping Cart**: Add and adjust quantities, input delivery locations, and choose PromptPay billing.
* **PromptPay QR Code Simulator**: Interactive payment overlays calculating exact total fees.
* **Order History Dashboard**: Displays tracking numbers and shipping statuses.

---

## 🚀 Getting Started

### 1. Install Dependencies
Navigate to the `frontend` directory and run:
```bash
npm install
```

### 2. Configure Local API Server URL
The application is pre-configured to fetch endpoints from `http://localhost:5000/api`. Make sure your backend API server is running on port 5000.

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
The compiled, minified chunks will be built inside the `dist/` directory.
