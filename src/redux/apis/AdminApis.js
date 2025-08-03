// store/apis/authApi.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";
import { logout } from "../slices/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const tokenFromState = getState().auth?.token;
    const tokenFromCookie = Cookies.get("authToken");
    const authState = getState().auth;
    
console.log('🔍 AdminAPI prepareHeaders Debug:');
    console.log('  Redux token:', tokenFromState ? 'EXISTS' : 'NULL');
    console.log('  Cookie token:', tokenFromCookie ? 'EXISTS' : 'NULL');
    console.log('  Auth state:', authState);
    console.log('  All cookies:', document.cookie);
    
    const token = tokenFromState || tokenFromCookie;
        console.log('  Final token used:', token ? 'EXISTS' : 'NOT_FOUND');

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
            console.log('  ✅ Authorization header set');

    }else{
            console.log('  ❌ NO TOKEN - Request will be unauthorized');

    }

    headers.set("content-type", "application/json");
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    console.log('🚀 AdminAPI request:', args); // ✅ ADD REQUEST LOGGING

  let result = await baseQuery(args, api, extraOptions);
  console.log('📥 AdminAPI response:', result); // ✅ ADD RESPONSE LOGGING

  if (result?.error?.status === 401) {
    console.warn("Token expired or unauthorized. Logging out...");
    api.dispatch(logout());
  }

  return result;
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    requests: builder.query({
      query: ({ status = "", page = 1, limit = 10 } = {}) => {
        // Build query parameters properly
        const params = new URLSearchParams();

        if (status) params.append("status", status);
        params.append("page", page);
        params.append("limit", limit);

        return `/admin/requests?${params.toString()}`;
      },
      providesTags: ["Auth"],
    }),
    pendingRequests: builder.query({
      query: ({ page, status }) => {
        return `admin/requests/pending?page=${page}&status=${status}`;
      },
      providesTags: ["Auth"],
    }),
    approveRequest: builder.mutation({
      query: (requestId) => ({
        url: `/admin/requests/${requestId}/approve`,
        method: "POST",
      }),
    }),
    rejectRequest: builder.mutation({
      query: (requestId) => ({
        url: `/admin/requests/${requestId}/reject`,
        method: "POST",
      }),
    }),
    getAlluserName: builder.query({
      query: () => `/admin/users-name`,
    }),
    addNewVote: builder.mutation({
      query: (formData) => ({
        url: `/admin/add-new-vote`,
        method: "POST",
        body: formData,
      }),
    }),
    getEndsVote: builder.query({
      query: ({currentPage ,itemsPerPage }) => `/admin/get-ends-vote?page=${currentPage}&limit=${itemsPerPage}`,
    }),
    getWinnerName: builder.mutation({
      query: ({ winnerId }) => ({
        url: `/admin/get-winner-name/${winnerId}`,
        method: "POST",
      }),
    }),

    getAllActiveVote: builder.query({
      query: () => `/admin/get-all-active-vote`,
    }),
    createNewUser: builder.mutation({
      query: (formData) => ({
        url: `/admin/create-new-user`,
        method: "POST",
        body: formData,
      }),
    }),
    changeUserActivation: builder.mutation({
      query: (userId) => ({
        url: `/admin/change-user-activation/${userId}`,
        method: "POST",
      }),
    }),
    deleteUserAndHisVoted: builder.mutation({
      query: (userId) => ({
        url: `/admin/delete-user-and-his-voted/${userId}`,
        method: "DELETE",
      }),
    }),
    editUser: builder.mutation({
      query: ({formData, userId}) => ({
        url: `/admin/edit-user/${userId}`,
        method: "PUT",
        body: formData,
      }),
    }),
    getUpcommingVote:builder.query({
      query: ({currentPage , itemsPerPage}) => `/admin/get-upcomming-vote?page=${currentPage}&limit=${itemsPerPage}`,
      
    }),
    getDataForDashBoardAdmin:builder.query({
      query: () => `/admin/get-data-dashboard`,
      
    }),
    
  }),
});

export const {
  useAddNewVoteMutation,
  useGetAlluserNameQuery,
  useRequestsQuery,
  usePendingRequestsQuery,
  useApproveRequestMutation,
  useRejectRequestMutation,
  useGetEndsVoteQuery,
  useGetWinnerNameMutation,
  useGetAllActiveVoteQuery,
  useCreateNewUserMutation,
  useChangeUserActivationMutation,
  useDeleteUserAndHisVotedMutation,
  useEditUserMutation,
  useGetUpcommingVoteQuery,
  useGetDataForDashBoardAdminQuery,
  
} = adminApi;
