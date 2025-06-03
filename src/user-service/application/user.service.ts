import { IUserRepository } from "../domain/interfaces/user.interface";
import { User as UserType } from "../../../types/auth/index";
import { ICityRepository } from '../../city-service/domain/interface/city.interface';
import { UserDto } from "./dtos/users.dto";
import { DepartmentRepository } from '../../department-service/infraestructure/repository/department.repository';

export class UserService {
  private userRepository: IUserRepository;
  private cityRepository: ICityRepository;
  private departmentRepository: DepartmentRepository;


  constructor(userRepository: IUserRepository, cityRepository: ICityRepository) {
    this.userRepository = userRepository;
    this.cityRepository = cityRepository;
    this.departmentRepository = new DepartmentRepository();
  }


  async getAllUsers(): Promise<Omit<UserType, "current_password">[]> {
    const users = await this.userRepository.getAllUsers();

    return users;
  }
  async getCouriersWithLocation(): Promise<any[]> {
    const couriers = await this.userRepository.getAllCouriersWithLocation();

    return couriers.map((courier) => {
      const lastLocation = courier.lastLocation?.[0];

      return {
        id: courier.id,
        name: courier.fullname,
        email: courier.email,

        gender: "N/A",
        gsm: courier.phone,
        createdAt: courier.created_at,
        accountNumber: courier.phone,
        address: {
          text: "N/A",
          latitude: lastLocation?.latitude ?? 0,
          longitude: lastLocation?.longitude ?? 0,
        },
        status: {
          id: 0,
          text: courier.status,
        },
      };
    });

  }

  async getUsersByRole(
    roleName: string
  ): Promise<Omit<UserType, "current_password">[]> {
    const users = await this.userRepository.getUsersByRole(roleName);

    return users;
  }

  async createCourier(courierData: any): Promise<UserType> {
    const newCourier = await this.userRepository.createUser(courierData);
    if (!newCourier.id) {
      throw new Error("Created courier does not have a valid id.");
    }
    return {
      ...newCourier,
      id: newCourier.id as string,
    };
  }

  async getAll(): Promise<UserDto[]> {
    const users = await this.userRepository.getAllClients();

    const usersWithCityAndDepartment = await Promise.all(
      users.map(async (user): Promise<UserDto> => {
        const city = await this.cityRepository.findById(Number(user.cityId));
        const department = await this.departmentRepository.findById(city?.departmentId || 0);
        return {
          id: Number(user.id) ?? 0,
          firstName: user.fullname.split(" ")[0] || "N/A",
          lastName: user.fullname.split(" ").slice(1).join(" ") || "N/A",
          fullaName: user.fullname || "N/A", // CUIDADO: es fullaName, no fullname (según tu DTO)
          gender: "N/A", // No proporcionado, puedes ajustar si existe
          gsm: user.phone || "N/A",
          createdAt: user.created_at || new Date(),
          isActive: user.status === "ACTIVE",
          avatar: [
            {
              name: "N/A",
              percent: 0,
              size: 0,
              status: "N/A",
              type: "N/A",
              uid: "N/A",
              url: "https://marketplace.canva.com/EAFmXSny51I/1/0/1600w/canva-avatar-foto-de-perfil-mujer-dibujo-ilustrado-moderno-rojo-1Fscw8oj1-Q.jpg",
            },
          ],
          addresses: [
            {
              text: city
                ? `${city.name}, ${department?.name ?? "Departamento desconocido"}`
                : "Ciudad desconocida",
              coordinate: { lat: "0", lng: "0" }, 
            },
          ],
        };
      })
    );

    return usersWithCityAndDepartment;
  }

}
