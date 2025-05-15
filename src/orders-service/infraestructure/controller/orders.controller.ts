import { Controller, Post, Route, SuccessResponse, Body, Tags } from "tsoa";
import { Order } from '../../domain/entity/order';
import { CreateOrderDto } from "../../application/dtos/createOrderDto";
import { CreateOrderService } from '../../application/createOrders.ervice';
import { OrdersRepository } from "../repository/orders.repository";
import { StoreRepository } from "../../../store-service/infraestructure/repository/store.repository";
// import { OrderItemRepository } from "../../../orderItem-service/infraestructure/repository/orderItem.repository";
import { ProductsRepository } from '../../../products-service/infraestructure/repository/products.repository';

interface ErrorResponse {
    status: number;
    message: string;
}


@Route('orders')
@Tags('orders')
export class OrdersController extends Controller {
    private readonly createOrderService: CreateOrderService;
    private readonly storeRepository: StoreRepository;
    private readonly orderRepository: OrdersRepository;
    // private readonly orderItemRepository: OrderItemRepository
    private readonly productsRepository: ProductsRepository;

    constructor() {
        super();
        this.orderRepository = new OrdersRepository();
        this.storeRepository = new StoreRepository();
        // this.orderItemRepository = new OrderItemRepository();
        this.productsRepository = new ProductsRepository();
        this.createOrderService = new CreateOrderService(this.orderRepository, this.storeRepository, this.productsRepository );
    }

    //FALTA PROTEGER LA RUTA, PORQUE SOLO ES CUANDO EL USUARIO INICIA SESION
    @SuccessResponse("201", "Created")
    @Post('create')
    public async createOrder(@Body() requestBody: CreateOrderDto,
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

}

