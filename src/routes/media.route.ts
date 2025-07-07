import { requireLoginedHook } from '@/hooks/auth.hooks'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import { uploadImage } from '@/controllers/media.controller'
import { UploadImageRes, UploadImageResType } from '@/schemaValidations/media.schema'

export default async function mediaRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // Không đăng ký multipart ở đây vì đã đăng ký ở index.ts
  fastify.addHook('preValidation', fastify.auth([requireLoginedHook]))

  fastify.post<{
    Reply: UploadImageResType
  }>(
    '/upload',
    {
      schema: {
        response: {
          200: UploadImageRes
        }
      }
    },
    async (request, reply) => {
      console.log('🔍 Route: Starting upload process...');
      
      // Gọi controller để xử lý upload
      const result = await uploadImage(request);
      
      return reply.send({ 
        message: 'Upload ảnh thành công', 
        data: result.url 
      });
    }
  )
}
