import { RoleId, DepartmentInfo } from "./common";

export type Permission = 
  | "patients:read"
  | "patients:create"
  | "patients:update"
  | "patients:discharge"
  | "vitals:record"
  | "orders:create"
  | "orders:dispense"
  | "admin:configure"
  | "billing:manage";

export interface UserSession {
  userId: string;
  badgeNumber: string;
  fullNameEn: string;
  fullNameAr: string;
  email: string;
  role: RoleId;
  assignedDepartment: DepartmentInfo;
  permissions: Permission[];
  sessionExpiresAt: string;
}

export interface AuthContextType {
  user: UserSession | null;
  activeDepartment: DepartmentInfo;
  activeRole: RoleId;
  isAuthenticated: boolean;
  setActiveDepartment: (department: DepartmentInfo) => void;
  setActiveRole: (role: RoleId) => void;
  hasPermission: (permission: Permission) => boolean;
  login: (role?: RoleId, customUser?: Partial<UserSession>) => void;
  logout: () => void;
}
