import prisma from '@/database'
import { DashboardIndicatorQueryParamsType } from "@/schemaValidations/indicator.schema";
import { format } from "date-fns";
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

    const dishMap = new Map<number, {
        id: number;
        name: string;
        price: number;
        description: string;
        image: string;
        status: string;
        categoryId: number | null;
        isFeatured: boolean;
        featuredOrder: number | null;
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
                isFeatured: false, // Default value - should fetch from actual dish
                featuredOrder: null, // Default value - should fetch from actual dish
                createdAt: dishSnapshot.createdAt,
                updatedAt: dishSnapshot.updatedAt,
                successOrders: order.quantity
            });
        } else {
            const existing = dishMap.get(dishId)!;
            existing.successOrders += order.quantity;
        }
    });

    // Fetch actual dish data to get isFeatured and featuredOrder
    const dishIds = Array.from(dishMap.keys());
    const actualDishes = await prisma.dish.findMany({
        where: {
            id: {
                in: dishIds
            }
        }
    });

    // Update dishMap with actual data
    actualDishes.forEach(dish => {
        const dishData = dishMap.get(dish.id);
        if (dishData) {
            dishData.isFeatured = dish.isFeatured;
            dishData.featuredOrder = dish.featuredOrder;
            dishData.categoryId = dish.categoryId;
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
