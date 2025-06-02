import { Body, Controller, Get, Post, Route, Tags } from "tsoa";
import { UserRepository } from "../repository/user.repository";
import { UserService } from "../../application/user.service";

@Route('couriers')
@Tags('couriers')
export class CourierController extends Controller {
    private readonly userService: UserService;

    constructor() {
        super();
        const userRepository = new UserRepository();
        this.userService = new UserService(userRepository);
    }

    //crear un courier
    @Post("/create ")
    async createCourier(@Body() courierData: any): Promise<any> {
        return await this.userService.createCourier(courierData);
    }

    @Get("/")
    async getCouriersWithLocation(): Promise<any[]> {
        return await this.userService.getCouriersWithLocation();
    }

}