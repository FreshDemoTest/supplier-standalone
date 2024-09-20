import { UnitStateType } from './SUnit';

export type UserType = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  deleted?: boolean;
  enabled?: boolean;
};

export type PermissionType = {
  key: string;
  value: boolean;
};

export type UnitPermissionsType = {
  id?: string;
  permissions: PermissionType[];
  unit: UnitStateType;
};

export type UserPermissionType = {
  id?: string;
  units: UnitPermissionsType[];
  user: UserType;
};

export type UserInfoType = {
  department?: string;
  role?: string;
};
