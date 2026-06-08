export type Role = 'Super Admin' | 'KYC Admin' | 'Catalog Admin' | 'Ops Admin' | 'Finance Admin' | 'Content Admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
