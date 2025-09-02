# 🚀 k-H Supabase Integration Guide

## ✨ **One-Click Supabase Setup**

The k-H platform is designed to work seamlessly with **just your Supabase credentials**. No manual PostgreSQL setup required!

## 🔑 **What You Need**

### **Step 1: Get Your Supabase Credentials**

1. **Go to [supabase.com](https://supabase.com)** and create/login to your account
2. **Create a new project** or select existing one
3. **Get your credentials** from the dashboard:

#### **From Settings → API:**
- **Project URL** (looks like: `https://abcdefgh.supabase.co`)
- **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

#### **From Settings → Database → Connection string:**
- **Direct connection** PostgreSQL URL
- **Important**: Copy the full URL and replace `[YOUR-PASSWORD]` with your actual database password

### **Step 2: Configure Environment Variables**

Create `.env.local` file in your project root:

```env
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration (Required)
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres

# Authentication (Required)
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional Features
GOOGLE_MAPS_API_KEY=your-google-maps-key
SENDGRID_API_KEY=your-sendgrid-key
```

## 🗄️ **Automatic Database Setup**

### **Step 3: Initialize Your Database**

```bash
# Install dependencies
npm install

# Push database schema to Supabase
npm run db:push

# Seed initial data (schools, locations, admin user)
curl -X POST http://localhost:3000/api/seed
```

### **What Gets Created Automatically:**

✅ **Users Table** - Students, agents, admins with authentication  
✅ **Schools Table** - Nigerian universities (KWASU, UI, OAU, etc.)  
✅ **Locations Table** - Hostel areas (Westend, Safari, Chapel Road)  
✅ **Hostels Table** - Property listings with pricing and amenities  
✅ **Bookings Table** - Inspection scheduling system  

## 🎯 **Features That Work Automatically**

### **🔐 Authentication System**
- **User Registration** with role selection (Student/Agent/Admin)
- **Login/Logout** with secure sessions
- **Password Hashing** with bcryptjs
- **Role-based Access** control
- **CAC Verification** for agents

### **🏠 Hostel Management**
- **Browse Hostels** with search and filters
- **Create Listings** (verified agents only)
- **Booking System** for inspection scheduling
- **Location-based Search** by university areas

### **📊 Dashboard Features**
- **Student Dashboard** - View bookings, browse hostels
- **Agent Dashboard** - Manage listings, handle booking requests
- **Admin Dashboard** - Verify agents, oversee platform

### **🗺️ Location Integration**
- **Pre-loaded Universities**: KWASU, UNILORIN, OAU, UI, UNN, UNIBEN
- **Hostel Areas**: Westend, Safari, Chapel Road (for KWASU)
- **Google Maps Ready** (add your API key)

## 🚀 **Quick Start**

### **Development Mode:**
```bash
npm run dev
```
Visit: `http://localhost:3000`

### **Production Deployment:**
```bash
npm run build
npm start
```

## 🎨 **What You Get**

### **Beautiful Black & White Design**
- ✅ **Pure monochrome theme** - no colors, just elegant black and white
- ✅ **Mobile responsive** - works perfectly on all devices
- ✅ **Modern animations** - smooth hover effects and transitions
- ✅ **Professional UI** - clean, minimalist design

### **Complete Functionality**
- ✅ **Real authentication** - not mocks
- ✅ **Database operations** - actual CRUD with Supabase
- ✅ **Role-based access** - students, agents, admins
- ✅ **Booking system** - real inspection scheduling
- ✅ **Agent verification** - CAC number validation

## 🔧 **Admin Access**

**Default Admin Account** (created automatically):
- **Email**: `admin@k-hostel.com`
- **Password**: `admin123`
- **Role**: Admin (can verify agents)

## 📱 **Mobile & Desktop Optimized**

### **Mobile Features:**
- ✅ **Touch-friendly** buttons and interactions
- ✅ **Responsive navigation** with mobile menu
- ✅ **Optimized forms** for mobile input
- ✅ **Swipe gestures** support

### **Desktop Features:**
- ✅ **Multi-column layouts** for efficient browsing
- ✅ **Hover effects** and animations
- ✅ **Keyboard navigation** support
- ✅ **Large screen optimization**

## 🎯 **User Flows**

### **For Students:**
1. Register → Choose university → Browse hostels → Book inspection → Manage bookings

### **For Agents:**
1. Register → Provide CAC number → Wait for verification → List hostels → Manage requests

### **For Admins:**
1. Login → Verify pending agents → Oversee platform operations

## 🌐 **Deployment Options**

### **Vercel (Recommended):**
1. Connect GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### **Other Platforms:**
- **Netlify**: Works with Next.js
- **Railway**: Auto-deployment from GitHub
- **AWS/GCP/Azure**: Standard Next.js deployment

## 🔒 **Security Features**

- ✅ **Password Hashing** with bcryptjs (12 rounds)
- ✅ **JWT Sessions** with NextAuth.js
- ✅ **CSRF Protection** built-in
- ✅ **Role-based Authorization** on all routes
- ✅ **Input Validation** with Zod schemas
- ✅ **SQL Injection Protection** with Drizzle ORM

## 🎊 **Result**

**Just provide your Supabase URL and keys**, and you get:
- ✅ **Complete hostel booking platform**
- ✅ **Beautiful black and white design**
- ✅ **Mobile and desktop optimized**
- ✅ **Real authentication and database**
- ✅ **Ready for Nigerian universities**

**No manual PostgreSQL setup needed - everything works automatically with Supabase!** 🚀