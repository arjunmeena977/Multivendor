# Multi-Vendor Marketplace (Mini Project)

A full-stack marketplace application with Admin, Vendor, and Customer roles.

## Tech Stack
- **Frontend**: React (Vite)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + RBAC

## Prerequisites
- Node.js installed
- PostgreSQL installed and running
- Create a database named `multivendor_db` (or update `.env`)

## Setup Instructions

### 1. Database Setup
Ensure PostgreSQL is running.
Update `server/.env` if your credentials differ from the default (`postgres:password`).

### 2. Backend Setup
```bash
cd server
npm install
npx prisma generate
npx prisma db push  # Or npx prisma migrate dev --name init
npm run dev
```
Server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`.

## Sample Test Flow

### Step 1: Vendor Onboarding
1. Go to `http://localhost:5173/register`.
2. Register as **VENDOR** (Shop Name: "TechWorld", Email: "vendor@test.com").
3. Try to login. You will see "Dashboard Locked" as the status is PENDING.

### Step 2: Admin Approval
1. Register another user as **CUSTOMER**, then manually update DB or code to make them **ADMIN** (or seeded admin).
   *Tip: Use Prisma Studio (`npx prisma studio` in server folder) to change the role of a user to `ADMIN`.*
2. Login as ADMIN. Go to **Dashboard -> Vendors**.
3. Click "Approve" for "TechWorld".

### Step 3: Product Creation
1. Login as Vendor (now Approved).
2. Go to **Dashboard -> My Products**.
3. Add a product: "Gaming Laptop", Price: 1000, Stock: 5.
4. Product Status is PENDING.

### Step 4: Product Approval
1. Login as Admin.
2. Go to **Dashboard -> Products**.
3. Click "Approve" for "Gaming Laptop".
4. Ensure "Visible" says YES.

### Step 5: Customer Purchase
1. Register/Login as **CUSTOMER**.
2. Go to "Marketplace" (Home).
3. You see "Gaming Laptop". Click "Add to Cart".
4. Go to Cart, click "Checkout".

### Step 6: Earnings & Settlement
1. **Vendor**: Login and check "Earnings Report". You should see Total Sales: $1000, Earnings: $900 (90%).
2. **Admin**: Go to "Settlements". Select Vendor, Date Range, and click "Generate".
3. Verify Gross $1000, Net $900.
4. Click "Mark Paid" to simulate payout.

## Folder Structure
- `server/src/controllers`: Business logic
- `server/src/routes`: API endpoints
- `server/src/middlewares`: Auth guards
- `client/src/pages`: Frontend Views (Admin, Vendor, Customer)
- `client/src/context`: Auth & Cart state
