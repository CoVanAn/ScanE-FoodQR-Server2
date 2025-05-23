import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';
import { API_URL } from '@/config';
import prisma from '@/database';
import { OrderStatus } from '@/constants/type';

// Khởi tạo instance VNPay
const vnpay = new VNPay({
    tmnCode: 'WGIYWTTJ',
    secureSecret: '9LW9WT2MFZSWV7ZGMA8NPO3WY0BLX4ED',
    vnpayHost: 'https://sandbox.vnpayment.vn',
    testMode: true,
    hashAlgorithm: 'SHA512' as any,
    loggerFn: ignoreLogger,
});

// Tạo URL thanh toán VNPay
export const createPaymentUrl = async (amount: number, ipAddr: string, orderInfo: string = 'Thanh toán đơn hàng', orderIds: number[] = []) => {
    // Tạo mã giao dịch duy nhất
    const vnp_TxnRef = Date.now().toString();
    
    // Ngày hết hạn thanh toán (1 ngày sau)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Mã hóa orderIds vào orderInfo để có thể truy xuất khi callback
    const encodedOrderInfo = orderInfo + '|' + JSON.stringify(orderIds);
      // Tạo URL thanh toán
    const vnpayResponse = await vnpay.buildPaymentUrl({
        vnp_Amount: amount * 100, // VNPay yêu cầu số tiền * 100
        vnp_IpAddr: ipAddr,
        vnp_TxnRef: vnp_TxnRef,
        vnp_OrderInfo: encodedOrderInfo,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: `${API_URL}/vnpay/check-payment`,
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(tomorrow),
    });

    return {
        paymentUrl: vnpayResponse,
        transactionId: vnp_TxnRef
    };
};

// Xử lý callback sau khi thanh toán
export const handlePaymentCallback = async (params: any) => {
    // Kiểm tra tính hợp lệ của callback
    const isValidCallback = vnpay.verifyReturnUrl(params);
    
    // Nếu thanh toán thành công
    if (isValidCallback && params.vnp_ResponseCode === '00') {
        try {
            // Giải mã orderInfo để lấy ra orderIds
            const orderInfo = params.vnp_OrderInfo || '';
            const parts = orderInfo.split('|');
            if (parts.length >= 2) {
                const orderIdsString = parts[parts.length - 1];
                let orderIds: number[] = [];
                
                try {
                    orderIds = JSON.parse(orderIdsString);
                } catch (e) {
                    console.error('Failed to parse orderIds from orderInfo:', e);
                }
                
                if (orderIds.length > 0) {
                    // Cập nhật trạng thái của các đơn hàng thành "Paid"
                    await prisma.order.updateMany({
                        where: {
                            id: {
                                in: orderIds
                            }
                        },
                        data: {
                            status: OrderStatus.Paid
                        }
                    });
                    
                    // Lấy thông tin chi tiết của các đơn hàng đã thanh toán
                    const updatedOrders = await prisma.order.findMany({
                        where: {
                            id: {
                                in: orderIds
                            }
                        },
                        include: {
                            dishSnapshot: true,
                            guest: true
                        }
                    });
                    
                    return {
                        isValid: true,
                        data: params,
                        orders: updatedOrders
                    };
                }
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    }
    
    // Trả về kết quả
    return {
        isValid: isValidCallback,
        data: params
    };
};