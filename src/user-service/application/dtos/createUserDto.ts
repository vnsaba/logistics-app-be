import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty({ message: 'Store ID is required' })
  @IsString({ message: 'Store ID must be a string' })
  @Length(10, 10, { message: 'Phone number must be exactly 10 characters' })
  fullname!: string;

  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: 'Invalid email format',
  })
  email!: string;

  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,64}$/,
    {
      message:
        'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  current_password!: string;

  @IsNotEmpty({ message: 'User role ID is required' })
  @IsString({ message: 'User role ID must be a string' })
  roleId!: string;

  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Length(10, 10, { message: 'Phone number must be exactly 10 characters' })
  phone!: string;

}
