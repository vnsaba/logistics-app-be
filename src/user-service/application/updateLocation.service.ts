import { IUserRepository } from '../domain/interfaces/user.interface';
import { IRoleRepository } from '../../role-service/domain/interfaces/role.interface';

export class UpdateLocationService {
    private readonly userRepository: IUserRepository;
    private readonly roleRepository: IRoleRepository;

    constructor(userRepository: IUserRepository, roleRepository: IRoleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    async updateLocation(userId: string, latitude: number, longitude: number): Promise<void> {
        // 1. Buscar el usuario
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // 2. Validar que sea repartidor
        const role = await this.roleRepository.findById(user.roleId);
        if (!role || role.name !== 'REPARTIDOR') {
            throw new Error('the user is not a delivery person');
        }

        // 3. Actualizar ubicación
        user.latitude = latitude;
        user.longitude = longitude;
        await this.userRepository.updateUser(user);
    }
}