import { Controller, Post, Route, SuccessResponse, Body, Tags, Get, Path, Put } from "tsoa";
import { CreateOrderService } from '../../application/createOrder.service';
import { OrdersRepository } from "../respository/order.repository";
import { StoreRepository } from "../../../store-service/infraestructure/repository/store.repository";
import { GoogleMapsGeocodingService } from '../../../geolocation-service/infraestructure/geocoding';
import { UserRepository } from "../../../user-service/infraestructure/repository/user.repository";
import { DistanceService } from '../../../geolocation-service/infraestructure/distanceService';
import { InventoryRepository } from "../../../inventory-service/infraestructure/repository/inventory.repository";
import { ErrorResponse } from "../../../shared/domain/interfaces/error.interface";
import { CreateOrderDto } from '../../domain/Dto/createOrder.dto';
import { OrderResponseDTO } from "../../domain/Dto/orderResponse.dto";
import { UpdateOrderStatusService } from "../../application/updateOrderStatus.service";
import { OrderStatus } from "../../../shared/enums/orderStatus.enum";
import { GetOrderDetailSerice } from "../../application/getOrderDetails.service";
import { LocationRepository } from "../../../geolocation-service/infraestructure/repository/location.respository";

@Route('orders')
@Tags('orders')
export class OrdersController extends Controller {
    private readonly createOrderService: CreateOrderService;
    private readonly storeRepository: StoreRepository;
    private readonly orderRepository: OrdersRepository;
    private readonly geocodingService: GoogleMapsGeocodingService;
    private readonly userSRepository: UserRepository
    private readonly distanceService: DistanceService
    private readonly inventoryRepository: InventoryRepository
    private readonly updateOrderStatus: UpdateOrderStatusService;
    private readonly getOrderDetailSerice: GetOrderDetailSerice
    private readonly locationRepository: LocationRepository;

    constructor() {
        super();
        this.orderRepository = new OrdersRepository();
        this.storeRepository = new StoreRepository();
        this.geocodingService = new GoogleMapsGeocodingService(process.env.GEOCODING_API as string);
        this.distanceService = new DistanceService(process.env.GEOCODING_API as string);
        this.userSRepository = new UserRepository();
        this.inventoryRepository = new InventoryRepository();
        this.locationRepository = new LocationRepository();
        this.createOrderService = new CreateOrderService(this.orderRepository, this.storeRepository,
            this.geocodingService, this.userSRepository, this.distanceService, this.inventoryRepository, this.locationRepository);
        this.updateOrderStatus = new UpdateOrderStatusService(this.orderRepository)
        this.getOrderDetailSerice = new GetOrderDetailSerice(this.orderRepository, this.userSRepository, this.locationRepository, this.geocodingService);
    }


    /**
     * Obtener todas las órdenes con sus relaciones
     * @returns Lista de órdenes
     */
    @Get()
    @SuccessResponse("200", "Lista de órdenes obtenida correctamente")
    public async getAllOrders(): Promise<OrderResponseDTO[]> {
        try {
            const orders = await this.orderRepository.getAllWithRelations();
            if (!orders || orders.length === 0) {
                this.setStatus(404);
                throw new Error('No orders found');
            }
            return orders;
        } catch (error) {
            this.setStatus(500);
            throw new Error(error instanceof Error ? error.message : "Internal Server Error");
        }
    }

    /**
     * Crear una nueva orden
     * @param requestBody Información para crear la orden
     * @returns Arreglo de órdenes creadas
     */
    @SuccessResponse("201", "Created")
    @Post('create')
    public async createOrder(@Body() requestBody: any,
    ): Promise<CreateOrderDto[] | ErrorResponse> {
        try {
            const order = await this.createOrderService.createOrders({
                ...requestBody,
                cityId: String(requestBody.cityId)
            });
            if (!order) {
                this.setStatus(400);
                return { status: 400, message: "Bad Request" }
            }
            this.setStatus(201);
            return order
        } catch (error) {
            if (error instanceof Error && error.message.includes("Store with id")) {
                this.setStatus(404);
                return { status: 404, message: error.message }
            }
            this.setStatus(500);
            return { status: 500, message: error instanceof Error ? error.message : "Internal Server Error" };
        }
    }



    /**
     * Obtener una orden por ID con sus relaciones
     * @param orderId ID de la orden
     */
    @Get('/{orderId}')
    @SuccessResponse("200", "OK") //obtener la informaciond de uan orden en especifico
    public async getOrderById(@Path() orderId: number): Promise<OrderResponseDTO | null> {
        // const order = await this.orderRepository.getByIdWithRelations(orderId);
        const order = await this.getOrderDetailSerice.execute(orderId);
        if (!order) {
            this.setStatus(404);
            throw new Error('order not found');
        }
        return order;
    }



    /**
 * Actualizar el estado de una orden
 * @param orderId ID de la orden
 * @param body Estado nuevo
 * @returns Mensaje de confirmación
 */
    @Put('{orderId}/status')
    public async updateStatus(
        @Path() orderId: number,
        @Body() body: { newStatus: OrderStatus }
    ): Promise<{ message: string }> {
        try {
            await this.updateOrderStatus.execute({ orderId, newStatus: body.newStatus });
            this.setStatus(200);
            return { message: 'Status correctly updated' };
        } catch (error) {
            if (error instanceof Error) {
                this.setStatus(400);
                return { message: error.message };
            }
            this.setStatus(500);
            return { message: "Internal Server Error" };
        }
    }

    /**
     * Obtener todas las órdenes de un cliente por su ID
     * @param userId ID del cliente
     * @returns Lista de órdenes del cliente
     */
    //obtener las ordenes de un usuario
    @Get('user/{userId}')
    @SuccessResponse("200", "OK")
    public async getOrdersByUserId(@Path() userId: string): Promise<OrderResponseDTO[]> {
        try {
            const orders = await this.orderRepository.getOrdersByCustomerId(userId);
            if (!orders || orders.length === 0) {
                this.setStatus(404);
                throw new Error('No orders found for this user');
            }
            return orders;
        } catch (error) {
            this.setStatus(500);
            throw new Error(error instanceof Error ? error.message : "Internal Server Error");
        }
    }

  /**
   * Obtener todas las órdenes asignadas a un repartidor
   * @param courierId ID del repartidor
   * @returns Lista de órdenes del repartidor
   */    @Get('courier/{courierId}')
    @SuccessResponse("200", "OK")
    public async getOrdersByCourierId(@Path() courierId: string): Promise<OrderResponseDTO[]> {
        try {
            const orders = await this.orderRepository.getOrdersByCourierId(courierId);
            if (!orders || orders.length === 0) {
                this.setStatus(404);
                throw new Error('No orders found for this courier');
            }
            return orders;
        } catch (error) {
            this.setStatus(500);
            throw new Error(error instanceof Error ? error.message : "Internal Server Error");
        }
    }



}