import { DishStatusValues } from '@/constants/type'
import z from 'zod'

export const CreateDishBody = z.object({
  name: z.string().min(1).max(256),
  price: z.coerce.number().positive(),
  description: z.string().max(10000),
  image: z.string().url().optional(),
  status: z.enum(DishStatusValues).optional(),
  categoryId: z.number().nullable().optional()
})

export type CreateDishBodyType = z.TypeOf<typeof CreateDishBody>

export const CategorySchemaForDish = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const DishSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.coerce.number(),
  description: z.string(),
  image: z.string(),
  status: z.enum(DishStatusValues),
  categoryId: z.number().nullable(),
  category: CategorySchemaForDish.nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const DishRes = z.object({
  data: DishSchema,
  message: z.string()
})

export type DishResType = z.TypeOf<typeof DishRes>

export const DishListRes = z.object({
  data: z.array(DishSchema),
  message: z.string()
})

export type DishListResType = z.TypeOf<typeof DishListRes>

export const DishByCategoryParams = z.object({
  categoryId: z.coerce.number()
})

export type DishByCategoryParamsType = z.TypeOf<typeof DishByCategoryParams>

export const UpdateDishBody = CreateDishBody
export type UpdateDishBodyType = CreateDishBodyType
export const DishParams = z.object({
  id: z.coerce.number()
})
export type DishParamsType = z.TypeOf<typeof DishParams>
