import { createDish, deleteDish, getDishesByCategory, getDishDetail, getDishList, getFeaturedDishes, updateDish, updateDishFeatured } from '@/controllers/dish.controller'
import { requireLoginedHook } from '@/hooks/auth.hooks'
import {
  CreateDishBody,
  CreateDishBodyType,
  DishByCategoryParams,
  DishByCategoryParamsType,
  DishListRes,
  DishListResType,
  DishParams,
  DishParamsType,
  DishRes,
  DishResType,
  UpdateDishBody,
  UpdateDishBodyType
} from '@/schemaValidations/dish.schema'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function dishRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get<{
    Querystring: {
      page?: string
      limit?: string
      categoryId?: string
    }
    Reply: DishListResType
  }>(
    '/',
    {
      schema: {
        response: {
          200: DishListRes
        }
      }
    },
    async (request, reply) => {
      const { page, limit, categoryId } = request.query
      const options = {
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined
      }
      
      const result = await getDishList(options)
      reply.send({
        data: result.data as DishListResType['data'],
        message: 'Lấy danh sách món ăn thành công!',
        pagination: result.pagination
      })
    }
  )

  // Get featured dishes for public display
  fastify.get<{
    Reply: DishListResType
  }>(
    '/featured',
    {
      schema: {
        response: {
          200: DishListRes
        }
      }
    },
    async (request, reply) => {
      const featuredDishes = await getFeaturedDishes()
      reply.send({
        data: featuredDishes as DishListResType['data'],
        message: 'Lấy danh sách món ăn nổi bật thành công!'
      })
    }
  )

  fastify.get<{
    Params: DishParamsType
    Reply: DishResType
  }>(
    '/:id',
    {
      schema: {
        params: DishParams,
        response: {
          200: DishRes
        }
      }
    },
    async (request, reply) => {
      const dish = await getDishDetail(request.params.id)
      reply.send({
        data: dish as DishResType['data'],
        message: 'Lấy thông tin món ăn thành công!'
      })
    }
  )

  fastify.post<{
    Body: CreateDishBodyType
    Reply: DishResType
  }>(
    '',
    {
      schema: {
        body: CreateDishBody,
        response: {
          200: DishRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook])
    },
    async (request, reply) => {
      const dish = await createDish(request.body)
      reply.send({
        data: dish as DishResType['data'],
        message: 'Tạo món ăn thành công!'
      })
    }
  )

  fastify.put<{
    Params: DishParamsType
    Body: UpdateDishBodyType
    Reply: DishResType
  }>(
    '/:id',
    {
      schema: {
        params: DishParams,
        body: UpdateDishBody,
        response: {
          200: DishRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook])
    },
    async (request, reply) => {
      const dish = await updateDish(request.params.id, request.body)
      reply.send({
        data: dish as DishResType['data'],
        message: 'Cập nhật món ăn thành công!'
      })
    }
  )

  fastify.delete<{
    Params: DishParamsType
    Reply: DishResType
  }>(
    '/:id',
    {
      schema: {
        params: DishParams,
        response: {
          200: DishRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook])
    },
    async (request, reply) => {
      const result = await deleteDish(request.params.id)
      reply.send({
        message: 'Xóa món ăn thành công!',
        data: result as DishResType['data']
      })
    }
  )
  
  fastify.get<{
    Params: DishByCategoryParamsType
    Reply: DishListResType
  }>(
    '/by-category/:categoryId',
    {
      schema: {
        params: DishByCategoryParams,
        response: {
          200: DishListRes
        }
      }
    },
    async (request, reply) => {
      const dishes = await getDishesByCategory(request.params.categoryId)
      reply.send({
        data: dishes as DishListResType['data'],
        message: `Lấy danh sách món ăn theo loại hàng thành công!`
      })
    }
  )
}
