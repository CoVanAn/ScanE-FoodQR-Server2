import prisma from '@/database'
import { DashboardIndicatorQueryParamsType } from "@/schemaValidations/indicator.schema";
import { format } from "date-fns";
// import viLocale from "date-fns/locale/vi";
import { vi } from "date-fns/locale";

export const DashboardIndicatorController = async (query: DashboardIndicatorQueryParamsType) => {
    const { fromDate, toDate } = query;

    // Lấy tất cả các orders trong khoảng thời gian và đã hoàn thành
    const completedOrders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: fromDate,
                lte: toDate,
            },
            payment: "paid"
        },
        include: {
            dishSnapshot: true
        }
    });

    const revenue = completedOrders.reduce((sum, order) => {
        return sum + order.dishSnapshot.price * order.quantity;
    }, 0);

    const guestCount = await prisma.guest.count({
        where: {
            createdAt: {
                gte: fromDate,
                lte: toDate
            }
        }
    });

    const orderCount = completedOrders.length;

    const servingTableCount = await prisma.table.count({
        where: {
            status: "Available"
        }
    });

    // // Tính số lượng món ăn được đặt thành công
    // const dishMap = new Map<number, {
    //     id: number;
    //     name: string;
    //     price: number;
    //     description: string;
    //     image: string;
    //     status: string;
    //     createdAt: Date;
    //     updatedAt: Date;
    //     successOrders: number;
    // }>();

    // completedOrders.forEach(order => {
    //     const dish = order.dishSnapshot;
    //     if (!dish) return;

    //     if (!dishMap.has(dish.id)) {
    //         dishMap.set(dish.id, {
    //             id: dish.id!,
    //             name: dish.name,
    //             price: dish.price,
    //             description: dish.description,
    //             image: dish.image,
    //             status: dish.status,
    //             createdAt: dish.createdAt,
    //             updatedAt: dish.updatedAt,
    //             successOrders: order.quantity
    //         });
    //     } else {
    //         const existing = dishMap.get(dish.id)!;
    //         existing.successOrders += order.quantity;
    //     }
    // });

    // const dishIndicator = Array.from(dishMap.values());
    // Tính số lượng món ăn được đặt thành công
const dishMap = new Map<number, {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
    status: string;
    categoryId: number;
    createdAt: Date;
    updatedAt: Date;
    successOrders: number;
}>();

completedOrders.forEach(order => {
    const dishSnapshot = order.dishSnapshot;
    if (!dishSnapshot || !dishSnapshot.dishId) return; // dishId mới là id gốc

    const dishId = dishSnapshot.dishId; // dùng dishId, không dùng snapshot id
    if (!dishMap.has(dishId)) {
        dishMap.set(dishId, {
            id: dishId,
            name: dishSnapshot.name,
            price: dishSnapshot.price,
            description: dishSnapshot.description,
            image: dishSnapshot.image,
            categoryId: null as any, // Chưa có categoryId trong snapshot
            status: dishSnapshot.status,
            createdAt: dishSnapshot.createdAt,
            updatedAt: dishSnapshot.updatedAt,
            successOrders: order.quantity
        });
    } else {
        const existing = dishMap.get(dishId)!;
        existing.successOrders += order.quantity;
    }
});

const dishIndicator = Array.from(dishMap.values());


    // Tính doanh thu theo ngày
    const dateMap: Record<string, number> = {};
    const current = new Date(fromDate);
    while (current <= toDate) {
        const formatted = format(current, "yyyy-MM-dd", { locale: vi });
        dateMap[formatted] = 0;
        current.setDate(current.getDate() + 1);
    }

    completedOrders.forEach(order => {
        const dateStr = format(order.createdAt, "yyyy-MM-dd", { locale: vi });
        if (dateMap[dateStr] !== undefined) {
            dateMap[dateStr] += order.dishSnapshot.price * order.quantity;
        }
    });

    const revenueByDate = Object.entries(dateMap).map(([date, revenue]) => ({
        date,
        revenue
    }));

    return {
        revenue,
        guestCount,
        orderCount,
        servingTableCount,
        dishIndicator,
        revenueByDate
    };
};
