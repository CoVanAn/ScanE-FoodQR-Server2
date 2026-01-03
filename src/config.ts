// src/config.ts
import { z } from 'zod'

const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DOMAIN: z.string().default('localhost'),
  PROTOCOL: z.string().default('http'),
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('1h'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('100d'),
  GUEST_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  GUEST_REFRESH_TOKEN_EXPIRES_IN: z.string().default('12h'),
  
  // Cloudinary config
  CLOUDINARY_URL: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_FOLDER: z.string().default('foodqr'),
  
  // UPLOAD_FOLDER: z.string().default('uploads'), // Removed for cloud-only storage
  INITIAL_EMAIL_OWNER: z.string().default('admin@order.com'),
  INITIAL_PASSWORD_OWNER: z.string().default('123456'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  GOOGLE_REDIRECT_CLIENT_URL: z.string().default('http://localhost:3000/auth/oauth'),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_AUTHORIZE_REDIRECT_URL: z.string().default('http://localhost:4000/auth/login/google')
})

const configProject = configSchema.safeParse({
  PORT: process.env.PORT,
  DOMAIN: process.env.DOMAIN,
  PROTOCOL: process.env.PROTOCOL,
  DATABASE_URL: process.env.DATABASE_URL,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
  GUEST_ACCESS_TOKEN_EXPIRES_IN: process.env.GUEST_ACCESS_TOKEN_EXPIRES_IN,
  GUEST_REFRESH_TOKEN_EXPIRES_IN: process.env.GUEST_REFRESH_TOKEN_EXPIRES_IN,
  
  // Cloudinary
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER,
  
  // UPLOAD_FOLDER: process.env.UPLOAD_FOLDER, // Removed for cloud-only storage
  INITIAL_EMAIL_OWNER: process.env.INITIAL_EMAIL_OWNER,
  INITIAL_PASSWORD_OWNER: process.env.INITIAL_PASSWORD_OWNER,
  CLIENT_URL: process.env.CLIENT_URL,
  GOOGLE_REDIRECT_CLIENT_URL: process.env.GOOGLE_REDIRECT_CLIENT_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_AUTHORIZE_REDIRECT_URL: process.env.GOOGLE_AUTHORIZE_REDIRECT_URL
})

if (!configProject.success) {
  console.error(configProject.error.issues)
  throw new Error('Các biến môi trường không hợp lệ')
}

const envConfig = configProject.data
export default envConfig

// Build API_URL safely: omit port when using standard 80/443 to avoid invalid hostnames in redirects (VNPay return URL)
const portSegment = envConfig.PORT && ![80, 443].includes(envConfig.PORT) ? `:${envConfig.PORT}` : ''
export const API_URL = `${envConfig.PROTOCOL}://${envConfig.DOMAIN}${portSegment}`