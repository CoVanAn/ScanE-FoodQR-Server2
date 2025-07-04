// src/controllers/media.controller.ts
import { uploadToCloudinary } from '@/utils/cloudinary';
import { FastifyRequest } from 'fastify';

export const uploadImage = async (request: FastifyRequest) => {
  try {
    console.log('🔍 Starting file upload...');
    
    const data = await request.file();
    console.log('📁 File received:', data ? 'Yes' : 'No');
    
    if (!data) {
      throw new Error('Không có file nào được upload');
    }

    console.log('📄 File info:', {
      filename: data.filename,
      mimetype: data.mimetype,
      size: data.file.bytesRead || 'unknown'
    });

    // Kiểm tra loại file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(data.mimetype)) {
      throw new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)');
    }

    console.log('🔄 Converting to buffer...');
    const fileBuffer = await data.toBuffer();
    console.log('📊 Buffer size:', fileBuffer.length, 'bytes');
    
    console.log('☁️ Uploading to Cloudinary...');
    const uploadResult = await uploadToCloudinary(fileBuffer, 'dishes') as any;
    console.log('✅ Upload successful:', uploadResult.secure_url);
    
    return {
      name: uploadResult.public_id,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      size: uploadResult.bytes
    };
  } catch (error: any) {
    console.error('❌ Upload error:', error.message);
    console.error('❌ Full error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};