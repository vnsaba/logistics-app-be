import { Permission } from '../../../../types/auth/index';

export class Role {
  id?: string;
  name: string;
  description: string;
  permissions: Permission[];

  constructor(
    name: string,
    description: string,
    permissions: Permission[],
    id?: string
  ) {
    // Validate field
    if (!name.trim() || !description.trim() || !permissions.length) {
      throw new Error(
        'All fields are required: name, description, and permissions'
      );
    }

    this.name = name;
    this.description = description;
    this.permissions = permissions;

    if (id) {
      this.id = id;
    }
  }
}
