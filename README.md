# NativeRise — Rooted Locally. Growing Digitally.

> **Unified MERN (MongoDB, Express, React, Node.js) Digital Commerce, Logistics & Growth Platform for Rural Entrepreneurs & Artisans.**

NativeRise unites four critical functions for rural enterprise: **Digital Sales (Snap & Sell AI, Split Checkout)**, **Instant Payments (Color-Coded Statuses, Razorpay Sandbox, COD Reconciliation)**, **Hub-Based Logistics (Unified Delivery Fee, Weather Adjustments, Backhaul Optimization)**, and **Reinvestment Growth (Auto Growth Savings Vault, Community Trust Circles)**.

---

## 🌟 Key Architecture & Features

1. **Split-Order Engine (§7.1):**
   - When a customer checks out items from multiple rural makers in a single cart, one single payment is captured.
   - The backend automatically splits this into distinct `Order` documents per maker with independent checkpoint tracking and localized profit breakdown.

2. **Stock Reservation & Lock (§7.2):**
   - Adding items to cart increments `reservedStock` with a 10-minute lock window.
   - A background cron task running every minute releases expired holds.
   - Strict race-condition prevention server-side blocks overselling before payment capture.

3. **Unified Rural Delivery Pricing Calculator (§7.4):**
   - Standardized formula: `totalFee = 30 + (distanceKm * 4) + Math.ceil(weightGrams / 500) * 5`.
   - Incorporates seasonal monsoon / road delays into ETA estimates with customer warning banners.

4. **True Profit Calculator (§7.7):**
   - Calculates exact net maker profit: `actualProfit = sellingPrice - productCost - packagingCost - deliveryCost - (5% platformFee) - (2% paymentFee)`.
   - Profit margin percentage shown on every order and aggregated in Recharts graphs.

5. **Auto Growth Savings Vault (§7.8):**
   - On every order reaching `delivered` status, auto-locks `balancePercentSetting` (0-30%) of net profit into the seller's vault.
   - Sellers can unlock vault funds anytime with audited reasons (Raw Materials, Packaging, Equipment).

6. **COD-to-Digital Reconciliation Bridge (§7.9):**
   - Hub delivery agents record "Confirm Cash Collected" which immediately settles the seller's wallet and logs into the COD Float audit ledger.

7. **Multilingual System (12 Indian Languages in Native Scripts):**
   - `English, हिन्दी, मराठी, বাংলা, தமிழ், తెలుగు, ગુજરાતી, اردو, ಕನ್ನಡ, ଓଡ଼ିଆ, മലയാളം, ਪੰਜਾਬੀ`.
   - Persistent language switcher in header and on-demand dynamic translation for craft descriptions.

8. **Voice-Based Grievance Redressal (§7.14) & Community Trust Circles (§7.13):**
   - MediaRecorder audio grievance recording with automated speech transcription.
   - Verified local Sarpanch/Panchayat vouching badges and community mediation stage.

9. **Snap & Sell AI (§7.15) & WhatsApp Catalog Export (§7.16):**
   - Visual assistant suggesting product title, category, and price range from uploaded craft photos.
   - 1-click WhatsApp catalog export with direct `wa.me` links.

10. **Interactive Razorpay Sandbox Modal:**
    - Realistic modal with UPI, Cards, Netbanking, and COD simulations with loading, signature verification, and celebration states.

---

## 🚀 Quick Setup & Local Run

### Prerequisites
- Node.js (v18+)
- MongoDB running on `mongodb://localhost:27017`

### 1. Installation
Install all root, backend, and frontend dependencies:
```bash
npm run install:all
```
*(or run `npm install` inside both `server/` and `client/` directories)*

### 2. Seed Demo Data
Populate the database with ready-to-demo accounts across all 4 roles, 20+ artisan products with provenance cards, multi-stage orders, disputes, and reviews:
```bash
npm run seed
```

### 3. Start Development Servers (Concurrent)
Launch both Express backend API (`http://localhost:5000`) and Vite React frontend (`http://localhost:5173`) with a single command:
```bash
npm run dev
```

---

## 🔑 Demo Login Credentials

You can use the **1-Click Demo Sandbox Switcher** at the top of the landing page or login manually with these accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@nativerise.test` | `Admin@123` | Platform oversight, seller approvals, GMV, COD floats, disputes |
| **Seller (Approved & Vouched)** | `ramesh@nativerise.test` | `Pass@123` | Ramesh Bamboo Crafts (Nashik), orders, vault, profit analytics |
| **Seller (Pending Approval)** | `subrata@nativerise.test` | `Pass@123` | Sundarban Wild Honey (Demonstrates approval queue) |
| **Customer** | `customer1@nativerise.test` | `Pass@123` | Priya Sharma, cart, split checkout, live tracking, wishlist |
| **Delivery Agent (Hub)** | `delivery1@nativerise.test` | `Pass@123` | Sanjay Shinde (Nashik Hub), checkpoint updates, COD cash confirm |

---

## 📁 Repository Structure

```
nativerise/
├── client/                          # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/              # Common, Customer, Seller, Delivery, Admin, Three 3D
│   │   ├── pages/                   # All 4 roles + Public pages (Wishlist, Notifications, Support)
│   │   ├── layouts/                 # RootLayout, DashboardLayout, RouteGuard
│   │   ├── services/                # Axios API services
│   │   ├── store/                   # Zustand stores (Auth, Cart, Wishlist, Notifications)
│   │   ├── context/                 # SocketContext (real-time sync)
│   │   ├── locales/                 # 12-language translation dictionaries
│   │   └── i18n.js                  # react-i18next configuration
├── server/                          # Node.js + Express backend
│   ├── config/                      # db.js, socket.js, razorpay.js
│   ├── models/                      # User, SellerProfile, DeliveryPartnerProfile, Product, Cart, Payment, Order, Dispute, Review, Notification, Wishlist
│   ├── controllers/                 # auth, product, cart, checkout, order, dispute, seller, delivery, admin, review, notification, wishlist
│   ├── routes/                      # API v1 routes
│   ├── services/                    # delivery-fee-calculator, profit-calculator, seasonal-delay, translation, speech-to-text, vision-suggest
│   ├── seed/                        # seed.js (Full realistic demo database population)
│   ├── uploads/                     # Static files (images & audio voice notes)
│   └── server.js                    # Express + Socket.io + stock-releaser cron
├── .env.example
├── README.md
└── package.json                     # Concurrently orchestrator
```
