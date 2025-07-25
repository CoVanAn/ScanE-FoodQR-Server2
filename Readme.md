# 🍜 ScanE-FoodQR - Server API

> **Backend API cho hệ thống QR Order Online** - Fastify + PostgreSQL + Socket.io

## 📋 Tổng quan

**ScanE-FoodQR Server** là backend API mạnh mẽ hỗ trợ hệ thống đặt món ăn bằng QR Code. Được xây dựng với Fastify để đảm bảo hiệu suất cao, tích hợp PostgreSQL cho dữ liệu và Socket.io cho real-time updates.

## 🎯 Phạm vi ứng dụng

API phục vụ các nhà hàng, quán ăn, quán cà phê với quy mô nhỏ và vừa, cung cấp đầy đủ tính năng quản lý và xử lý đơn hàng online.

## ✨ Tính năng chính

### 🏢 Quản lý nhà hàng
- **👥 Quản lý tài khoản** - Owner, Employee với JWT authentication
- **🏷️ Quản lý danh mục** - CRUD categories với validation
- **🍽️ Quản lý món ăn** - CRUD dishes với upload hình ảnh
- **🪑 Quản lý bàn** - QR code generation và trạng thái bàn
- **📊 Dashboard** - Thống kê doanh thu, đơn hàng real-time

### 📱 Xử lý đơn hàng
- **📱 QR Authentication** - Tự động tạo guest session
- **🛒 Order Processing** - Xử lý đơn hàng với validation
- **💳 VNPay Integration** - Thanh toán online an toàn
- **🔔 Real-time Updates** - Socket.io notifications

### 🔧 Tính năng kỹ thuật
- **🔐 JWT Security** - Access/Refresh tokens
- **🌐 Socket.io** - Real-time communication
- **☁️ Cloudinary** - Image upload management
- **📊 Analytics** - Dashboard statistics
- **🛡️ Validation** - Zod schema validation

## 🛠️ Công nghệ sử dụng

### Core Framework
- **Fastify 4.28** - High performance web framework
- **TypeScript** - Type safety và developer experience
- **Prisma 5.16** - Next-generation ORM
- **PostgreSQL** - Robust relational database

### Authentication & Security
- **JSON Web Tokens** - Secure authentication
- **bcrypt** - Password hashing
- **@fastify/helmet** - Security headers
- **@fastify/cors** - Cross-origin requests

### Real-time & Storage
- **Socket.io** - Real-time communication
- **Cloudinary** - Image management
- **VNPay SDK** - Payment integration

## 📁 Cấu trúc thư mục

```
src/
├── controllers/         # Business logic controllers
├── routes/             # API route definitions
├── plugins/            # Fastify plugins (auth, socket, validation)
├── schemaValidations/  # Zod validation schemas
├── utils/              # Utilities (jwt, cloudinary, crypto)
├── types/              # TypeScript type definitions
├── constants/          # App constants
├── database/           # Database connection
├── config.ts           # Environment configuration
└── index.ts            # Application entry point
```

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+
- PostgreSQL 15+
- npm hoặc yarn

### Cài đặt
```bash
# Clone repository
git clone <repository-url>
cd Server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Cấu hình môi trường (.env)
```env
# Server
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/foodqr

# JWT
ACCESS_TOKEN_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client
CLIENT_URL=http://localhost:3000

# Initial Owner Account
INITIAL_EMAIL_OWNER=gmailcuaban.com
INITIAL_PASSWORD_OWNER=matkhaucuaban
```

### Chạy ứng dụng
```bash
# Setup database
npx prisma migrate dev

# Development
npm run dev

# Production
npm run build
npm start
```

API sẽ chạy tại: `http://localhost:4000`

## 📊 Database Schema

### Tables chính
- **Account** - Quản lý người dùng (Owner, Employee)
- **Guest** - Khách hàng tạm thời
- **Category** - Danh mục món ăn
- **Dish** - Món ăn với thông tin chi tiết
- **Table** - Bàn ăn với QR code
- **Order** - Đơn hàng

## 🔌 API Endpoints

### Authentication
```
POST   /auth/login              # Owner/Employee login
POST   /auth/refresh-token      # Refresh access token
POST   /auth/logout             # Logout
```

### Management
```
GET    /accounts               # Account management
GET    /dishes                 # Dish management
GET    /categories             # Category management
GET    /tables                 # Table management
GET    /orders                 # Order management
```

### Guest Operations
```
POST   /guest/auth/login       # Guest login via QR
POST   /guest/orders           # Create guest order
```

### Analytics & Media
```
GET    /indicators/dashboard   # Dashboard statistics
POST   /media/upload           # Upload images
```

### Payment
```
POST   /vnpay/create-payment-url # Create VNPay payment
GET    /vnpay/check-payment    # Payment callback
```

## 🔄 Real-time Features

### Socket.io Events
```typescript
// Server → Client
'new-order'              # New order created
'order-status-changed'   # Order status updated
'payment-success'        # Payment completed

// Client → Server
'join-manager-room'      # Join management dashboard
'join-guest-room'        # Join guest session
```

## 🚀 Deployment

### Production Environment
```env
NODE_ENV=production
DATABASE_URL=postgresql://production_url
DOMAIN=your-api.onrender.com
PROTOCOL=https
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

## 🔧 Scripts có sẵn

```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # ESLint checking
npx prisma studio    # Database GUI
npx prisma migrate   # Database migrations
```

## 🧪 API Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": {},
  "statusCode": 200
}
```

### Error Response
```json
{
  "message": "Error message",
  "error": {
    "name": "ValidationError",
    "details": {}
  },
  "statusCode": 400
}
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Team

- **Developer**: CoVanAn
- **Project**: ScanE-FoodQR System

## Tài khoản mặc định

**Admin**: admin@order.com - mật khẩu không public
