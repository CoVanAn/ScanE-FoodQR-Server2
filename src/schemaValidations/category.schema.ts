import { DishSchema } from '@/schemaValidations/dish.schema'
import z from 'zod'

export const CreateCategoryBody = z.object({
  name: z.string().min(1).max(256)
})

export type CreateCategoryBodyType = z.TypeOf<typeof CreateCategoryBody>

export const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z.object({
    dishes: z.number()
  }).optional()
})

export const CategoryWithDishesSchema = CategorySchema.extend({
  dishes: z.array(DishSchema).optional()
})

export const CategoryRes = z.object({
  data: CategorySchema,
  message: z.string()
})

export type CategoryResType = z.TypeOf<typeof CategoryRes>

export const CategoryWithDishesRes = z.object({
  data: CategoryWithDishesSchema,
  message: z.string()
})

export type CategoryWithDishesResType = z.TypeOf<typeof CategoryWithDishesRes>

export const CategoryListRes = z.object({
  data: z.array(CategorySchema),
  message: z.string()
})

export type CategoryListResType = z.TypeOf<typeof CategoryListRes>

export const UpdateCategoryBody = CreateCategoryBody
export type UpdateCategoryBodyType = CreateCategoryBodyType

export const CategoryParams = z.object({
  id: z.coerce.number()
})
export type CategoryParamsType = z.TypeOf<typeof CategoryParams>
