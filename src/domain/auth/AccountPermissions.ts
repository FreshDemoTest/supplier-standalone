export type SectionPermissionsType = {
  supplierBusinessId: string;
  displaySalesSection: boolean;
  displayRoutesSection: boolean;
};

export type UnitAccountPermissionsType = {
  unitId: string;
  permissions: { key: string; validation: boolean }[];
};

export type EmployeePermissionsType = {
  supplierUserId: string;
  position: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  unitPermissions: UnitAccountPermissionsType[];
};

export type AccountPermissionsType = {
  sectionPermissions: SectionPermissionsType;
  employee?: EmployeePermissionsType;
  role: string;
  deleted: boolean;
};

export type AllowedType = {
  accountPermission: boolean;
  sectionPermissions: SectionPermissionsType;
  unitPermissions: UnitAccountPermissionsType[];
};

// permission constants

export const APP_PERMISSION_GROUPS = [
  {
    groupKey: 'ordenes',
    groupLabel: 'Pedidos',
    permissions: [
      {
        label: 'Ver, Crear, Editar y Eliminar Pedidos',
        key: 'ordenes-all'
      },
      {
        label: 'Ver y Generar Facturas',
        key: 'invoices-all'
      }
    ]
  },
  {
    groupKey: 'clients',
    groupLabel: 'Clientes',
    permissions: [
      {
        label: `Crear, Editar, Eliminar Clientes`,
        key: 'clients-all'
      }
    ]
  },
  {
    groupKey: 'catalog',
    groupLabel: 'Catálogo',
    permissions: [
      {
        label: `Ver, Crear y Editar Productos y Precios`,
        key: 'catalog-all'
      }
    ]
  }
];

const ADMIN_PERMISSIONS = {
  groupKey: 'users',
  groupLabel: 'Usuarios',
  permissions: [
    {
      key: 'usersadmin-all',
      label: 'Administrar Usuarios'
    }
  ]
};

export const permissionsExpantionMap = {
  'ordenes-all': [
    'ordenes-view-details', // [TODO]
    'ordenes-view-list',
    'ordenes-add', // [TODO]
    'ordenes-edit', // [TODO]
    'ordenes-delete' // [TODO]
  ],
  'invoices-all': [
    'invoices-view-details', // [TODO]
    'invoices-view-list',
    'invoices-add', // [TODO]
  ],
  'clients-all': [
    'clients-view-list',
    'clients-view-details', // [TODO]
    'clients-add', // [TODO]
    'clients-edit', // [TODO]
  ],
  'catalog-all': [
    'catalog-view-list',
    'catalog-add', // [TODO]
    'catalog-edit', // [TODO]
    'catalog-upload', // [TODO]
    'catalog-edit-upload', // [TODO]
  ],
  'usersadmin-all': [
    // alima account
    'usersadmin-alima-plan-view',
    'usersadmin-alima-billing-view',
    'usersadmin-alima-billing-method-view',
    // home
    'usersadmin-home-view',
    'usersadmin-home-edit-account',
    'usersadmin-unit-view-list',
    // account
    'usersadmin-account-edit',
    'usersadmin-account-legal',
    // unit
    'usersadmin-unit-add',
    'usersadmin-unit-edit', // [TODO]
    // users
    'usersadmin-view-list',
    'usersadmin-view-details', // [TODO]
    'usersadmin-add', // [TODO]
    'usersadmin-edit', // [TODO]
    'usersadmin-delete', // [TODO]
    // reports
    'usersadmin-reports-view',
  ]
};

export const DEFAULT_PERMISSIONS = APP_PERMISSION_GROUPS.concat([
  ADMIN_PERMISSIONS
])
  .map((group) => group.permissions.map((p) => ({ ...p, validation: false })))
  .reduce((acc, val) => acc.concat(val), []);
