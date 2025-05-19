import { Controller, Post, Route, SuccessResponse, Body, Tags, Get } from "tsoa";
import { Order } from '../../domain/entity/order';
import { CreateOrderService } from '../../application/createOrders.ervice';
import { OrdersRepository } from "../repository/orders.repository";
import { StoreRepository } from "../../../store-service/infraestructure/repository/store.repository";
import { ProductRepository } from '../../../product-service/infraestructure/repository/product.repository';
import { GoogleMapsGeocodingService } from '../../../geolocation-service/infraestructure/geocoding';
import { UserRepository } from "../../../user-service/infraestructure/repository/user.repository";
import { DistanceService } from '../../../geolocation-service/infraestructure/distanceService';
import { CancelSubOrderResponse, CreateOrderRequestDto, SubOrderInfoDto } from "../../application/dtos/orderDto"
import { InventoryRepository } from "../../../inventory-service/infraestructure/repository/inventory.repository";
import { ErrorResponse } from "../../../shared/domain/interfaces/error.interface";
// import { UserRole } from '../../../../types/auth/index';
import { CancelSubOrderService } from "../../application/cancelSubOrder.service";
import { SubOrderRepository } from "../repository/subOrderRepository";
import { OrderInfoService } from '../../application/orderInfo.service';

@Route('orders')
@Tags('orders')
export class OrdersController extends Controller {
    private readonly createOrderService: CreateOrderService;
    private readonly storeRepository: StoreRepository;
    private readonly orderRepository: OrdersRepository;
    private readonly productsRepository: ProductRepository;
    private readonly geocodingService: GoogleMapsGeocodingService;
    private readonly userSRepository: UserRepository
    private readonly distanceService: DistanceService
    private readonly inventoryRepository: InventoryRepository
    private readonly subOrdersRepository: SubOrderRepository;
    private readonly cancelSubOrderService: CancelSubOrderService;
    private readonly orderInfoService: OrderInfoService;

    constructor() {
        super();
        this.orderRepository = new OrdersRepository();
        this.storeRepository = new StoreRepository();
        this.productsRepository = new ProductRepository();
        this.geocodingService = new GoogleMapsGeocodingService(process.env.GEOCODING_API as string);
        this.distanceService = new DistanceService(process.env.GEOCODING_API as string);
        this.userSRepository = new UserRepository();
        this.inventoryRepository = new InventoryRepository();
        this.subOrdersRepository = new SubOrderRepository();
        this.orderInfoService = new OrderInfoService(this.subOrdersRepository,this.storeRepository, this.productsRepository, this.userSRepository, this.orderRepository);
        this.cancelSubOrderService = new CancelSubOrderService(this.orderRepository, this.userSRepository, this.subOrdersRepository, this.inventoryRepository);
        this.createOrderService = new CreateOrderService(this.orderRepository, this.storeRepository, this.productsRepository,
            this.geocodingService, this.userSRepository, this.distanceService, this.inventoryRepository);
    }

    // @Security('jwt', [UserRole.CLIENTE])
    @SuccessResponse("201", "Created")
    @Post('create')
    public async createOrder(@Body() requestBody: CreateOrderRequestDto,
    ): Promise<Order | ErrorResponse> {
        try {
            const order = await this.createOrderService.createOrder(requestBody);
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

    //LISTAR TODOS LOS PEDIDOS QUE PEUDEN SER OBSERVADOS POR EL GERENTE Y EL ADMINISTRADOR
    // @Security('jwt', [UserRole.GERENTE, UserRole.ADMINISTRADOR])
    @SuccessResponse("200", "OK")
    @Get('list')
    public async listOrders(
    ): Promise<Order[] | ErrorResponse> {
        try {
            const orders = await this.orderRepository.findAll();
            if (!orders) {
                this.setStatus(404);
                return { status: 404, message: "No orders found" }
            }
            this.setStatus(200);
            return orders
        } catch (error) {
            this.setStatus(500);
            return { status: 500, message: error instanceof Error ? error.message : "Internal Server Error" };
        }
    }

    @SuccessResponse("200", "OK")
    @Post('cancel-suborder')
    public async cancelSubOrder(
        @Body() body: { subOrderId: number }
    ): Promise<CancelSubOrderResponse | ErrorResponse> {
        try {
            const result = await this.cancelSubOrderService.cancelSubOrder(body.subOrderId);
            if (!result) {
                this.setStatus(404);
                return { status: 404, message: "Suborder not found" };
            }
            this.setStatus(200);
            return result;
        } catch (error) {
            this.setStatus(500);
            return { status: 500, message: error instanceof Error ? error.message : "Internal Server Error" };
        }
    }

    //listar las ordenes de un cliente
    @SuccessResponse("200", "OK")
    @Post('subOrder-info')
    public async getSubOrderInfo(
        @Body() body: { clientId: string }
    ): Promise<SubOrderInfoDto[] | ErrorResponse> {
        try {
            const result = await this.orderInfoService.getOrderInfo(body.clientId);
            if (!result) {
                this.setStatus(404);
                return { status: 404, message: "Suborder not found" };
            }
            this.setStatus(200);
            return result;
        } catch (error) {
            this.setStatus(500);
            return { status: 500, message: error instanceof Error ? error.message : "Internal Server Error" };
        }
    }
}

