// src/utils/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import envConfig from '@/config';

console.log('🔧 Cloudinary config loaded:', {
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
  folder: envConfig.CLOUDINARY_FOLDER
});

cloudinary.config({
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
  api_key: envConfig.CLOUDINARY_API_KEY,
  api_secret: envConfig.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = 'dishes',
  transformation?: any
) => {
  console.log('📤 Starting Cloudinary upload to folder:', `${envConfig.CLOUDINARY_FOLDER}/${folder}`);
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${envConfig.CLOUDINARY_FOLDER}/${folder}`,
        transformation: transformation || [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ],
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary error:', error.message);
          console.error('❌ Full Cloudinary error:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary success:', result?.secure_url);
          resolve(result);
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;