import { IUserRepository } from "../domain/interfaces/user.interface";
import { User as UserType } from "../../../types/auth/index";

export class UserService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
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
}


