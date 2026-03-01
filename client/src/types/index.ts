export interface Organization {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  description?: string;
  contacts?: Contact[];
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  organizationId?: string;
  organization?: Organization;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationInput {
  name: string;
  industry?: string;
  website?: string;
  description?: string;
}

export interface UpdateOrganizationInput extends Partial<CreateOrganizationInput> {}

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position?: string;
  organizationId?: string;
}

export interface UpdateContactInput extends Partial<CreateContactInput> {}

export interface Stats {
  total: number;
}
