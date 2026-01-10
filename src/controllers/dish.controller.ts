import prisma from '@/database'
import { CreateDishBodyType, UpdateDishBodyType } from '@/schemaValidations/dish.schema'

export const getDishList = async (options?: {
  page?: number
  limit?: number
  categoryId?: number
}) => {
  const { page = 1, limit = 20, categoryId } = options || {}
  const skip = (page - 1) * limit

  const where = categoryId ? { categoryId } : {}

  const [dishes, total] = await Promise.all([
    prisma.dish.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },      // Featured dishes first
        { featuredOrder: 'asc' },    // Order by featured position
        { createdAt: 'desc' }        // Then by newest
      ],
      include: {
        category: true
      },
      skip,
      take: limit
    }),
    prisma.dish.count({ where })
  ])

  return {
    data: dishes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    }
  }
}

export const getDishDetail = (id: number) => {
  return prisma.dish.findUniqueOrThrow({
    where: {
      id
    },
    include: {
      category: true
    }
  })
}

export const createDish = (data: CreateDishBodyType) => {
  return prisma.dish.create({
    data: data as any
  })
}

export const updateDish = (id: number, data: UpdateDishBodyType) => {
  return prisma.dish.update({
    where: {
      id
    },
    data: data as any
  })
}

export const deleteDish = (id: number) => {
  return prisma.dish.delete({
    where: {
      id
    }
  })
}

export const getDishesByCategory = (categoryId: number) => {
  return prisma.dish.findMany({
    where: {
      categoryId
    },
    include: {
      category: true
    },
    orderBy: [
      { isFeatured: 'desc' },      // Featured dishes first
      { featuredOrder: 'asc' },    // Order by featured position
      { createdAt: 'desc' }        // Then by newest
    ]
  })
}

// Get only featured dishes for public display
export const getFeaturedDishes = () => {
  return prisma.dish.findMany({
    where: {
      isFeatured: true,
      status: 'Available'
    },
    orderBy: {
      featuredOrder: 'asc'
    },
    include: {
      category: true
    }
  })
}

// Update featured status and order
export const updateDishFeatured = (id: number, isFeatured: boolean, featuredOrder?: number | null) => {
  return prisma.dish.update({
    where: { id },
    data: {
      isFeatured,
      featuredOrder: isFeatured ? featuredOrder : null
    }
  })
}
