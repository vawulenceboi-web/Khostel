# 🚀 k-H Quick Start Guide

## ⚡ **2-Minute Setup**

### **Step 1: Supabase Setup**
1. Go to [supabase.com](https://supabase.com) → Create project
2. Go to **SQL Editor** → Paste the entire content of `sql/schema.sql`
3. Click **Run** → Wait for "Setup Complete!" message

### **Step 2: Get Your Credentials**
From your Supabase dashboard:
- **Settings → API**: Copy `URL` and `anon key`
- **Settings → Database**: Copy connection string (replace password)

### **Step 3: Configure & Run**
```bash
# 1. Setup environment
npm run setup

# 2. Edit .env.local with your Supabase credentials

# 3. Start the platform
npm run dev
```

## 🎯 **Test Accounts**

**Admin Account:**
- Email: `admin@k-hostel.com`
- Password: `admin123`
- Can verify agents and manage platform

**Agent Account:**
- Email: `agent@k-hostel.com` 
- Password: `admin123`
- Can list hostels and manage bookings

**Student Account:**
- Email: `student@k-hostel.com`
- Password: `admin123`
- Can browse hostels and book inspections

## ✅ **What You Get**

- 🏠 **4 Sample hostels** in KWASU areas
- 🏫 **12 Nigerian universities** pre-loaded
- 📍 **30+ hostel areas** with coordinates
- 🔐 **Real authentication** system
- 📱 **Mobile & desktop** optimized
- 🎨 **Beautiful black & white** design

## 🎊 **That's It!**

Your k-H platform is now fully functional with:
- Real user registration and login
- Hostel browsing and booking
- Agent verification system
- Admin management tools

**Visit `http://localhost:3000` and start using your Nigerian student hostel platform!** 🚀