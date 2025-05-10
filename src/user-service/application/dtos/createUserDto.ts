import { IsNotEmpty, Min, IsString, Max } from 'class-validator';
export class CreateUserDto {
  id!: string;

  @IsNotEmpty({ message: 'Store ID is required' })
  @IsString({ message: 'Store ID must be a string' })
  @Min(4, { message: 'Store ID must be at least 4' })
  @Max(30, { message: 'Store ID must be at most 30' })
  fullname!: string;

  /**
   * @pattern ^[^\s@]+@[^\s@]+\.[^\s@]+$ Invalid email format
   */
  email!: string;

  /**
   * @pattern ^(?=.*[a-z])(?=.*[A-Z] )(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};'!:"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_\-+=[\]{};'!:"\\|,.<>/?]{8,64}$ Password must be 8-64 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character
   */
  current_password!: string;

  @IsNotEmpty({ message: 'User role ID is required' })
  @IsString({ message: 'User role ID must be a string' })
  userRoleId!: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Min(10, { message: 'Phone number must be at least 10 characters' })
  @Max(10, { message: 'Phone number must be at most 10 characters' })
  phone!: string;

}
