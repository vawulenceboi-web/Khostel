# 🏠 k-H - Nigerian Student Hostel Platform v2.1

A modern, fully functional platform for Nigerian students to find and book hostels around their universities. Built with **pure black and white design** and **seamless Supabase integration**.

## ✨ **Features**

### 🎓 **For Students**
- Browse verified hostels near universities
- Search by location, price, room type, and amenities
- Book inspection appointments instantly
- Manage bookings and track status
- Mobile-optimized interface

### 🏢 **For Agents/Owners**
- List hostels with photos and details
- Manage booking requests from students
- CAC business verification system
- Dashboard for property management
- Verified agent badge system

### 👨‍💼 **For Administrators**
- Verify agent accounts and CAC numbers
- Oversee platform operations
- Manage schools and locations
- Platform analytics and reporting

## 🚀 **Quick Setup (3 Steps)**

### **1. Get Supabase Credentials**
- Create account at [supabase.com](https://supabase.com)
- Create new project
- Get your **Project URL** and **Anon Key** from Settings → API
- Get your **Database URL** from Settings → Database

### **2. Configure Environment**
```bash
npm run setup  # Creates .env.local template
```

Edit `.env.local` with your credentials:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
NEXTAUTH_SECRET=your-random-secret
```

### **3. Initialize Database**
```bash
npm install
npm run db:push  # Creates all tables automatically
npm run dev      # Start development server
```

Visit `http://localhost:3000/api/seed` to add initial data (schools, locations, admin user).

## 🎨 **Design System**

### **Pure Black & White Theme**
- **No colors** - elegant monochrome design
- **High contrast** for excellent readability
- **Modern animations** and smooth transitions
- **Professional appearance** suitable for business use

### **Mobile & Desktop Responsive**
- **Mobile-first** design approach
- **Touch-friendly** interactions
- **Responsive navigation** and layouts
- **Optimized for all screen sizes**

## 🗄️ **Database Schema**

### **Automatic Table Creation**
The platform automatically creates these tables in your Supabase database:

- **👥 users** - Students, agents, admins with authentication
- **🏫 schools** - Nigerian universities (KWASU, UI, OAU, etc.)
- **📍 locations** - Hostel areas (Westend, Safari, Chapel Road)
- **🏠 hostels** - Property listings with pricing and amenities
- **📅 bookings** - Inspection scheduling system

### **Pre-loaded Data**
- **6 Nigerian Universities** ready to use
- **Sample hostel areas** for each university
- **Admin account** for platform management
- **Location coordinates** for Google Maps integration

## 🔐 **Authentication System**

### **Real User Registration**
- **Email/password** authentication
- **Role selection** during signup
- **CAC verification** for agents
- **Secure password hashing**

### **Role-based Access**
- **Students**: Browse hostels, book inspections
- **Agents**: List properties, manage requests (after verification)
- **Admins**: Verify agents, oversee platform

## 📱 **User Experience**

### **Student Journey**
1. **Register** → Choose university
2. **Browse** → Search hostels by area/price
3. **Book** → Schedule inspection instantly
4. **Manage** → Track booking status

### **Agent Journey**
1. **Register** → Provide CAC number
2. **Verify** → Wait for admin approval
3. **List** → Add hostel properties
4. **Manage** → Handle booking requests

## 🌐 **Deployment**

### **Vercel (One-Click)**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ksmo2nd/k-hostel)

### **Manual Deployment**
```bash
npm run build
npm start
```

## 🔧 **Development**

### **Local Development**
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run db:push   # Update database schema
npm run seed      # Add sample data
```

### **Environment Variables**
- **Required**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL`, `NEXTAUTH_SECRET`
- **Optional**: `GOOGLE_MAPS_API_KEY`, `SENDGRID_API_KEY`

## 🎯 **Built With**

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase PostgreSQL + Drizzle ORM
- **Authentication**: NextAuth.js with credentials
- **Styling**: Tailwind CSS with custom black/white theme
- **UI Components**: Radix UI primitives
- **TypeScript**: Full type safety
- **Mobile**: Responsive design for all devices

## 📊 **Key Benefits**

### **For Users**
- ✅ **Easy to use** - intuitive interface
- ✅ **Mobile optimized** - works on any device
- ✅ **Secure** - verified agents and secure authentication
- ✅ **Fast** - optimized performance

### **For Developers**
- ✅ **Simple setup** - just Supabase credentials needed
- ✅ **No manual DB setup** - everything automated
- ✅ **Type safe** - full TypeScript support
- ✅ **Modern stack** - latest technologies

## 🎊 **Result**

A **complete, production-ready Nigerian student hostel booking platform** that works out of the box with just your Supabase credentials!

---

**Made with ❤️ for Nigerian students**