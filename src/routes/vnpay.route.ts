import { createPaymentUrl, handlePaymentCallback } from '@/controllers/vnpay.controller';
import { CreatePaymentBody, CreatePaymentBodyType } from '@/schemaValidations/vnpay.schema';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function vnPay(fastify: FastifyInstance, options: FastifyPluginOptions) {
  // API để tạo URL thanh toán VNPay
  fastify.post<{
    Body: CreatePaymentBodyType
  }>(
    '/create-payment',
    {
      schema: {
        body: CreatePaymentBody
      }
    },
    async (request, reply) => {
      try {
        const { amount, orderInfo, orderIds = [] } = request.body;
        // Lấy địa chỉ IP của client
        const ipAddr = request.ip || '127.0.0.1';
        
        // Tạo URL thanh toán
        const result = await createPaymentUrl(amount, ipAddr, orderInfo, orderIds);
        
        reply.send({
          message: 'Tạo URL thanh toán thành công',
          data: result
        });
      } catch (error: any) {
        reply.code(400).send({
          message: error.message || 'Có lỗi xảy ra khi tạo URL thanh toán',
          error: error.toString()
        });
      }
    }
  );

  // API callback sau khi thanh toán VNPay
  fastify.get(
    '/check-payment',
    async (request, reply) => {
      try {
        // Xử lý callback từ VNPay
        const result = await handlePaymentCallback(request.query);
        
        // Log kết quả
        console.log('VNPay Payment Callback:', request.query);
        
        // Redirect về trang callback của frontend
        if (result.isValid && result.data.vnp_ResponseCode === '00') {
          // Thanh toán thành công
          return reply.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/guest/payment-callback?status=success&txnRef=${result.data.vnp_TxnRef}`);
        } else {
          // Thanh toán thất bại
          return reply.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/guest/payment-callback?status=failed&txnRef=${result.data.vnp_TxnRef}`);
        }
      } catch (error: any) {
        console.error('VNPay Payment Error:', error);
        return reply.redirect('/thanh-toan-that-bai');
      }
    }
  );
}
