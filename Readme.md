# Báo cáo kỹ thuật - Backend API ScanE

## 1. Giới thiệu

ScanE là dự án phát triển hệ thống quản lý và đặt món ăn cho nhà hàng thông qua mã QR. Backend API cung cấp các chức năng cốt lõi để hỗ trợ các tính năng của ứng dụng, bao gồm:

- **Xác thực người dùng**: Đăng nhập, Đăng ký, Đăng xuất
- **Quản lý tài khoản**: Xem và cập nhật thông tin cá nhân
- **Quản lý món ăn**: CRUD (Tạo, Đọc, Cập nhật, Xóa) các món ăn
- **Quản lý danh mục**: Phân loại và quản lý danh mục món ăn
- **Quản lý đơn hàng**: Theo dõi và xử lý đơn đặt hàng
- **Quản lý bàn**: Theo dõi trạng thái bàn trong nhà hàng
- **Upload media**: Tải lên và quản lý hình ảnh món ăn
- **Realtime updates**: Cập nhật trạng thái đơn hàng theo thời gian thực

## 2. Kiến trúc hệ thống và Công nghệ

### 2.1. Công nghệ sử dụng

Backend API của ScanE được xây dựng dựa trên các công nghệ hiện đại:

- **Node.js**: Môi trường runtime JavaScript phía máy chủ
- **TypeScript**: Ngôn ngữ lập trình tĩnh hóa JavaScript
- **Fastify**: Framework API hiệu năng cao cho Node.js
- **Prisma**: ORM hiện đại để tương tác với cơ sở dữ liệu
- **SQLite**: Hệ quản trị cơ sở dữ liệu nhẹ, không cần cài đặt server riêng
- **Socket.IO**: Thư viện hỗ trợ giao tiếp thời gian thực
- **JWT**: JSON Web Token cho hệ thống xác thực

### 2.2. Kiến trúc ứng dụng

Backend được thiết kế theo mô hình MVC (Model-View-Controller) với các thành phần chính:

- **Controllers**: Xử lý logic nghiệp vụ
- **Routes**: Định tuyến và điều hướng request
- **SchemaValidations**: Kiểm tra và xác thực dữ liệu đầu vào
- **Prisma Models**: Tương tác với cơ sở dữ liệu
- **Utils**: Các công cụ hỗ trợ phát triển

## 3. Cài đặt và Triển khai

### 3.1. Yêu cầu hệ thống

- Node.js (>= 18.x)
- npm hoặc yarn

### 3.2. Hướng dẫn cài đặt

1. Clone repository về máy local:
```bash
git clone <repository-url>
cd server
```

2. Cài đặt các dependencies:
```bash
npm install
```

3. Chạy ứng dụng ở môi trường phát triển:
```bash
npm run dev
```

### 3.3. Triển khai môi trường production

Để build và chạy ứng dụng ở môi trường production:

```bash
npm run build
npm run start
```

Muốn xem thông tin database, chỉ cần mở Prisma Studio lên bằng câu lệnh

```bash
npx prisma studio
```

Nó sẽ chạy ở url [http://localhost:5555](http://localhost:5555)

Trong source code có chứa file `.env` để config, trong file này bạn có thể đổi port cho API backend, mặc định là port `4000`

Khi upload thì hình ảnh sẽ được đi vào thư mục `/uploads` trong folder `server`

## Format response trả về

Định dạng trả về là JSON, và luôn có trường `message`, ngoài ra có thể sẽ có trường `data` hoặc `errors`

Đây là ví dụ về response trả về khi thành công

```json
{
  "data": {
    "id": 2,
    "name": "Iphone 11",
    "price": 20000000,
    "description": "Mô tả cho iphone 11",
    "image": "link ảnh (đang lưu trên cloudinary)",
    "createdAt": "2024-03-11T03:51:14.028Z",
    "updatedAt": "2024-03-11T03:51:14.028Z"
  },
  "message": "Tạo sản phẩm thành công!"
}
```

Trong trường hợp lỗi thì nếu lỗi liên quan đến việc body gửi lên không đúng định dạng thì server sẽ trả về lỗi `422` và thông tin lỗi như sau

Ví dụ dưới đây body thiếu trường `price`

```json
{
  "message": "A validation error occurred when validating the body...",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "number",
      "received": "undefined",
      "path": ["price"],
      "message": "Required",
      "field": "price"
    }
  ],
  "code": "FST_ERR_VALIDATION",
  "statusCode": 422
}
```

Trong trường hợp lỗi khác, server sẽ trả về lỗi trong trường `message`, ví dụ

```json
{
  "message": "Không tìm thấy dữ liệu!",
  "statusCode": 404
}
```

## Chi tiết các API

## 4. Cấu hình hệ thống

### 4.1. Cấu hình môi trường (.env)

File `.env` chứa các thiết lập quan trọng cho hệ thống:

```
# Server Configuration
PORT=4000                   # Port máy chủ API (mặc định: 4000)
API_HOST=http://localhost   # Host máy chủ API
NODE_ENV=development        # Môi trường (development/production)

# Authentication
JWT_SECRET=your_secret_key  # Key bí mật cho JWT
TOKEN_EXPIRE=3600           # Thời gian hết hạn token (giây)
REFRESH_TOKEN_EXPIRE=604800 # Thời gian hết hạn refresh token (giây)
COOKIE_MODE=false           # Chế độ xác thực sử dụng cookie (true/false)

# Database
DATABASE_URL=file:./dev.db  # URL kết nối cơ sở dữ liệu

# Upload Configuration
UPLOAD_DIR=uploads          # Thư mục lưu trữ file upload
MAX_FILE_SIZE=5242880       # Kích thước tối đa cho file upload (byte)
```

> Lưu ý: Nếu thiết lập `COOKIE_MODE=true` hệ thống sẽ sử dụng cookie cho xác thực thay vì JWT trong header.

### 4.2. Truy cập API

- API mặc định hoạt động tại địa chỉ: [http://localhost:4000](http://localhost:4000)
- Định dạng request:
  - APIs POST/PUT: Content-Type: application/json
  - APIs upload: Content-Type: multipart/form-data
- Xác thực: Gửi token qua header `Authorization: "Bearer <accessToken>"``

### Test API: muốn biết api có hoạt động không

- `GET /test`: Trả về message nghĩa là API hoạt động

### Các API cần realtime

- `POST /guest/orders`: Tạo order mới
## Tài khoản mặc định

Tài khoản admin: admin@order.com | 123456


