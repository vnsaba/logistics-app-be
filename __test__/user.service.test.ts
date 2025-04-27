import { UserService } from '../src/user-service/application/user.service';
import { IUserRepository } from '../src/user-service/domain/interfaces/user.interface';
import { User } from '../src/user-service/domain/entity/user';

class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async createUser(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }
}

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    const mockUserRepository = new MockUserRepository();
    userService = new UserService(mockUserRepository);
  });

  test('Add the user to the mock db', async () => {
    const userData = {
      fullname: 'John Doe',
      email: 'john@gmail.com',
      current_password: 'password123',
      status: 'ACTIVE',
      roleId: '6808560b7c58de59c8a68615',
    };
    const user: User = new User(
      userData.fullname,
      userData.email,
      userData.current_password,
      userData.status,
      userData.roleId
    );

    const addedUser = await userService.createUser(
      userData.fullname,
      userData.email,
      userData.current_password,
      userData.status,
      userData.roleId
    );

    expect(addedUser.email).toBe(user.email);
    expect(addedUser.fullname).toBe(user.fullname);

    // usar jest mock para testear infraestructura, acá solo logica de negocio
  });
});
