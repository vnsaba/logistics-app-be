import { IUserRepository } from "../domain/interfaces/user.interface";
import { User as UserType } from "../../../types/auth/index";
import { ICityRepository } from '../../city-service/domain/interface/city.interface';
// import { DepartmentRepository } from '../../department-service/domain/';

export class UserService {
  private userRepository: IUserRepository;
  private cityRepository: ICityRepository;
  // private departmentRepository: DepartmentRepository;


  constructor(userRepository: IUserRepository, cityRepository: ICityRepository) {
    this.userRepository = userRepository;
    this.cityRepository = cityRepository;
    // this.departmentRepository = departmentRepository;
  }

  async getAllUsers(): Promise<Omit<UserType, "current_password">[]> {
    const users = await this.userRepository.getAllUsers();
    console.log("Users fetched:", users);


    //buscar la ciudad y el departamento de cada usuario
    const usersWithCityAndDepartment = await Promise.all(
      users.map(async (user) => {
        const city = await this.cityRepository.findById(Number(1000));
        console.log("City fetched:", city);

        return {
          id: user.id,
          firstName: user.fullname.split(" ")[0] || "N/A",
          lastName: user.fullname.split(" ").slice(1).join(" ") || "N/A",
          fullname: user.fullname || "N/A",
          email: user.email || "N/A",
          gsm: user.phone || "N/A",
          createdAt: user.created_at || new Date(),
          isActive: user.status === "ACTIVE",
          avatar: {
            name: "N/A",
            percent: 0,
            size: 0,
            status: "N/A",
            type: "N/A",
            uid: "N/A",
            url: "N/A",
          },
          addresses: {
            text: "N/A",
            coordinate: [
              "0",
              "0",
            ],
          }
        };
      })
    );
    console.log("Users with city and department:", usersWithCityAndDepartment);
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


