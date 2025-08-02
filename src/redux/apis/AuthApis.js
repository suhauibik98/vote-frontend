// store/apis/authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

const baseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_URL}`,
  credentials: "include", // Important for cookies
  prepareHeaders: (headers, { getState }) => {
    // Get token from state or cookies
    const token = getState().auth.token || Cookies.get("authToken");

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    headers.set("content-type", "application/json");
    return headers;
  },
});

// Base query with re-auth logic
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Token expired or invalid
    api.dispatch({ type: "auth/logout" });

    // Optional: Try to refresh token here
    // const refreshResult = await baseQuery('/auth/refresh', api, extraOptions);
    // if (refreshResult.data) {
    //   api.dispatch(loginSuccess(refreshResult.data));
    //   result = await baseQuery(args, api, extraOptions);
    // }
  }

  return result;
};

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (credentials) => ({
        url: "/auth/signup",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/signin",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    signout: builder.mutation({
      query: () => ({
        url: "/auth/signout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    verifyToken: builder.query({
      query: () => "/auth/verify",
      providesTags: ["Auth"],
    }),
    
    sendOtp:builder.mutation({
      query: (email) => ({
        url: "/auth/send-otp",
        method: "POST",
        body: email
        }),
    }),
    checkUserValidation:builder.mutation({
      query: (credentials) => ({
        url: "/auth/check-user-validation",
        method: "POST",
        body: credentials
        }),
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useSignoutMutation,
  useVerifyTokenQuery,
  useSendOtpMutation,
  useCheckUserValidationMutation
} = authApi;
