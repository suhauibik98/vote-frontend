// // store/slices/authSlice.js
// import { createSlice } from '@reduxjs/toolkit';
// import { setAuthCookies , removeAuthCookies  , getAuthFromCookies} from '../../utils/cookies';

// const initialState = {
//   user: null,
//   token: null,
//   isAuthenticated: false,
//   isLoading: false,
//   error: null,
//   authInitialized: false, // ✅ NEW FLAG

// };


// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     loginStart: (state) => {
//       state.isLoading = true;
//       state.error = null;
//     },
//     loginSuccess: (state, action) => {      
//       const { user, token, expiresIn } = action.payload;
      
//       state.isLoading = false;
//       state.isAuthenticated = true;
//       state.user = user;
//       state.token = token;
//       state.error = null;
      
//       // Set cookies
//       setAuthCookies(token, user, expiresIn);
      
//       // Set auto-logout timer
//       authSlice.caseReducers.setAutoLogoutTimer(state, { payload: expiresIn });
//     },
//     loginFailure: (state, action) => {
//       state.isLoading = false;
//       state.isAuthenticated = false;
//       state.user = null;
//       state.token = null;
//       state.error = action.payload;
      
//       // Remove any existing cookies
//       removeAuthCookies();
//     },
//     logout: (state) => {
//       state.isAuthenticated = false;
//       state.user = null;
//       state.token = null;
//       state.error = null;
      
//       // Remove cookies
//       removeAuthCookies();
      
//       // Clear logout timer
//       if (window.logoutTimer) {
//         clearTimeout(window.logoutTimer);
//         window.logoutTimer = null;
//       }
//     },
//     restoreAuthFromCookies: (state) => {
//       const authData = getAuthFromCookies();
      
//       if (authData) {
//         state.isAuthenticated = true;
//         state.user = authData.user;
//         state.token = authData.token;
//       }
//         state.authInitialized = true; // ✅ Set it whether success or fail
// // console.log("restoreAuthFromCookies called →", {
// //   token: Cookies.get('authToken'),
// //   userData: Cookies.get('userData'),
// // });
//     },
//     setAutoLogoutTimer: (state, action) => {
//       const expiresIn = action.payload || '10m';
//       const expirationMinutes = expiresIn === '10m' ? 10 : 
//                                expiresIn === '1h' ? 60 : 
//                                parseInt(expiresIn) || 10;

//       // Clear existing timer
//       if (window.logoutTimer) {
//         clearTimeout(window.logoutTimer);
//       }

//       // Set new timer (logout 30 seconds before expiry)
//       const timeoutMs = (expirationMinutes * 60 * 1000) - 30000;
      
//       window.logoutTimer = setTimeout(() => {
//         // Dispatch logout action
//         window.dispatchLogout?.();
//       }, timeoutMs);
//     },
//     clearError: (state) => {
//       state.error = null;
//     }
//   },
// });

// export const {
//   loginStart,
//   loginSuccess,
//   loginFailure,
//   logout,
//   restoreAuthFromCookies,
//   setAutoLogoutTimer,
//   clearError
// } = authSlice.actions;

// export default authSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import { setAuthCookies, removeAuthCookies, getAuthFromCookies, setEditProfileUser } from '../../utils/cookies';
import { jwtDecode } from 'jwt-decode';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  authInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
  // Handle both old and new payload structures
  let token, user, expiresIn;
  
  if (action.payload.token && !action.payload.user) {
    // Direct API response format
    token = action.payload.token;
    user = jwtDecode(token); // Decode user from token
    expiresIn = user.exp ? (user.exp * 1000 - Date.now()) : 86400000;
        console.log('🔍 Using direct API format');

  } else {
    // Structured payload format
    ({ user, token, expiresIn = 86400000 } = action.payload);
        console.log('🔍 Using structured format');

  }

  const expiresAt = Date.now() + expiresIn;
console.log('🔍 Before Redux state update:', {
    hasToken: !!token,
    hasUser: !!user,
    currentState: state
  });
  state.isLoading = false;
  state.isAuthenticated = true;
  state.user = user;
  state.token = token;
  state.error = null;

   console.log('🔍 After Redux state update:', {
    reduxToken: state.token ? 'SET' : 'NOT_SET',
    isAuthenticated: state.isAuthenticated
  });
  setAuthCookies(token, user, expiresAt);
  authSlice.caseReducers.setAutoLogoutTimer(state, { payload: expiresAt });
},
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;

      removeAuthCookies();
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;

      removeAuthCookies();

      if (window.logoutTimer) {
        clearTimeout(window.logoutTimer);
        window.logoutTimer = null;
      }
    },
    restoreAuthFromCookies: (state) => {
      const authData = getAuthFromCookies();
      
      if (authData && Date.now() < authData.expiresAt) {
        state.isAuthenticated = true;
        state.user = authData.user;
        state.token = authData.token;

        authSlice.caseReducers.setAutoLogoutTimer(state, { payload: authData.expiresAt });
      }

      state.authInitialized = true;
    },
    setAutoLogoutTimer: (state, action) => {
      const expiresAt = action.payload;
      const timeoutMs = expiresAt - Date.now() - 30000;

      if (window.logoutTimer) clearTimeout(window.logoutTimer);
      if (timeoutMs > 0) {
        window.logoutTimer = setTimeout(() => {
          window.dispatchLogout?.();
        }, timeoutMs);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    editUser:(state , action)=>{

      state.user = action.payload;

      // setEditProfileUser(state.user)
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  restoreAuthFromCookies,
  setAutoLogoutTimer,
  clearError,
  editUser
} = authSlice.actions;

export default authSlice.reducer;
