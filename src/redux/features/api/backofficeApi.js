import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const backofficeApi = createApi({
  reducerPath: "backofficeApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/backoffice-api" }),
  endpoints: (builder) => ({
    getServiceList: builder.query({
      query: () => ({
        url: "services",
        method: "GET",
      }),
    }),
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
      query: (building_id) => ({
        url: `sub-buildings?building_id=${building_id}`,
        method: "GET",
      }),
    }),
    getLevelsList: builder.query({
      query: (sub_building_id) => ({
        url: `levels?sub_building_id=${sub_building_id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetServiceListQuery,
  useGetLocationListQuery,
  useGetBuildingListQuery,
  useGetSubBuildingListQuery,
  useGetLevelsListQuery,
} = backofficeApi;
