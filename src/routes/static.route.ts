import envConfig from '@/config'
import fastifyStatic from '@fastify/static'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import path from 'path'

// NOTE: This route is disabled for cloud-only storage
export default async function staticRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // fastify.register(fastifyStatic, {
  //   root: path.resolve(envConfig.UPLOAD_FOLDER)
  // })
  // fastify.get<{
  //   Params: {
  //     id: string
  //   }
  // }>('/static/:id', async (request, reply) => {
  //   return reply.sendFile(request.params.id)
  // })
}
