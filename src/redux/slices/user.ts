// import { map, filter } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  myProfile: {
    name: '...',
    lastName: '...'
  }
};

const slice = createSlice({
  name: 'user',
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
      state.error = action.payload;
    },

    // GET PROFILE
    getProfileSuccess(state, action) {
      state.isLoading = false;
      state.myProfile = action.payload;
    },
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { resetState } = slice.actions;

// ----------------------------------------------------------------------

export function getProfile() {
  return async (dispatch: any) => {
    dispatch(slice.actions.startLoading());
    try {
      dispatch(
        slice.actions.getProfileSuccess({
          name: 'Nombre',
          lastName: 'Apellido'
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
};

// -----------------------------------------------------

type profileType = {
  name: string
  lastName: string
}
export function setProfile(profile: profileType) {
  return async (dispatch: any) => {
    dispatch(slice.actions.startLoading());
    try {
      dispatch(
        slice.actions.getProfileSuccess({
          name: profile.name,
          lastName: profile.lastName
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
