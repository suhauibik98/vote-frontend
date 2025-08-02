// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logout } from "./slices/authSlice";
import { authApi } from "./apis/authApis";
import { userApi } from "./apis/UserApis";
import { adminApi } from "./apis/AdminApis";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    })
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(adminApi.middleware),
});

// Set global logout dispatcher for timer
window.dispatchLogout = () => store.dispatch(logout());
