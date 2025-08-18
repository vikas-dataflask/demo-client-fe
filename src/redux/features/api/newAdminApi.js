import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const newAdminApi = createApi({
  reducerPath: "newAdminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/backoffice-api/",
    prepareHeaders: (headers, { getState }) => {
      // Get the token from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.token) {
        headers.set("authorization", `Bearer ${user.token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Add your admin API endpoints here
    getAdminData: builder.query({
      query: () => "admin-data",
    }),
    // Example endpoint for admin operations
    createAdminResource: builder.mutation({
      query: (data) => ({
        url: "admin-resource",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useGetAdminDataQuery, useCreateAdminResourceMutation } =
  newAdminApi;
