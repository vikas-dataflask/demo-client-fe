import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders: (headers) => {
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
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
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
        url: `fire-head-loss`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["FireHeadLoss"],
    }),
    getFireHLByProject: builder.query({
      query: (project_id) => `fire-head-loss/${project_id}`,
      providesTags: ["FireHeadLoss"],
    }),
    // addFirePump: builder.mutation({
    //   query: (body) => ({
    //     url: `firepump`,
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
        url: `ventilation`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Ventilation"],
    }),
    // New ventilation data management endpoints
    saveVentilationData: builder.mutation({
      query: (body) => ({
        url: `ventilation/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Ventilation"],
    }),
    getVentilationData: builder.query({
      query: ({ project_id, room }) => ({
        url: `ventilation/${project_id}/${room}`,
        method: "GET",
      }),
      providesTags: (result, error, { project_id, room }) => [
        { type: "Ventilation", id: `${project_id}-${room}` },
      ],
    }),
    updateVentilationData: builder.mutation({
      query: ({ project_id, room, input_data }) => ({
        url: `ventilation/${project_id}/${room}`,
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
        url: `duct-sizing/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DuctSizing"],
    }),
    getDuctSizingData: builder.query({
      query: ({ project_id, room }) => ({
        url: `duct-sizing/${project_id}/${room}`,
        method: "GET",
      }),
      providesTags: (result, error, { project_id, room }) => [
        { type: "DuctSizing", id: `${project_id}-${room}` },
      ],
    }),
    updateDuctSizingData: builder.mutation({
      query: ({ project_id, room, input_data }) => ({
        url: `duct-sizing/${project_id}/${room}`,
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
        url: `ahu-pressure-drop/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AhuPressureDrop"],
    }),
    getAhuPressureDropData: builder.query({
      query: ({ project_id }) => ({
        url: `ahu-pressure-drop/${project_id}`,
        method: "GET",
      }),
      providesTags: (result, error, { project_id }) => [
        { type: "AhuPressureDrop", id: project_id },
      ],
    }),
    updateAhuPressureDropData: builder.mutation({
      query: ({ project_id, input_data }) => ({
        url: `ahu-pressure-drop/${project_id}`,
        method: "PUT",
        body: { input_data },
      }),
      invalidatesTags: (result, error, { project_id }) => [
        { type: "AhuPressureDrop", id: project_id },
      ],
    }),
    // Calculate total system pressure drop for multiple equipment
    calculateTotalSystemPressureDrop: builder.mutation({
      query: (body) => ({
        url: `ahu-pressure-drop/calculate-total-system`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AhuPressureDrop"],
    }),
    // New Chiller pressure drop data management endpoints
    saveChillerPressureDropData: builder.mutation({
      query: (body) => ({
        url: `chiller-pressure-drop/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ChillerPressureDrop"],
    }),
    getChillerPressureDropData: builder.query({
      query: ({ project_id, room }) => ({
        url: `chiller-pressure-drop/${project_id}/${room}`,
        method: "GET",
      }),
      providesTags: (result, error, { project_id, room }) => [
        { type: "ChillerPressureDrop", id: `${project_id}-${room}` },
      ],
    }),
    updateChillerPressureDropData: builder.mutation({
      query: ({ project_id, room, input_data, result_data }) => ({
        url: `chiller-pressure-drop/${project_id}/${room}`,
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
        url: `condenser/save`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Condenser"],
    }),
    getCondenserData: builder.query({
      query: ({ project_id }) => ({
        url: `condenser/${project_id}`,
        method: "GET",
      }),
      providesTags: (result, error, { project_id }) => [
        { type: "Condenser", id: project_id },
      ],
    }),
    updateCondenserData: builder.mutation({
      query: ({ project_id, input_data, result_data }) => ({
        url: `condenser/${project_id}`,
        method: "PUT",
        body: { input_data, result_data },
      }),
      invalidatesTags: (result, error, { project_id }) => [
        { type: "Condenser", id: project_id },
      ],
    }),
    calculateDuctSize: builder.mutation({
      query: (body) => ({
        url: `duct/size`, // Full path relative to your `/api` baseUrl
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
    // New mutation for AHU calculations
    // AHU calculation endpoint (legacy - kept for compatibility)
    calculateAHU: builder.mutation({
      query: (body) => ({
        url: `ahu`, // Full path relative to your `/api` baseUrl
        method: "POST",
        body,
      }),
      invalidatesTags: ["AHU"], // You might want to define a new tag for AHU
    }),
    // New Chiller calculation mutation
    calculateChiller: builder.mutation({
      query: (body) => ({
        url: `chiller`, // New endpoint for Chiller
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chiller"], // Add a new tag for Chiller
    }),
    // Chiller Pressure Drop calculations
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
      // New: Condenser Mutation
      query: (body) => ({
        url: `condenser`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Condenser"], // Add a new tag for Chiller
    }),

    // Fitting losses calculation endpoint
    calculateFittingLosses: builder.mutation({
      query: (body) => ({
        url: `hvac/fitting-losses`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["FittingLosses"],
    }),

    // Standard fittings query endpoint
    getStandardFittings: builder.query({
      query: () => `hvac/standard-fittings`,
      providesTags: ["StandardFittings"],
    }),

    addWaterDemand: builder.mutation({
      query: (body) => ({
        url: `water-demand/calculate`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WaterDemand"],
    }),
    addBuildingWaterDemand: builder.mutation({
      query: (body) => ({
        url: `water-demand/calculate-building`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WaterDemand"],
    }),
    getBuildingType: builder.mutation({
      query: () => ({
        url: "/water-demand/building-types",
        method: "GET",
      }),
      invalidatesTags: ["WaterDemand"],
    }),
    getBuildingList: builder.mutation({
      query: () => ({
        url: "/water-demand/building-list",
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
    // addPlumbingHL: builder.mutation({
    //   query: (body) => ({
    //     url: `plumbingheadloss`,
    //     method: "POST",
    //     body,
    //   }),
    //   invalidatesTags: ["PlumbingHeadLoss"],
    // }),
    // addPlumbingPump: builder.mutation({
    //   query: (body) => ({
    //     url: `plumbingpump`,
    //     method: "POST",
    //     body,
    //   }),
    //   invalidatesTags: ["PlumbingPump"],
    // }),
    addRwhSizing: builder.mutation({
      query: (body) => ({
        url: `rwh/calculate`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["RWHSizing"],
    }),
    saveRwhData: builder.mutation({
      query: (payload) => ({
        url: "rwh",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["RWHData"],
    }),
    getRwhDataByProject: builder.query({
      query: (projectId) => `rwh/${projectId}`,
      providesTags: ["RWHData"],
    }),
    deleteRwhData: builder.mutation({
      query: (projectId) => ({
        url: `rwh/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RWHData"],
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
    // NEW: Mutation for updating Quantity Extraction data for a specific project
    updateQE: builder.mutation({
      query: ({ projectId, updatedData }) => ({
        url: `qe/${projectId}`, // Assuming you want to update QE for a specific project
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
        url: "/heatload/store",
        method: "POST",
        body: payload,
      }),
    }),
    updateHeatLoadInDb: builder.mutation({
      query: ({ project_id, room, input_data, result_data }) => ({
        url: `heatload/update?project_id=${project_id}&room=${encodeURIComponent(
          room
        )}`,
        method: "PUT",
        body: { input_data, result_data },
      }),
    }),
    getHeatLoadAutofill: builder.query({
      query: ({ project_id, room }) =>
        `heatload/autofill?project_id=${project_id}&room=${encodeURIComponent(
          room
        )}`,
    }),
    addFirePump: builder.mutation({
      query: (data) => ({
        url: "fire/calculate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FirePump"],
    }),
    getFirePumpByProject: builder.query({
      query: (project_id) => `fire/${project_id}`,
      providesTags: ["FirePump"],
    }),
    saveWaterSupplyPipe: builder.mutation({
      query: (payload) => ({
        url: "water-supply-pipes",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["WaterSupplyPipe"],
    }),
    getWaterSupplyPipe: builder.query({
      query: (project_id) => `water-supply-pipes/${project_id}`,
      providesTags: ["WaterSupplyPipe"],
    }),
    addPlumbingHL: builder.mutation({
      query: (body) => ({
        url: `plumbing-head-loss`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlumbingHeadLoss"],
    }),
    getPlumbingHLByProject: builder.query({
      query: (project_id) => `plumbing-head-loss/${project_id}`,
      providesTags: ["PlumbingHeadLoss"],
    }),
    addPlumbingPump: builder.mutation({
      query: (data) => ({
        url: "plumbing/calculate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PlimbingPump"],
    }),
    getPlumbingPumpByProject: builder.query({
      query: (project_id) => `plumbing/${project_id}`,
      providesTags: ["PlumbingPump"],
    }),
    saveDrainagePipe: builder.mutation({
      query: (data) => ({
        url: "drainage-pipes/drainage-pipe",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DrainagePipe"],
    }),

    // Get Drainage Pipe by Project ID
    getDrainagePipeByProject: builder.query({
      query: (projectId) => `drainage-pipes/drainage-pipe/${projectId}`,
      providesTags: ["DrainagePipe"],
    }),
    saveRainwaterDrop: builder.mutation({
      query: (data) => ({
        url: "rainwater-drops/rainwater-drop",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RainwaterDrop"],
    }),

    // Get Rainwater Drop by Project ID
    getRainwaterDropByProject: builder.query({
      query: (projectId) => `rainwater-drops/rainwater-drop/${projectId}`,
      providesTags: ["RainwaterDrop"],
    }),

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
    saveBreaker: builder.mutation({
      query: (data) => ({
        url: "breaker/save",
        method: "POST",
        body: data,
      }),
    }),
    getBreaker: builder.query({
      query: (projectId) => `breaker/${projectId}`,
    }),
    calculateCableSize: builder.mutation({
      query: (data) => ({
        url: "cable-sizing/calculate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CableSizing"],
    }),
    bulkCalculateCableSize: builder.mutation({
      query: (data) => ({
        url: "cable-sizing/bulk-calculate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CableSizing"],
    }),
    getCableSizes: builder.query({
      query: () => "cable-sizing/cable-sizes",
      providesTags: ["CableSizing"],
    }),
    getMCBRatings: builder.query({
      query: () => "cable-sizing/mcb-ratings",
      providesTags: ["CableSizing"],
    }),
    getReferenceData: builder.query({
      query: () => "cable-sizing/reference",
      providesTags: ["CableSizing"],
    }),
    getCalculationHistory: builder.query({
      query: () => "cable-sizing/history", // this route can be implemented later if needed
      providesTags: ["CableSizing"],
    }),
    saveCableSizingData: builder.mutation({
      query: (data) => ({
        url: "cable-sizing/save",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CableSizing"],
    }),
    getCableSizingByProject: builder.query({
      query: (projectId) => `cable-sizing/${projectId}`,
      providesTags: ["CableSizing"],
    }),
    calculateTraySize: builder.mutation({
      query: (data) => ({
        url: "cable-tray/calculate",
        method: "POST",
        body: data,
      }),
    }),
    saveTrayCalculation: builder.mutation({
      query: (data) => ({
        url: "cable-tray/save",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CableTray"],
    }),
    getTrayCalculation: builder.query({
      query: (projectId) => `cable-tray/get/${projectId}`,
      providesTags: ["CableTray"],
    }),
    updateTrayCalculation: builder.mutation({
      query: ({ projectId, ...data }) => ({
        url: `cable-tray/update/${projectId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CableTray"],
    }),
    getCableTrayReferenceData: builder.query({
      query: () => "cable-tray/reference",
    }),
    getCableTrayCableSizes: builder.query({
      query: () => "cable-tray/cable-sizes",
    }),
    getCableTrayTraySizes: builder.query({
      query: () => "cable-tray/tray-sizes",
    }),
    getCableTrayTrayTypes: builder.query({
      query: () => "cable-tray/tray-types",
    }),
    addEarthmatCalculation: builder.mutation({
      query: (data) => ({
        url: "earthmat/calculate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Earthmat"],
    }),
    getEarthmatAutofill: builder.query({
      query: (projectId) => `earthmat/autofill/${projectId}`,
      providesTags: ["Earthmat"],
    }),
    updateEarthmatCalculation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `earthmat/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Earthmat"],
    }),
    getEarthmatReference: builder.query({
      query: () => "earthmat/reference",
      providesTags: ["Earthmat"],
    }),
    getBuildingStandards: builder.query({
      query: () => "water-demand-v2/building-standards",
    }),
    // ✅ Calculate single standard building
    calculateStandardWaterDemand: builder.mutation({
      query: (data) => ({
        url: "water-demand-v2/calculate",
        method: "POST",
        body: data,
      }),
    }),

    // ✅ Calculate custom building
    calculateCustomBuildingDemand: builder.mutation({
      query: (data) => ({
        url: "water-demand-v2/calculate-custom",
        method: "POST",
        body: data,
      }),
    }),

    // ✅ Calculate multiple buildings
    calculateAllSelectedBuildings: builder.mutation({
      query: (data) => ({
        url: "water-demand-v2/calculate-multiple",
        method: "POST",
        body: data,
      }),
    }),
    // ✅ 1. Get Standard Building Types
    getStandardBuildingTypes: builder.query({
      query: () => `water-demand-v2/standards`,
    }),

    // ✅ 2. Save or Update Water Demand (Calculate + Save)
    saveOrUpdateWaterDemand: builder.mutation({
      query: (data) => ({
        url: `water-demand-v2/save-or-update`,
        method: "POST",
        body: data,
      }),
    }),

    // ✅ 3. Get Saved Water Demand (Autofill)
    getWaterDemandByProject: builder.query({
      query: ({ projectId, buildingType }) =>
        `water-demand-v2/get?projectId=${projectId}&buildingType=${buildingType}`,
    }),

    // ✅ 4. Calculate Multiple Buildings (No DB Save)
    calculateMultipleWaterDemands: builder.mutation({
      query: (data) => ({
        url: `water-demand-v2/calculate-multiple`,
        method: "POST",
        body: data,
      }),
    }),
    getSprinklerLayout: builder.query({
      query: ({ projectId, roomId }) => {
        let url = `sprinkler-layout/?projectId=${projectId}`;
        if (roomId) url += `&roomId=${roomId}`;
        return url;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "SprinklerLayout",
                id: _id,
              })),
              { type: "SprinklerLayout", id: "LIST" },
            ]
          : [{ type: "SprinklerLayout", id: "LIST" }],
    }),
    saveOrUpdateSprinklerLayout: builder.mutation({
      query: (payload) => ({
        url: "sprinkler-layout/save",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "SprinklerLayout", id: "LIST" }],
    }),
    getDxfEntities: builder.mutation({
      query: (payload) => ({
        url: "dxf",
        method: "POST",
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetDxfEntitiesMutation,
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
  useCalculateTotalSystemPressureDropMutation,
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
  useAddBuildingWaterDemandMutation,
  useGetBuildingTypeMutation,
  useGetBuildingListMutation,
  useAddWaterSupplyPipesMutation,
  useAddDrainagePipesMutation,
  // useAddPlumbingHLMutation,
  // useAddPlumbingPumpMutation,
  useAddRwhSizingMutation,
  useSaveRwhDataMutation,
  useGetRwhDataByProjectQuery,
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
  useSaveWaterSupplyPipeMutation,
  useGetWaterSupplyPipeQuery,
  useAddPlumbingHLMutation,
  useGetPlumbingHLByProjectQuery,
  useAddPlumbingPumpMutation,
  useGetPlumbingPumpByProjectQuery,
  useSaveDrainagePipeMutation,
  useGetDrainagePipeByProjectQuery,
  useSaveRainwaterDropMutation,
  useGetRainwaterDropByProjectQuery,
  useSaveBreakerMutation,
  useGetBreakerQuery,
  useCalculateCableSizeMutation,
  useBulkCalculateCableSizeMutation,
  useGetCableSizesQuery,
  useGetMCBRatingsQuery,
  useGetReferenceDataQuery,
  useGetCalculationHistoryQuery,
  useSaveCableSizingDataMutation,
  useGetCableSizingByProjectQuery,
  useCalculateTraySizeMutation,
  useSaveTrayCalculationMutation,
  useGetTrayCalculationQuery,
  useUpdateTrayCalculationMutation,
  useGetCableTrayReferenceDataQuery,
  useGetCableTrayCableSizesQuery,
  useGetCableTrayTraySizesQuery,
  useGetCableTrayTrayTypesQuery,
  useValidateCableTrayCableSizeMutation,
  useAddEarthmatCalculationMutation,
  useGetEarthmatAutofillQuery,
  useUpdateEarthmatCalculationMutation,
  useGetEarthmatReferenceQuery,
  useGetBuildingStandardsQuery,
  useCalculateStandardWaterDemandMutation,
  useCalculateCustomBuildingDemandMutation,
  useCalculateAllSelectedBuildingsMutation,
  useGetStandardBuildingTypesQuery,
  useSaveOrUpdateWaterDemandMutation,
  useGetWaterDemandByProjectQuery,
  useCalculateMultipleWaterDemandsMutation,
  useGetSprinklerLayoutQuery,
  useLazyGetSprinklerLayoutQuery,
  useSaveOrUpdateSprinklerLayoutMutation,
  useUpdateUserProfileMutation,
  useUploadProfilePicMutation,
  useDeleteProfilePicMutation,
  useChangePasswordMutation,
} = apiSlice;
