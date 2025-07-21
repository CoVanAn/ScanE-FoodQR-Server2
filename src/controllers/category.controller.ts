import prisma from '@/database'
import { CreateCategoryBodyType, UpdateCategoryBodyType } from '@/schemaValidations/category.schema'
import { EntityError, isPrismaClientKnownRequestError } from '@/utils/errors'

export const getCategoryList = () => {
  return prisma.category.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      _count: {
        select: {
          dishes: true
        }
      }
    }
  })
}

export const getCategoryDetail = (id: number) => {
  return prisma.category.findUniqueOrThrow({
    where: {
      id
    },
    include: {
      dishes: {
        include: {
          category: true
        }
      }
    }
  })
}

export const createCategory = async (data: CreateCategoryBodyType) => {
  try {
    const category = await prisma.category.create({
      data: {
        name: data.name
      }
    })
    return category
  } catch (error) {
    if (isPrismaClientKnownRequestError(error) && error.code === 'P2002') {
      throw new EntityError([
        {
          message: 'Tên danh mục này đã tồn tại',
          field: 'name'
        }
      ])
    }
    throw error
  }
}

export const updateCategory = async (id: number, data: UpdateCategoryBodyType) => {
  try {
    const category = await prisma.category.update({
      where: {
        id
      },
      data
    })
    return category
  } catch (error) {
    if (isPrismaClientKnownRequestError(error) && error.code === 'P2002') {
      throw new EntityError([
        {
          message: 'Tên danh mục này đã tồn tại',
          field: 'name'
        }
      ])
    }
    throw error
  }
}

export const deleteCategory = async (id: number) => {
  try {
    // Kiểm tra xem danh mục có món ăn không
    const category = await prisma.category.findUnique({
      where: { id },
      include: { dishes: true }
    })

    if (category?.dishes.length) {
      throw new EntityError([
        {
          message: 'Không thể xóa danh mục có chứa món ăn',
          field: 'id'
        }
      ])
    }

    return await prisma.category.delete({
      where: {
        id
      }
    })
  } catch (error) {
    if (isPrismaClientKnownRequestError(error)) {
      throw error
    }
    throw error
  }
}
