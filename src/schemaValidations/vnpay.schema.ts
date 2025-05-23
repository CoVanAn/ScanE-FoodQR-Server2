import { z } from 'zod';

// Schema cơ bản cho request tạo URL thanh toán
export const CreatePaymentBody = z.object({
  amount: z.number().positive(),
  orderInfo: z.string().optional(),
  orderIds: z.array(z.number()).optional(), // Thêm trường orderIds để lưu danh sách ID của các đơn hàng
});

export type CreatePaymentBodyType = z.infer<typeof CreatePaymentBody>;