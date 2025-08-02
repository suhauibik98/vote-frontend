// store/apis/authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { logout } from "../slices/authSlice"; // ✅ Make sure this is correctly imported

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_URL,
  credentials: "include", // ✅ Include cookies in every request
  prepareHeaders: (headers, { getState }) => {
    const tokenFromState = getState().auth?.token;
    const tokenFromCookie = Cookies.get("authToken");
    const token = tokenFromState || tokenFromCookie;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    headers.set("content-type", "application/json");
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    console.warn("Token expired or unauthorized. Logging out...");
    api.dispatch(logout());

    // 🔁 OPTIONAL: Token refresh logic can go here
    // const refreshResult = await baseQuery('/auth/refresh', api, extraOptions);
    // if (refreshResult.data?.token) {
    //   api.dispatch(loginSuccess(refreshResult.data));
    //   result = await baseQuery(args, api, extraOptions);
    // }
  }

  return result;
};

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    editProfile:builder.mutation({
      query: (data) => ({
        url: "/user/edit-profile",
        method: "PATCH",
        body: data
        }),
    }),
    getVoteMainActive: builder.query({
      query: () => "/user/get-vote-main-active",
      providesTags: ["Auth"],
    }),
    userVote: builder.mutation({
      query: ({voteMainId , candidateId}) => ({
        url: `/user/user-vote/${voteMainId}/${candidateId}`,
        method: "POST",
      }),
      providesTags: ["Auth"],
    }),
 
    getVotedListUser: builder.query({
      query: ({currentPage , itemsPerPage}) => `/user/get-voted-list-user?page=${currentPage}&limit=${itemsPerPage}`,
      providesTags: ["Auth"],
    }),
    getComminVote: builder.query({
      query: () => "/user/get-comming-vote",
      providesTags: ["Auth"],
    }),
    getDataForDashBoard: builder.query({
      query: () => "/user/get-data-for-dashboard",
      providesTags: ["Auth"],
    }),
  }),
});

export const { useEditProfileMutation ,useGetDataForDashBoardQuery,useGetComminVoteQuery,useGetVotedListUserQuery, useGetVoteMainActiveQuery, useUserVoteMutation } = userApi;
