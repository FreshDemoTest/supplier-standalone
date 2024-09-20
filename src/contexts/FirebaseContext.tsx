import { useEffect, useReducer, createContext } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { alimaAppDeployment, firebaseConfig } from '../config';

// ----------------------------------------------------------------------

if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
  }
  catch (e) {
    console.error(e);
  }
}

type AuthContextUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  phoneNumber: string;
  photoURL: string;
};

type AuthVerificationType = {
  method: string;
  isVerified: boolean;
  phoneVerificationId: any;
  error: string;
};

type StateType = {
  isAuthenticated: Boolean;
  isInitialized: Boolean;
  verification: AuthVerificationType;
  user: AuthContextUser | null;
  sessionToken: string | null;
  sessionTokenResult: firebase.auth.IdTokenResult | null;
};

const initialVerif: AuthVerificationType = {
  method: '',
  isVerified: false,
  phoneVerificationId: null,
  error: ''
};

const initialState: StateType = {
  isAuthenticated: false,
  isInitialized: false,
  verification: initialVerif,
  user: null,
  sessionToken: null,
  sessionTokenResult: null
  //   employeeAccess: null
};

const reducer = (state: any, action: any) => {
  if (action.type === 'INITIALISE') {
    const { isAuthenticated, user, isVerified } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      verification: {
        ...state.verification,
        isVerified: isVerified
      },
      user: user
    };
  }
  if (action.type === 'SMS_VERIFICATION') {
    const { phoneVerificationId, isVerified, error } = action.payload;
    return {
      ...state,
      verification: {
        ...state.verification,
        method: 'sms',
        phoneVerificationId: phoneVerificationId,
        isVerified: isVerified,
        error: error
      }
    };
  }
  if (action.type === 'EMAIL_VERIFICATION') {
    const { isVerified, error } = action.payload;
    return {
      ...state,
      verification: {
        ...state.verification,
        method: 'email',
        isVerified: isVerified,
        error: error
      }
    };
  }
  if (action.type === 'UPDATE_SESSION') {
    const { tokenResult } = action.payload;
    return {
      ...state,
      sessionToken: tokenResult?.token,
      sessionTokenResult: tokenResult
    };
  }
  return state;
};

const AuthContext = createContext({
  ...initialState,
  method: 'firebase',
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise.resolve(),
  login: (email: string, password: string) => Promise.resolve(),
  loginWithGoogle: () => Promise.resolve(),
  //   loginWithFaceBook: () => Promise.resolve(),
  //   loginWithTwitter: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  resetPassword: (email: string) => Promise.resolve(),
  getSessionToken: () => Promise.resolve(),
  sendPhoneNumberValidation: (verifierContainer: string, phoneNumber: string) =>
    Promise.resolve(),
  sendEmailValidation: () => Promise.resolve(),
  verifyPhoneNumberCode: (verificationCode: string) => Promise.resolve()
  //   getEmployeeAccessData: () => Promise.resolve(),
  //   isSectionAuthorized: (section, employeeData) => Promise.resolve() // eslint-disable-line no-unused-vars
});

type AuthProviderProps = {
  children?: any;
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(
    () =>
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          const _isVerified = user.emailVerified || user.phoneNumber !== null;
          dispatch({
            type: 'INITIALISE',
            payload: {
              isAuthenticated: true,
              user: user,
              isVerified: _isVerified
            }
          });
        } else {
          // Not Authenticated - firebase returned null user
          dispatch({
            type: 'INITIALISE',
            payload: { isAuthenticated: false, user: null, isVerified: false }
          });
        }
      }), // eslint-disable-next-line react-hooks/exhaustive-deps
    [dispatch]
  );

  const login = (email: string, password: string) =>
    firebase.auth().signInWithEmailAndPassword(email, password);

  const loginWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider);
  };

  // const loginWithFaceBook = () => {
  //   const provider = new firebase.auth.FacebookAuthProvider();
  //   return firebase.auth().signInWithPopup(provider);
  // };

  //   const loginWithTwitter = () => {
  //     const provider = new firebase.auth.TwitterAuthProvider();
  //     return firebase.auth().signInWithPopup(provider);
  //   };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => {
    const res = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);

    if (res.user) {
      res.user.updateProfile({
        displayName: `${firstName} ${lastName}`
      });
      // Routine to save info into backend.
    }
  };

  const logout = async () => {
    await firebase.auth().signOut();
  };

  const resetPassword = async (email: string) => {
    await firebase.auth().sendPasswordResetEmail(email);
  };

  const getSessionToken = async () => {
    const currUser = firebase.auth().currentUser;
    dispatch({
      type: 'UPDATE_SESSION',
      payload: {
        tokenResult: await currUser?.getIdTokenResult(true) || null,
      }
    });
  };

  const sendPhoneNumberValidation = async (
    verifierContainer: string,
    phoneNumber: string
  ) => {
    firebase.auth().languageCode = 'es';
    try {
      const fireAppVerifier = new firebase.auth.RecaptchaVerifier(
        verifierContainer,
        {
          size: 'invisible',
          callback: async () => {
            console.log('recaptcha ready');
          }
        }
      );
      fireAppVerifier.render().then(async () => {
        try {
          const provider = new firebase.auth.PhoneAuthProvider();
          const verifId = await provider.verifyPhoneNumber(
            phoneNumber,
            fireAppVerifier
          );
          // Testing verif code: 556678
          dispatch({
            type: 'SMS_VERIFICATION',
            payload: {
              phoneVerificationId: verifId,
              isVerified: false,
              error: ''
            }
          });
        } catch (error) {
          console.error(error);
          dispatch({
            type: 'SMS_VERIFICATION',
            payload: {
              phoneVerificationId: '',
              isVerified: false,
              error: 'sms_sending_phone_validation_issue'
            }
          });
        }
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'SMS_VERIFICATION',
        payload: {
          phoneVerificationId: '',
          isVerified: false,
          error: 'sms_sending_phone_validation_issue'
        }
      });
    }
  };

  const sendEmailValidation = () => {
    firebase.auth().currentUser?.sendEmailVerification({
      url: `${alimaAppDeployment.publicUrl}/app`
    })
      .then(() => {
      dispatch({
        type: 'EMAIL_VERIFICATION',
        payload: {
          isVerified: false,
          error: ''
        }
      });
    }).catch((error) => {
      console.error(error);
      dispatch({
        type: 'EMAIL_VERIFICATION',
        payload: {
          isVerified: false,
          error: 'email_sending_validation_issue'
        }
      });
    });
  };

  const verifyPhoneNumberCode = async (verificationCode: string) => {
    try {
      // get current user
      const prevUser = firebase.auth().currentUser; 
      // verify phone number
      const phoneCred = await firebase.auth.PhoneAuthProvider.credential(
        state.verification.phoneVerificationId,
        verificationCode
      );
      const linkResult = await prevUser?.linkWithCredential(phoneCred);
      if (!linkResult) {
        throw Error("Not able to sign in with Phone number!");
      }
      dispatch({
        type: 'SMS_VERIFICATION',
        payload: {
          phoneVerificationId: state.verification.phoneVerificationId,
          isVerified: true,
          error: ''
        }
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'SMS_VERIFICATION',
        payload: {
          phoneVerificationId: state.phoneVerificationId,
          isVerified: false,
          error: 'sms_verifying_phone_validation_issue'
        }
      });
    }
  };

  //   const getEmployeeAccessData = async () => {
  //     // Get session token
  //     const _token = await getSessionToken();
  //     // Call API endpoint
  //     let _endpoint = (alimaApiConfig.host || '').toString();
  //     _endpoint += '/management/v2/employeeAccess';
  //     const _heads = new Headers([['Authorization', `employeeBasic ${_token}`]]);
  //     return fetch(_endpoint, { method: 'GET', headers: _heads }).then((req) => {
  //       if (req.status === 200) {
  //         return req.json();
  //       }
  //       throw 'Access Denegado: Usuario sin permisos!'; // eslint-disable-line no-throw-literal
  //     });
  //   };

  //   const isSectionAuthorized = (section, employeeData) => {
  //     const sectionIndex = Object.fromEntries(
  //       employeeData.sections.map((v) => [`${v.section_name}/${v.subsection_name}`, v])
  //     );
  //     if (!(section in sectionIndex)) {
  //       return {}; // if section not in Index: return empty access
  //     }
  //     const thisSection = sectionIndex[section];
  //     const authRolesSet = new Set(employeeData.roles);
  //     // if allowed roles are in queried section -> return section
  //     if (thisSection.allowed_roles.map((v) => authRolesSet.has(v)).reduce((a, b) => a || b)) {
  //       return thisSection;
  //     }
  //     return {};
  //   };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'firebase',
        user: {
          id: state.user?.uid || '',
          email: state.user?.email || '',
          displayName: state.user?.displayName || '',
          role: state.user?.role || '',
          phoneNumber: state.user?.phoneNumber || '',
          photoURL: ''
        } as AuthContextUser,
        login,
        register,
        loginWithGoogle,
        // loginWithFaceBook,
        // loginWithTwitter,
        logout,
        resetPassword,
        getSessionToken,
        sendPhoneNumberValidation,
        verifyPhoneNumberCode,
        sendEmailValidation
        // getEmployeeAccessData,
        // setRoleTag,
        // isSectionAuthorized
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
