import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';
import { API_URL } from '@/config';
import prisma from '@/database';
import { OrderStatus, PaymentStatus, ManagerRoom } from '@/constants/type';
import { debugSocketRooms } from '@/utils/socket';

// Khởi tạo instance VNPay
const vnpay = new VNPay({
    tmnCode: '12R4XNX4',
    secureSecret: '7DEM3BUPSFOF60BUNOXAEI9RE8H356CC',
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
    
    // Format thời gian và ghi log để kiểm tra
    const createDate = dateFormat(new Date());
    const expireDate = dateFormat(tomorrow);
    
    // Tạo URL thanh toán
    const vnpayResponse = await vnpay.buildPaymentUrl({
        vnp_Amount: amount * 100, // VNPay yêu cầu số tiền * 100
        vnp_IpAddr: ipAddr,
        vnp_TxnRef: vnp_TxnRef,
        vnp_OrderInfo: encodedOrderInfo,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: `${API_URL}/vnpay/check-payment`,
        vnp_Locale: VnpLocale.VN,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
    });

    return {
        paymentUrl: vnpayResponse,
        transactionId: vnp_TxnRef
    };
};

// Xử lý callback sau khi thanh toán
export const handlePaymentCallback = async (params: any, io?: any) => {
    // Ghi log để kiểm tra io đã được truyền đúng chưa
    console.log('VNPay Callback - IO instance received:', io ? 'Yes' : 'No');
    
    // Kiểm tra tính hợp lệ của callback
    const isValidCallback = vnpay.verifyReturnUrl(params);
    
    // Nếu thanh toán thành công
    if (isValidCallback && params.vnp_ResponseCode === '00') {
        try {            // Giải mã orderInfo để lấy ra orderIds
            const orderInfo = params.vnp_OrderInfo || '';
            console.log('Received VNPay orderInfo:', orderInfo);
            const parts = orderInfo.split('|');
            if (parts.length >= 2) {
                const orderIdsString = parts[parts.length - 1];
                let orderIds: number[] = [];
                
                try {
                    orderIds = JSON.parse(orderIdsString);
                    console.log('Successfully parsed orderIds:', orderIds);
                } catch (e) {
                    console.error('Failed to parse orderIds from orderInfo:', e);
                    console.error('Original string:', orderIdsString);
                    return {
                        isValid: false,
                        error: 'Invalid order IDs format',
                        data: params
                    };
                }
                
                if (orderIds.length > 0) {
                    // Cập nhật trạng thái thanh toán của các đơn hàng thành "paid"
                    await prisma.order.updateMany({
                        where: {
                            id: {
                                in: orderIds
                            }
                        },
                        data: {
                            payment: PaymentStatus.Paid
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

                    // Lấy thông tin socket của guest để emit sự kiện
                    const guests = updatedOrders.map(order => order.guestId).filter(Boolean);
                    if (guests.length > 0) {
                        const socketRecords = await prisma.socket.findMany({
                            where: {
                                guestId: {
                                    in: guests as number[]
                                }
                            }
                        });                        // Emit socket event về ManagerRoom để cập nhật real-time ở view của manager
                        if (io && updatedOrders.length > 0) {
                            try {
                                const socketIds = socketRecords.map(record => record.socketId).filter(Boolean);
                                
                                // Kiểm tra trạng thái hiện tại của socket rooms
                                await debugSocketRooms(io);
                                
                                // Gửi thông báo đến tất cả manager
                                console.log('Emitting payment update to ManagerRoom:', { 
                                    totalUpdatedOrders: updatedOrders.length,
                                    orderIds: updatedOrders.map(order => order.id),
                                    room: ManagerRoom
                                });
                                
                                // Đảm bảo cập nhật được gửi đến toàn bộ phòng manager
                                io.to(ManagerRoom).emit('payment', updatedOrders);
                                
                                // Đồng thời gửi sự kiện update-order để tương thích với các client đang lắng nghe sự kiện này
                                io.to(ManagerRoom).emit('update-order', updatedOrders[0]);
                                
                                // Gửi thông báo đến các guest liên quan
                                console.log('Emitting to guest socket IDs:', socketIds);
                                socketIds.forEach(socketId => {
                                    if (socketId) {
                                        io.to(socketId).emit('payment', updatedOrders);
                                    }
                                });
                            } catch (error) {
                                console.error('Error emitting socket events:', error);
                            }
                        } else {
                            console.log('Socket emission skipped:', { 
                                hasIoInstance: !!io, 
                                ordersCount: updatedOrders.length 
                            });
                        }
                    }
                    
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