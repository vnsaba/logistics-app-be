import {
  Body,
  Controller,
  Get,
  Post,
  Route,
  Tags,
  SuccessResponse,
  Response
} from "tsoa";
import { UserRepository } from '../repository/user.repository';
import { UserService } from "../../application/user.service";
import { CreateDeliveryDTO } from "../../domain/interfaces/createDelivery.dto";
import { StoreRepository } from '../../../store-service/infraestructure/repository/store.repository';
import { RoleRepository } from '../../../role-service/infraestructure/repository/role.repository';

/**
 * Controlador para gestionar repartidores (couriers).
 */
@Route('couriers')
@Tags('couriers')
export class CourierController extends Controller {
  private readonly userService: UserService;
  private readonly storeRepository: StoreRepository;
  private readonly userRepository: UserRepository;
  private readonly roleRepository: RoleRepository;

  constructor() {
    super();
    this.userRepository = new UserRepository();
    this.storeRepository = new StoreRepository();
    this.roleRepository = new RoleRepository();
    this.userService = new UserService(this.userRepository);
  }

  /**
   * Crea un nuevo repartidor (courier).
   * @param courierData Datos del repartidor a registrar.
   */
  @Post()
  @SuccessResponse("201", "Courier creado exitosamente")
  @Response("400", "Datos inválidos o ya existentes")
  public async createCourier(@Body() courierData: CreateDeliveryDTO): Promise<any> {
    const store = await this.storeRepository.findById(Number(courierData.storeId.id));
    if (!store) {
      this.setStatus(400);
      throw new Error('Store not found');
    }

    const existingCourier = await this.userRepository.getByEmail(courierData.email);
    if (existingCourier) {
      this.setStatus(400);
      throw new Error('Courier with this email already exists');
    }

    if (!/^\d{10}$/.test(courierData.phone)) {
      this.setStatus(400);
      throw new Error('Phone number must be 10 digits');
    }

    courierData.phone = `+57${courierData.phone}`;
    const cityId = store.cityId;

    const role = await this.roleRepository.findByName('REPARTIDOR');
    if (!role) {
      this.setStatus(400);
      throw new Error('Role REPARTIDOR not found');
    }

    const createdCourier = await this.userService.createCourier({
      ...courierData,
      cityId: cityId,
      status: 'ACTIVE',
      roleId: role.id,
    });

    this.setStatus(201);
    return createdCourier;
  }

  /**
   * Obtiene todos los couriers con su última ubicación registrada.
   */
  @Get()
  @SuccessResponse("200", "Lista de couriers con ubicación")
  public async getCouriersWithLocation(): Promise<any[]> {
    return await this.userService.getCouriersWithLocation();
  }
}