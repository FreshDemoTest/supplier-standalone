// redux
import { createSlice } from '@reduxjs/toolkit';
// domain
import {
  AccountPermissionsType,
  AllowedType,
  DEFAULT_PERMISSIONS,
  UnitAccountPermissionsType,
  permissionsExpantionMap
} from '../../domain/auth/AccountPermissions';
// graphql
import { graphQLFetch } from '../../utils/graphql';
import { GET_PERMISSIONS } from '../../queries/auth/permissions';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: {
    active: false,
    body: ''
  },
  permissions: undefined as AccountPermissionsType | undefined,
  loaded: false,
  allowed: {} as AllowedType
};

const slice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },
    // RESET STATE
    resetState(state) {
      state = initialState;
    },
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.loaded = true;
      state.error = action.payload;
    },
    // SET Permissions
    setPermissionsSuccess(state, action) {
      state.isLoading = false;
      state.permissions = action.payload;
    },
    // SET Allowed
    setAllowedSuccess(state, action) {
      state.loaded = true;
      state.allowed = action.payload;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { startLoading, resetState } = slice.actions;

// ----------------------------------------------------------------------

/**
 * Get Permissions
 * @param token string
 * @returns
 */
export function getPermissions(token: string) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_PERMISSIONS,
        headers: {
          Authorization: `supplybasic ${token}`
        }
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error('Data is undefined');
      }
      if (data.getSupplierPermissionsFromToken.code > 0) {
        console.warn('No permissions found!');
        dispatch(
          slice.actions.hasError({
            active: true,
            body: 'Error cargando los permisos de tu cuenta.'
          })
        );
        return;
      }
      const _perms = data.getSupplierPermissionsFromToken;
      const _permissions = {
        sectionPermissions: _perms.permission,
        employee: _perms.employee,
        role: _perms.supplierUser.role,
        deleted: _perms.supplierUser.deleted
      } as AccountPermissionsType;
      dispatch(slice.actions.setPermissionsSuccess(_permissions));
      // validated & set allowed actions
      const _allowed = validatePermissions(_permissions);
      dispatch(slice.actions.setAllowedSuccess(_allowed));
    } catch (error: any) {
      console.warn('Issues getting Permissions');
      dispatch(
        slice.actions.hasError({
          active: true,
          body: error
        })
      );
      throw new Error(error.toString());
    }
  };
}
// ----------------------------------------------------------------------

/**
 * Expand permissions from -all to each action
 * @param permissions
 * @returns
 */
const setExpandedPermissions = (
  permissions: { key: string; validation: boolean }[]
) => {
  const sectionPerms = DEFAULT_PERMISSIONS.map((defPerm) => {
    // find permission, if not use default
    const _perm = permissions.find((p) => p.key === defPerm.key);
    // use expanded permissions for each action
    const expmap =
      permissionsExpantionMap[
        defPerm.key as keyof typeof permissionsExpantionMap
      ];
    const listOfSections = expmap.map((expPerm: string) => {
      return {
        key: expPerm,
        validation: _perm ? _perm.validation : defPerm.validation
      };
    });
    return listOfSections;
  });
  return sectionPerms.reduce((acc, val) => acc.concat(val), []);
};

// ----------------------------------------------------------------------
/**
 * Validate permissions
 * @param perms AccountPermissionsType
 * @returns AllowedType
 */
const validatePermissions = (perms: AccountPermissionsType) => {
  // validate is account is not deleted
  const _account = !perms.deleted;
  // pass display permissions
  const _section = perms.sectionPermissions;
  // parse unit permissions
  let _unit: UnitAccountPermissionsType[] = [];
  if (perms.employee) {
    _unit = (perms.employee?.unitPermissions || []).map((unit) => {
      return {
        unitId: unit.unitId,
        permissions: setExpandedPermissions(unit.permissions)
      } as UnitAccountPermissionsType;
    });
  }

  return {
    accountPermission: _account,
    sectionPermissions: _section,
    unitPermissions: _unit
  };
};
