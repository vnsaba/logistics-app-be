export class UpdateUserDto {
    /**
     * @isString Full name must be a string
     * @minLength 3 Full name must be at least 3 characters long
     * @maxLength 100 Full name must be at most 100 characters long
     */
    fullname?: string;
  
  
    // /**
    //  * @pattern ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]{8,64}$ Password must be 8-64 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character
    //  */
    current_password?: string;
  
  
    /**
     * @isString Phone number must be a string
     * @minLength 10 Phone number must be at least 10 characters
     * @maxLength 10 Phone number must be at most 10 characters
     */
    phone?: string;

  }
  