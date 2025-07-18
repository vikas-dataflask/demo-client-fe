import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000/api",
    prepareHeaders: (headers) => {
      // --- START OF FIX ---
      const storedUser = localStorage.getItem("user");
      let token = null;
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          token = user.token;
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
          // Optionally, clear invalid item from localStorage if it's corrupted
          localStorage.removeItem("user");
        }
      }
      // --- END OF FIX ---

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: [
    "User",
    "Project",
    "QE",
    "FireHeadLoss",
    "Firepump",
    "HeatLoad",
    "Ventilation",
    "Duct Size",
    "Grille Size",
    "AHU",
    "Chiller",
    "Condenser",
    "WaterDemand",
    "WaterSupplyPipes",
    "DrainagePipes",
    "PlumbingHeadLoss",
    "PlumbingPump",
    "RWHSizing",
    "RainwaterDropSizing",
  ],

  endpoints: (builder) => ({
    // ... (All your existing endpoints) ...
    signup: builder.mutation({
      query: (newUser) => ({
        url: "auth/signup",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["User"],
    }),

    login: builder.mutation({
      query: (User) => ({
        url: `auth/login`,
        method: "POST",
        body: User,
      }),
      invalidatesTags: ["User"],
    }),

    addProject: builder.mutation({
      query: (formData) => ({
        url: "project",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Project"],
    }),

    getProjectList: builder.query({
      query: (id) => ({
        url: "project",
        method: "GET",
      }),
      providesTags: ["Project", "QE"],
    }),

    deleteProject: builder.mutation({
      query: (id) => ({
        url: `project/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Project"],
    }),

    getProjectListById: builder.query({
      query: (id) => ({
        url: `project/${id}`,
        method: "GET",
      }),
    }),
    addFireHL: builder.mutation({
      query: (body) => ({
        url: `api/fire-head-loss`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["FireHeadLoss"],
    }),
    getFireHLByProject: builder.query({
      query: (project_id) => `api/fire-head-loss/${project_id}`,
      providesTags: ["FireHeadLoss"],
    }),
    // addFirePump: builder.mutation({
    //   query: (body) => ({
    //     url: `api/firepump`,
    //     method: "POST",
    //     body,
    //   }),
    //   invalidatesTags: ["Firepump"],
    // }),
    addHeatLoad: builder.mutation({
      query: (body) => ({
        url: `heatload`,
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
        url: `duct/size`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Duct Size"],
    }),
    calculateGrilleSize: builder.mutation({
      query: (body) => ({
        url: `hvac/size`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Grille Size"],
    }),
    calculateAHU: builder.mutation({
      query: (body) => ({
        url: `ahu`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AHU"],
    }),
    calculateFittingLosses: builder.mutation({
      query: (body) => ({
        url: `hvac/fitting-losses`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AHU"],
    }),
    calculateTotalAHUPressureDrop: builder.mutation({
      query: (body) => ({
        url: `hvac/total-pressure-drop`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AHU"],
    }),
    getStandardFittings: builder.query({
      query: () => ({
        url: `hvac/standard-fittings`,
        method: "GET",
      }),
      providesTags: ["AHU"],
    }),
    calculateChiller: builder.mutation({
      query: (body) => ({
        url: `chiller`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chiller"],
    }),
    calculateChillerPressureDrop: builder.mutation({
      query: (body) => ({
        url: `hvac/chiller-pressure-drop`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chiller"],
    }),
    getFluidProperties: builder.query({
      query: ({ fluidType, temperatureC }) => ({
        url: `hvac/fluid-properties?fluidType=${fluidType}&temperatureC=${temperatureC}`,
        method: "GET",
      }),
      providesTags: ["Chiller"],
    }),
    getFluidTypes: builder.query({
      query: () => ({
        url: `hvac/fluid-types`,
        method: "GET",
      }),
      providesTags: ["Chiller"],
    }),
    calculateCondenser: builder.mutation({
      query: (body) => ({
        url: `condenser`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Condenser"],
    }),

    addWaterDemand: builder.mutation({
      query: (body) => ({
        url: `water-demand/calculate`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WaterDemand"],
    }),
    getBuildingType: builder.mutation({
      query: () => ({
        url: "water-demand/building-types",
        method: "GET",
      }),
      invalidatesTags: ["WaterDemand"],
    }),

    addWaterSupplyPipes: builder.mutation({
      query: (body) => ({
        url: `watersupplypipes`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WaterSupplyPipes"],
    }),
    addDrainagePipes: builder.mutation({
      query: (body) => ({
        url: `drainagepipes`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DrainagePipes"],
    }),
    addPlumbingHL: builder.mutation({
      query: (body) => ({
        url: `plumbingheadloss`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlumbingHeadLoss"],
    }),
    addPlumbingPump: builder.mutation({
      query: (body) => ({
        url: `plumbingpump`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlumbingPump"],
    }),
    addRwhSizing: builder.mutation({
      query: (body) => ({
        url: `rwh/calculate`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["RWHSizing"],
    }),
    addRainwaterDropSizing: builder.mutation({
      query: (body) => ({
        url: `rainwaterdropsizing`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["RainwaterDropSizing"],
    }),
    addQE: builder.mutation({
      query: (data) => ({
        url: "qe",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["QE", "Project"],
    }),
    getQEList: builder.query({
      query: (id) => ({
        url: "qe",
        method: "GET",
      }),
      providesTags: ["QE"],
    }),
    deleteQE: builder.mutation({
      query: (id) => ({
        url: `qe/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["QE"],
    }),
    getQEListById: builder.query({
      query: (id) => ({
        url: `qe/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "QE", id }],
    }),
    updateQE: builder.mutation({
      query: ({ projectId, updatedData }) => ({
        url: `qe/${projectId}`,
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: "QE", id: projectId },
        { type: "Project", id: projectId },
      ],
    }),
    addHeatLoadToDb: builder.mutation({
      query: (payload) => ({
        url: "heatload/store",
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
    addFirePump: builder.mutation({
      query: (data) => ({
        url: "api/calculate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FirePump"],
    }),
    getFirePumpByProject: builder.query({
      query: (project_id) => `api/${project_id}`,
      providesTags: ["FirePump"],
    }),

    // --> ADD THESE NEW ENDPOINTS <--
    // Add this new endpoint
    deleteProfilePic: builder.mutation({
      query: () => ({
        url: `user/delete-profile-pic`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    updateUserProfile: builder.mutation({
      query: (updatedProfileData) => ({
        url: "user/profile",
        method: "PUT",
        body: updatedProfileData,
      }),
      invalidatesTags: ["User"],
    }),
    // New endpoint for changing password
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: `user/change-password`,
        method: "PUT", // Or POST, depending on your backend preference for this action
        body: passwordData,
      }),
    }),
    uploadProfilePic: builder.mutation({
      query: (formData) => ({
        url: "user/upload-profile-pic",
        method: "POST",
        body: formData,
        // RTK Query will automatically set the headers for a FormData body
      }),
      invalidatesTags: ["User"],
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
  useGetFireHLByProjectQuery,
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
  useCalculateAHUMutation,
  useCalculateFittingLossesMutation,
  useCalculateTotalAHUPressureDropMutation,
  useGetStandardFittingsQuery,
  useCalculateChillerMutation,
  useCalculateChillerPressureDropMutation,
  useGetFluidPropertiesQuery,
  useGetFluidTypesQuery,
  useCalculateCondenserMutation,
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
  // useAddFirePumpMutation,
  useGetFirePumpByProjectQuery,
  // -->  <--
  useUpdateUserProfileMutation,
  useUploadProfilePicMutation,
  useDeleteProfilePicMutation,
  useChangePasswordMutation,
} = apiSlice;
