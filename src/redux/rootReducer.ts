import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// slices
import registrationReducer, {
  resetState as registrationReset
} from './slices/registration';
import userReducer, { resetState as userReset } from './slices/user';
import accountReducer, { resetState as accountReset } from './slices/account';
import clientReducer, { resetState as clientReset } from './slices/client';
import supplierReducer, {
  resetState as supplierReset
} from './slices/supplier';
import permissionReducer, {
  resetState as permissionReset
} from './slices/permission';
import ordenReducer, { resetState as ordenReset } from './slices/orden';

// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: 'rootSupplier',
  storage,
  keyPrefix: 'redux-',
  whitelist: []
};

const persistConfig = (key: string, whitelist: Array<string>) => ({
  key: key,
  storage,
  keyPrefix: 'redux-',
  whitelist: whitelist
});

const resetRootReducer = (dispatch: any) => {
  dispatch(registrationReset());
  dispatch(accountReset());
  dispatch(userReset());
  dispatch(clientReset());
  dispatch(supplierReset());
  dispatch(ordenReset());
  dispatch(permissionReset());
};

const rootReducer = combineReducers({
  user: userReducer,
  registration: persistReducer(
    persistConfig('registration', []),
    registrationReducer
  ),
  permission: persistReducer(
    persistConfig('permission', []),
    permissionReducer
  ),
  account: persistReducer(persistConfig('account', []), accountReducer),
  client: persistReducer(persistConfig('client', []), clientReducer),
  supplier: persistReducer(persistConfig('supplier', []), supplierReducer),
  orden: persistReducer(persistConfig('orden', []), ordenReducer)
});

export { rootPersistConfig, rootReducer, resetRootReducer };
