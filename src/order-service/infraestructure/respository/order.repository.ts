import { IOrderRepository } from "../../domain/interface/order.interface";
import { CreateOrderDto } from "../../domain/Dto/createOrder.dto";
import { prismaMysql } from "../../../../prisma/index";
import { UpdateOrderDto } from "../../domain/Dto/updateOrder.dto";
import { OrderResponseDTO } from "../../domain/Dto/orderResponse.dto";
import { prismaMongo } from "../../../../prisma/index";
import { Order } from "../../domain/entity/order";
import { OrderStatus } from "prisma/generated/mysql";
import { EnrichedOrder } from "../../../shared/domain/interfaces/enrichedOrder.interface";

export class OrdersRepository implements IOrderRepository {
  async findById(id: number): Promise<Order | null> {
    const order = await prismaMysql.orders.findUnique({
      where: { id },
      include: {
        orderItems: { include: { product: true } },
      },
    });
    return order as unknown as Order;
  }

  async updateStatus(
    id: number,
    status: OrderStatus
  ): Promise<{ message: string }> {
    await prismaMysql.orders.update({
      where: { id },
      data: {
        status: status,
        updatedAt: new Date(),
        events: {
          create: {
            status: status,
            date: new Date(),
          },
        },
      },
    });
    return { message: "Order status updated successfully" };
  }

  async addEvent(orderId: number, status: string) {
    await prismaMysql.orderEvent.create({
      data: {
        orderId,
        status,
        date: new Date(),
      },
    });
  }

  async create(order: CreateOrderDto): Promise<CreateOrderDto> {
    const result = await prismaMysql.orders.create({
      data: {
        customerId: order.customerId,
        status: order.status, // Cast to match Prisma enum type
        subTotal: order.subTotal,
        latitude: order.latitude,
        longitude: order.longitude,
        storeId: order.storeId,
        deliveryId: order.deliveryId,
        address: order.address,
        cityId: order.cityId,
        deliveryDate: order.deliveryDate ?? new Date(), // Provide deliveryDate, fallback to now if not present
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems: {
          create: order.orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        },
        events: {
          create: {
            status: order.status,
            date: new Date(),
          },
        },
      },
    });
    return result as unknown as CreateOrderDto;
  }

  async update(
    id: number,
    order: UpdateOrderDto
  ): Promise<{ message: string }> {
    await prismaMysql.orders.update({
      where: { id },
      data: {
        latitude: order.latitude,
        longitude: order.longitude,
        address: order.address,
        updatedAt: new Date(),
      },
    });
    return { message: "Order updated successfully" };
  }

  //obtener toas las ordenes con sus relaciones
  async getAllWithRelations(): Promise<OrderResponseDTO[]> {
    const orders = await prismaMysql.orders.findMany({
      include: {
        orderItems: { include: { product: { include: { category: true } } } },
        store: true,
        city: { include: { department: true } },
        events: true,
      },
    });

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const [user, courier] = await Promise.all([
          prismaMongo.user.findUnique({ where: { id: order.customerId } }),
          prismaMongo.user.findUnique({ where: { id: order.deliveryId } }),
        ]);

        return {
          id: order.id,
          user: {
            id: user?.id ?? "", // Ensure id is always a string
            fullName: user?.fullname || "",
          },
          subtotal: order.subTotal, // revisa que sea así en la BD
          createdAt: order.createdAt.toISOString(),
          products: order.orderItems.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            isActive: item.product.status === "ACTIVE",
            description: item.product.description,
            images: [
              {
                url: item.product.imageUrl,
                name: item.product.name,
              },
            ] as [{ url: string; name: string }],
            createdAt: item.product.createdAt.toISOString(),
            unitPrice: item.unitPrice,
            category: item.product.categoryId,
          })),
          status: {
            id: 0, // si tienes un id para status, ponlo aquí
            text: order.status,
          },
          store: {
            id: order.store.id,
            name: order.store.name,
            isActive: order.store.status === "ACTIVE",
            createdAt: order.store.createdAt.toISOString(),
            address: {
              text: order.store.address,
              latitude: order.store.latitude,
              longitude: order.store.longitude,
            },
          },
          courier: courier
            ? {
                id: courier.id,
                name: courier.fullname,
                gender: "N/A",
                gsm: courier.phone,
                createdAt: courier.created_at.toISOString(),
                accountNumber: courier.phone,
                address: "N/A",
                status: {
                  id: 0,
                  text: courier.status,
                },
              }
            : null,
          events: order.events.map((e) => ({
            date: e.date,
            status: e.status,
          })),
          orderNumber: order.id, // si no tienes otro campo, usa el id
        };
      })
    );

    return enrichedOrders;
  }

  async getByIdWithRelations(
    orderId: number
  ): Promise<OrderResponseDTO | null> {
    const order = await prismaMysql.orders.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { product: { include: { category: true } } } },
        city: { include: { department: true } },
        store: true,
        events: true,
      },
    });

    if (!order) return null;

    const [user, courier] = await Promise.all([
      prismaMongo.user.findUnique({ where: { id: order.customerId } }),
      prismaMongo.user.findUnique({ where: { id: order.deliveryId } }),
    ]);

    return {
      id: order.id,
      user: {
        id: user?.id ?? "", // Ensure id is always a string
        fullName: user?.fullname || "",
      },
      subtotal: order.subTotal,
      createdAt: order.createdAt.toISOString(),
      products: order.orderItems.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        isActive: item.product.status === "ACTIVE",
        description: item.product.description,
        images: [
          {
            url: item.product.imageUrl,
            name: item.product.name,
          },
        ] as [{ url: string; name: string }],
        createdAt: item.product.createdAt.toISOString(),
        unitPrice: item.unitPrice,
        category: item.product.categoryId,
      })),
      status: {
        id: 0,
        text: order.status,
      },
      store: {
        id: order.store.id,
        name: order.store.name,
        isActive: order.store.status === "ACTIVE",
        createdAt: order.store.createdAt.toISOString(),
        address: {
          text: order.store.address,
          latitude: order.store.latitude,
          longitude: order.store.longitude,
        },
      },
      courier: courier
        ? {
            id: courier.id,
            name: courier.fullname,
            gender: "N/A",
            gsm: courier.phone,
            createdAt: courier.created_at.toISOString(),
            accountNumber: courier.phone,
            address: "N/A",
            status: {
              id: 0,
              text: courier.status,
            },
          }
        : null,
      events: order.events.map((e) => ({
        date: e.date,
        status: e.status,
      })),
      orderNumber: order.id,
    };
  }

  async findByDeliveryAndDate(
    deliveryId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EnrichedOrder[] | null> {
    const orders = await prismaMysql.orders.findMany({
      where: {
        deliveryId: deliveryId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        orderItems: { include: { product: true } },
        store: true,
        city: { include: { department: true } },
      },
    });

    if (!orders || orders.length === 0) return null;

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const [customer, delivery] = await Promise.all([
          prismaMongo.user.findUnique({ where: { id: order.customerId } }),
          prismaMongo.user.findUnique({ where: { id: order.deliveryId } }),
        ]);
        return {
          ...order,
          customer,
          delivery,
        };
      })
    );

    return enrichedOrders;
  }
}
