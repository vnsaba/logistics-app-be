import { Body, Controller, Get, Post, Route, Tags } from "tsoa";
import { UserRepository } from '../repository/user.repository';
import { UserService } from "../../application/user.service";
import { CreateDeliveryDTO } from "../../domain/interfaces/createDelivery.dto";
import { StoreRepository } from '../../../store-service/infraestructure/repository/store.repository';
import { RoleRepository } from '../../../role-service/infraestructure/repository/role.repository';

@Route('couriers')
@Tags('couriers')
export class CourierController extends Controller {
    private readonly userService: UserService;
    private readonly StoreRepository: StoreRepository
    private readonly userRepository: UserRepository;
    private readonly roleRepository: RoleRepository;

    constructor() {
        super();
        const userRepository = new UserRepository();
        this.userService = new UserService(userRepository);
        this.StoreRepository = new StoreRepository();
        this.roleRepository = new RoleRepository();
        this.userRepository = userRepository;
    }

    //crear un courier
    @Post()
    async createCourier(@Body() courierData: CreateDeliveryDTO): Promise<any> {
        const store = await this.StoreRepository.findById(Number(courierData.storeId.id));
        if (!store) {
            throw new Error('Store not found');
        }
        // Validar que el courier no exista
        const existingCourier = await this.userRepository.getByEmail(courierData.email);
        if (existingCourier) {
            throw new Error('Courier with this email already exists');
        }

        //validar el telofono que sea 10 digitos
        if (!/^\d{10}$/.test(courierData.phone)) {
            throw new Error('Phone number must be 10 digits');
        }

        courierData.phone = `+57${courierData.phone}`; // Formatear el teléfono al formato internacional
        const cityId = store.cityId // Asignar el cityId del store al courier
        const rolId = await this.roleRepository.findByName('REPARTIDOR'); // Obtener el rol de courier
        if (!rolId) {
            throw new Error('Role REPARTIDOR not found');
        }

        //desestructurar el objeto courierData para pasar el cityId, el status = ACTIVE, y el rolID =rolId.id
        return await this.userService.createCourier({
            ...courierData,
            cityId: cityId,
            status: 'ACTIVE',
            roleId: rolId.id,
        });

    }

    @Get()
    async getCouriersWithLocation(): Promise<any[]> {
        return await this.userService.getCouriersWithLocation();
    }

}