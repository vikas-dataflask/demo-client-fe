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
    // New ventilation data management endpoints
    saveVentilationData: builder.mutation({
      query: (body) => ({
        url: `api/ventilation/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Ventilation"],
    }),
    getVentilationData: builder.query({
      query: ({ project_id, room }) => ({
        url: `api/ventilation/${project_id}/${room}`,
        method: "GET",
      }),
      providesTags: (result, error, { project_id, room }) => [
        { type: "Ventilation", id: `${project_id}-${room}` },
      ],
    }),
    updateVentilationData: builder.mutation({
      query: ({ project_id, room, input_data }) => ({
        url: `api/ventilation/${project_id}/${room}`,
        method: "PUT",
        body: { input_data },
      }),
      invalidatesTags: (result, error, { project_id, room }) => [
        { type: "Ventilation", id: `${project_id}-${room}` },
      ],
    }),
    // New duct sizing data management endpoints
    saveDuctSizingData: builder.mutation({
      query: (body) => ({
        url: `api/duct-sizing/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DuctSizing"],
    }),
    getDuctSizingData: builder.query({
      query: ({ project_id, room }) => ({
        url: `api/duct-sizing/${project_id}/${room}`,
        method: "GET",
      }),
      providesTags: (result, error, { project_id, room }) => [
        { type: "DuctSizing", id: `${project_id}-${room}` },
      ],
    }),
    updateDuctSizingData: builder.mutation({
      query: ({ project_id, room, input_data }) => ({
        url: `api/duct-sizing/${project_id}/${room}`,
        method: "PUT",
        body: { input_data },
      }),
      invalidatesTags: (result, error, { project_id, room }) => [
        { type: "DuctSizing", id: `${project_id}-${room}` },
      ],
    }),
    // New AHU pressure drop data management endpoints
    saveAhuPressureDropData: builder.mutation({
      query: (body) => ({
        url: `api/ahu-pressure-drop/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AhuPressureDrop"],
    }),
    getAhuPressureDropData: builder.query({
      query: ({ project_id, room }) => ({
        url: `api/ahu-pressure-drop/${project_id}/${room}`,
        method: "GET",
      }),
      providesTags: (result, error, { project_id, room }) => [
        { type: "AhuPressureDrop", id: `${project_id}-${room}` },
      ],
    }),
    updateAhuPressureDropData: builder.mutation({
      query: ({ project_id, room, input_data }) => ({
        url: `api/ahu-pressure-drop/${project_id}/${room}`,
        method: "PUT",
        body: { input_data },
      }),
      invalidatesTags: (result, error, { project_id, room }) => [
        { type: "AhuPressureDrop", id: `${project_id}-${room}` },
      ],
    }),
    // New Chiller pressure drop data management endpoints
    saveChillerPressureDropData: builder.mutation({
      query: (body) => ({
        url: `api/chiller-pressure-drop/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ChillerPressureDrop"],
    }),
    getChillerPressureDropData: builder.query({
      query: ({ project_id, room }) => ({
        url: `api/chiller-pressure-drop/${project_id}/${room}`,
        method: "GET",
      }),
      providesTags: (result, error, { project_id, room }) => [
        { type: "ChillerPressureDrop", id: `${project_id}-${room}` },
      ],
    }),
    updateChillerPressureDropData: builder.mutation({
      query: ({ project_id, room, input_data, result_data }) => ({
        url: `api/chiller-pressure-drop/${project_id}/${room}`,
        method: "PUT",
        body: { input_data, result_data },
      }),
      invalidatesTags: (result, error, { project_id, room }) => [
        { type: "ChillerPressureDrop", id: `${project_id}-${room}` },
      ],
    }),
    // New Condenser data management endpoints
    saveCondenserData: builder.mutation({
      query: (body) => ({
        url: `api/condenser/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Condenser"],
    }),
    getCondenserData: builder.query({
      query: ({ project_id }) => ({
        url: `api/condenser/${project_id}`,
        method: "GET",
      }),
      providesTags: (result, error, { project_id }) => [
        { type: "Condenser", id: project_id },
      ],
    }),
    updateCondenserData: builder.mutation({
      query: ({ project_id, input_data, result_data }) => ({
        url: `api/condenser/${project_id}`,
        method: "PUT",
        body: { input_data, result_data },
      }),
      invalidatesTags: (result, error, { project_id }) => [
        { type: "Condenser", id: project_id },
      ],
    }),
    calculateDuctSize: builder.mutation({
      query: (body) => ({
        url: `api/duct/size`, // Full path relative to your `/api` baseUrl
        method: "POST",
        body,
      }),
      invalidatesTags: ["Duct Size"],
    }),
    calculateGrilleSize: builder.mutation({
      query: (body) => ({
        url: `api/hvac/size`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Grille Size"],
    }),
    // New mutation for AHU calculations
    calculateAHU: builder.mutation({
      query: (body) => ({
        url: `api/ahu`, // Full path relative to your `/api` baseUrl
        method: "POST",
        body,
      }),
      invalidatesTags: ["AHU"], // You might want to define a new tag for AHU
    }),
    calculateFittingLosses: builder.mutation({
      query: (body) => ({
        url: `api/hvac/fitting-losses`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AHU"],
    }),
    calculateTotalAHUPressureDrop: builder.mutation({
      query: (body) => ({
        url: `api/hvac/total-pressure-drop`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AHU"],
    }),
    getStandardFittings: builder.query({
      query: () => ({
        url: `api/hvac/standard-fittings`,
        method: "GET",
      }),
      providesTags: ["AHU"],
    }),
    // New Chiller calculation mutation
    calculateChiller: builder.mutation({
      query: (body) => ({
        url: `api/chiller`, // New endpoint for Chiller
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chiller"], // Add a new tag for Chiller
    }),
    // Chiller Pressure Drop calculations
    calculateChillerPressureDrop: builder.mutation({
      query: (body) => ({
        url: `api/hvac/chiller-pressure-drop`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chiller"],
    }),
    getFluidProperties: builder.query({
      query: ({ fluidType, temperatureC }) => ({
        url: `api/hvac/fluid-properties?fluidType=${fluidType}&temperatureC=${temperatureC}`,
        method: "GET",
      }),
      providesTags: ["Chiller"],
    }),
    getFluidTypes: builder.query({
      query: () => ({
        url: `api/hvac/fluid-types`,
        method: "GET",
      }),
      providesTags: ["Chiller"],
    }),
    calculateCondenser: builder.mutation({
      // New: Condenser Mutation
      query: (body) => ({
        url: `api/condenser`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Condenser"], // Add a new tag for Chiller
    }),

    addWaterDemand: builder.mutation({
      query: (body) => ({
        url: `api/water-demand/calculate`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WaterDemand"],
    }),
    getBuildingType: builder.mutation({
      query: () => ({
        url: "/api/water-demand/building-types",
        method: "GET",
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
    addPlumbingHL: builder.mutation({
      query: (body) => ({
        url: `api/plumbingheadloss`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlumbingHeadLoss"],
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
        url: `api/rwh/calculate`,
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
      query: ({ projectId, updatedData }) => ({
        url: `api/qe/${projectId}`, // Assuming you want to update QE for a specific project
        method: "PATCH", // Use PUT for updating an existing resource
        body: updatedData,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "QE", id: projectId },
        { type: "Project", id: projectId },
      ], // Invalidate QE and Project tags
    }),
    addHeatLoadToDb: builder.mutation({
      query: (payload) => ({
        url: "/api/heatload/store",
        method: "POST",
        body: payload,
      }),
    }),
    updateHeatLoadInDb: builder.mutation({
      query: ({ project_id, room, input_data, result_data }) => ({
        url: `api/heatload/update?project_id=${project_id}&room=${encodeURIComponent(
          room
        )}`,
        method: "PUT",
        body: { input_data, result_data },
      }),
    }),
    getHeatLoadAutofill: builder.query({
      query: ({ project_id, room }) =>
        `api/heatload/autofill?project_id=${project_id}&room=${encodeURIComponent(
          room
        )}`,
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
  useSaveVentilationDataMutation,
  useGetVentilationDataQuery,
  useUpdateVentilationDataMutation,
  useSaveDuctSizingDataMutation,
  useGetDuctSizingDataQuery,
  useUpdateDuctSizingDataMutation,
  useSaveAhuPressureDropDataMutation,
  useGetAhuPressureDropDataQuery,
  useUpdateAhuPressureDropDataMutation,
  useSaveChillerPressureDropDataMutation,
  useGetChillerPressureDropDataQuery,
  useUpdateChillerPressureDropDataMutation,
  useSaveCondenserDataMutation,
  useGetCondenserDataQuery,
  useUpdateCondenserDataMutation,
  useCalculateDuctSizeMutation,
  useCalculateGrilleSizeMutation,
  useCalculateAHUMutation, // Exported for AHU
  useCalculateFittingLossesMutation,
  useCalculateTotalAHUPressureDropMutation,
  useGetStandardFittingsQuery,
  useCalculateChillerMutation, // Exported for Chiller
  useCalculateChillerPressureDropMutation,
  useGetFluidPropertiesQuery,
  useGetFluidTypesQuery,
  useCalculateCondenserMutation, // Exported for Condenser
  useAddWaterDemandMutation,
  useGetBuildingTypeMutation,
  useAddWaterSupplyPipesMutation,
  useAddDrainagePipesMutation,
  useAddPlumbingHLMutation,
  useAddPlumbingPumpMutation,
  useAddRwhSizingMutation,
  useAddRainwaterDropSizingMutation,
  useAddQEMutation,
  useGetQEListQuery,
  useDeleteQEMutation,
  useGetQEListByIdQuery,
  useUpdateQEMutation,
  useAddHeatLoadToDbMutation,
  useUpdateHeatLoadInDbMutation,
  useGetHeatLoadAutofillQuery,
} = apiSlice;
