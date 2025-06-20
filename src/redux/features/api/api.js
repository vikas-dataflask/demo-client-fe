import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (newUser) => ({
        url: "api/auth/signup",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["User"],
    }),

    login: builder.mutation({
      query: (User) => ({
        url: `api/auth/login`,
        method: "POST",
        body: User,
      }),
      invalidatesTags: ["User"],
    }),

    addProject: builder.mutation({
      query: (formData) => ({
        url: "api/project",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Project"],
    }),

    getProjectList: builder.query({
      query: (id) => ({
        url: "api/project",
        method: "GET",
      }),
      providesTags: ["Project", "QE"],
    }),

    deleteProject: builder.mutation({
      query: (id) => ({
        url: `api/project/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),

    getProjectListById: builder.query({
      query: (id) => ({
        url: `api/project/${id}`,
        method: "GET",
      }),
    }),
    addFireHL: builder.mutation({
      query: (body) => ({
        url: `api/fireheadloss`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["FireHeadLoss"],
    }),
    addFirePump: builder.mutation({
      query: (body) => ({
        url: `api/firepump`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Firepump"],
    }),
    addHeatLoad: builder.mutation({
      query: (body) => ({
        url: `api/heatload`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["HeatLoad"],
    }),
    addVentilation: builder.mutation({
      query: (body) => ({
        url: `api/ventilation`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Ventilation"],
    }),
    addWaterDemand: builder.mutation({
      query: (body) => ({
        url: `api/waterdemand`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WaterDemand"],
    }),
    addWaterSupplyPipes: builder.mutation({
      query: (body) => ({
        url: `api/watersupplypipes`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WaterSupplyPipes"],
    }),
    addDrainagePipes: builder.mutation({
      query: (body) => ({
        url: `api/drainagepipes`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DrainagePipes"],
    }),
    addPlumbingPump: builder.mutation({
      query: (body) => ({
        url: `api/plumbingpump`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlumbingPump"],
    }),
    addRwhSizing: builder.mutation({
      query: (body) => ({
        url: `api/rwhsizing`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["RWHSizing"],
    }),
    addRainwaterDropSizing: builder.mutation({
      query: (body) => ({
        url: `api/rainwaterdropsizing`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["RainwaterDropSizing"],
    }),
    addQE: builder.mutation({
      query: (data) => ({
        url: "api/qe",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["QE", "Project"],
    }),
    getQEList: builder.query({
      query: (id) => ({
        url: "api/qe",
        method: "GET",
      }),
      providesTags: ["QE"],
    }),
    deleteQE: builder.mutation({
      query: (id) => ({
        url: `api/qe/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["QE"],
    }),
    getQEListById: builder.query({
      query: (id) => ({
        url: `api/qe/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "QE", id }],
    }),
   // NEW: Mutation for updating Quantity Extraction data for a specific project
    updateQE: builder.mutation({
      query: ({ projectId, updatedData  }) => ({
        url: `api/qe/${projectId}`, // Assuming you want to update QE for a specific project
        method: "PATCH", // Use PUT for updating an existing resource
        body: updatedData,
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: "QE", id: projectId }, { type: "Project", id: projectId }], // Invalidate QE and Project tags
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useAddProjectMutation,
  useGetProjectListQuery,
  useGetProjectListByIdQuery,
  useDeleteProjectMutation,
  useAddFireHLMutation,
  useAddFirePumpMutation,
  useAddHeatLoadMutation,
  useAddVentilationMutation,
  useAddWaterDemandMutation,
  useAddWaterSupplyPipesMutation,
  useAddDrainagePipesMutation,
  useAddPlumbingPumpMutation,
  useAddRwhSizingMutation,
  useAddRainwaterDropSizingMutation,
  useAddQEMutation,
  useGetQEListQuery,
  useDeleteQEMutation,
  useGetQEListByIdQuery,
   useUpdateQEMutation,
} = apiSlice;
