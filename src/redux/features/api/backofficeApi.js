import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const backofficeApi = createApi({
  reducerPath: "backofficeApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/backoffice-api" }),
  endpoints: (builder) => ({
    getLocationList: builder.query({
      query: () => ({
        url: "locations",
        method: "GET",
      }),
    }),
    getBuildingList: builder.query({
      query: () => ({
        url: "buildings",
        method: "GET",
      }),
    }),
    getSubBuildingList: builder.query({
      query: () => ({
        url: "sub-buildings",
        method: "GET",
      }),
    }),
    getLevelsList: builder.query({
      query: () => ({
        url: "levels",
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetLocationListQuery,
  useGetBuildingListQuery,
  useGetSubBuildingListQuery,
  useGetLevelsListQuery,
} = backofficeApi;
