// import { map, filter } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import { UserType } from '../../domain/account/User';
import { graphQLFetch } from '../../utils/graphql';
import { GET_USER, REGISTER_USER } from '../../queries/auth/registration';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  inProcess: true,
  error: {
    active: false,
    body: ''
  },
  user: {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: ''
  } as UserType & { password?: string }
};

const slice = createSlice({
  name: 'registration',
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
    // FINISH PROCESS
    finishProcess(state) {
      state.inProcess = true;
    },
    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    // SET User
    setUserSuccess(state, action) {
      state.isLoading = false;
      state.user = action.payload;
    },
    // DELETE User
    deleteUser(state) {
      state.isLoading = false;
      state.user = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: ''
      };
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { startLoading, deleteUser, finishProcess, resetState } = slice.actions;

// ----------------------------------------------------------------------

/**
 * Create User
 * @param myuser : userType
 * @returns
 */
export function setUser(
  myuser: UserType & { password?: string; firebaseId: string }
) {
  return async (dispatch: any) => {
    try {
      dispatch(slice.actions.startLoading());
      const { data } = await graphQLFetch({
        query: REGISTER_USER,
        variables: {
          email: myuser.email,
          firebaseId: myuser.firebaseId,
          firstName: myuser.firstName,
          lastName: myuser.lastName,
          phoneNumber: '52' + myuser.phoneNumber?.toString(),
          role: 'admin'
        }
      });
      if (!data?.newSupplierUser?.id) {
        throw new Error('Data is undefined');
      }
      dispatch(
        slice.actions.setUserSuccess({
          id: data.newSupplierUser.id,
          firstName: data.newSupplierUser.user.firstName,
          lastName: data.newSupplierUser.user.lastName,
          email: data.newSupplierUser.user.email,
          phoneNumber: data.newSupplierUser.user.phoneNumber
        })
      );
    } catch (error: any) {
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 * Get User from API by Firebase Token
 * @param token
 * @returns
 */
export function getUser(token: string) {
  return async (dispatch: any) => {
    try {
      dispatch(startLoading());
      const { data, error } = await graphQLFetch({
        query: GET_USER,
        headers: {
          Authorization: `supplybasic ${token}`
        }
      });
      if (error) {
        throw error;
      }
      if (!data || !data?.getSupplierUserFromToken?.id) {
        throw new Error('Data is undefined');
      }
      dispatch(
        slice.actions.setUserSuccess({
          id: data.getSupplierUserFromToken.id,
          firstName: data.getSupplierUserFromToken.user.firstName,
          lastName: data.getSupplierUserFromToken.user.lastName,
          email: data.getSupplierUserFromToken.user.email,
          phoneNumber: data.getSupplierUserFromToken.user.phoneNumber
        })
      );
    } catch (error: any) {
      dispatch(
        slice.actions.hasError({
          status: true,
          body: error
        })
      );
      throw new Error(error.toString());
    }
  };
}

// ----------------------------------------------------------------------
/**
 *
 * @param error
 * @returns
 */
export function raiseError(error: any) {
  return async (dispatch: any) => {
    dispatch(
      slice.actions.hasError({
        status: true,
        body: error
      })
    );
  };
}
