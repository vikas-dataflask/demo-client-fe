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
    addBuildingWaterDemand: builder.mutation({
      query: (body) => ({
        url: `api/water-demand/calculate-building`,
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
    getBuildingList: builder.mutation({
      query: () => ({
        url: "/api/water-demand/building-list",
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
    // addPlumbingHL: builder.mutation({
    //   query: (body) => ({
    //     url: `api/plumbingheadloss`,
    //     method: "POST",
    //     body,
    //   }),
    //   invalidatesTags: ["PlumbingHeadLoss"],
    // }),
    // addPlumbingPump: builder.mutation({
    //   query: (body) => ({
    //     url: `api/plumbingpump`,
    //     method: "POST",
    //     body,
    //   }),
    //   invalidatesTags: ["PlumbingPump"],
    // }),
    addRwhSizing: builder.mutation({
      query: (body) => ({
        url: `api/rwh/calculate`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["RWHSizing"],
    }),
    saveRwhData: builder.mutation({
      query: (payload) => ({
        url: "api/rwh",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["RWHData"],
    }),
    getRwhDataByProject: builder.query({
      query: (projectId) => `api/rwh/${projectId}`,
      providesTags: ["RWHData"],
    }),
    deleteRwhData: builder.mutation({
      query: (projectId) => ({
        url: `api/rwh/${projectId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RWHData"],
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
    addFirePump: builder.mutation({
      query: (data) => ({
        url: "api/fire/calculate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["FirePump"],
    }),
    getFirePumpByProject: builder.query({
      query: (project_id) => `api/fire/${project_id}`,
      providesTags: ["FirePump"],
    }),
    saveWaterSupplyPipe: builder.mutation({
      query: (payload) => ({
        url: "api/water-supply-pipes",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["WaterSupplyPipe"],
    }),
    getWaterSupplyPipe: builder.query({
      query: (project_id) => `api/water-supply-pipes/${project_id}`,
      providesTags: ["WaterSupplyPipe"],
    }),
    addPlumbingHL: builder.mutation({
      query: (body) => ({
        url: `api/plumbing-head-loss`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["PlumbingHeadLoss"],
    }),
    getPlumbingHLByProject: builder.query({
      query: (project_id) => `api/plumbing-head-loss/${project_id}`,
      providesTags: ["PlumbingHeadLoss"],
    }),
    addPlumbingPump: builder.mutation({
      query: (data) => ({
        url: "api/plumbing/calculate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PlimbingPump"],
    }),
    getPlumbingPumpByProject: builder.query({
      query: (project_id) => `api/plumbing/${project_id}`,
      providesTags: ["PlumbingPump"],
    }),
    saveDrainagePipe: builder.mutation({
      query: (data) => ({
        url: "api/drainage-pipes/drainage-pipe",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DrainagePipe"],
    }),

    // Get Drainage Pipe by Project ID
    getDrainagePipeByProject: builder.query({
      query: (projectId) => `api/drainage-pipes/drainage-pipe/${projectId}`,
      providesTags: ["DrainagePipe"],
    }),
    saveRainwaterDrop: builder.mutation({
      query: (data) => ({
        url: "api/rainwater-drops/rainwater-drop",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RainwaterDrop"],
    }),

    // Get Rainwater Drop by Project ID
    getRainwaterDropByProject: builder.query({
      query: (projectId) => `api/rainwater-drops/rainwater-drop/${projectId}`,
      providesTags: ["RainwaterDrop"],
    }),

    // Add this new endpoint
    deleteProfilePic: builder.mutation({
      query: () => ({
        url: `api/user/delete-profile-pic`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    updateUserProfile: builder.mutation({
      query: (updatedProfileData) => ({
        url: "api/user/profile",
        method: "PUT",
        body: updatedProfileData,
      }),
      invalidatesTags: ["User"],
    }),
    // New endpoint for changing password
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: `api/user/change-password`,
        method: "PUT", // Or POST, depending on your backend preference for this action
        body: passwordData,
      }),
    }),
    uploadProfilePic: builder.mutation({
      query: (formData) => ({
        url: "api/user/upload-profile-pic",
        method: "POST",
        body: formData,
        // RTK Query will automatically set the headers for a FormData body
      }),
      invalidatesTags: ["User"],
    }),
    saveBreaker: builder.mutation({
      query: (data) => ({
        url: "api/breaker/save",
        method: "POST",
        body: data,
      }),
    }),
    getBreaker: builder.query({
      query: (projectId) => `api/breaker/${projectId}`,
    }),
    calculateCableSize: builder.mutation({
      query: (data) => ({
        url: "api/cable-sizing/calculate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CableSizing"],
    }),
    bulkCalculateCableSize: builder.mutation({
      query: (data) => ({
        url: "api/cable-sizing/bulk-calculate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CableSizing"],
    }),
    getCableSizes: builder.query({
      query: () => "api/cable-sizing/cable-sizes",
      providesTags: ["CableSizing"],
    }),
    getMCBRatings: builder.query({
      query: () => "api/cable-sizing/mcb-ratings",
      providesTags: ["CableSizing"],
    }),
    getReferenceData: builder.query({
      query: () => "api/cable-sizing/reference",
      providesTags: ["CableSizing"],
    }),
    getCalculationHistory: builder.query({
      query: () => "api/cable-sizing/history", // this route can be implemented later if needed
      providesTags: ["CableSizing"],
    }),
    saveCableSizingData: builder.mutation({
      query: (data) => ({
        url: "api/cable-sizing/save",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CableSizing"],
    }),
    getCableSizingByProject: builder.query({
      query: (projectId) => `api/cable-sizing/${projectId}`,
      providesTags: ["CableSizing"],
    }),
    calculateTraySize: builder.mutation({
      query: (data) => ({
        url: "api/cable-tray/calculate",
        method: "POST",
        body: data,
      }),
    }),
    saveTrayCalculation: builder.mutation({
      query: (data) => ({
        url: "api/cable-tray/save",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CableTray"],
    }),
    getTrayCalculation: builder.query({
      query: (projectId) => `api/cable-tray/get/${projectId}`,
      providesTags: ["CableTray"],
    }),
    updateTrayCalculation: builder.mutation({
      query: ({ projectId, ...data }) => ({
        url: `api/cable-tray/update/${projectId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["CableTray"],
    }),
    getCableTrayReferenceData: builder.query({
      query: () => "api/cable-tray/reference",
    }),
    getCableTrayCableSizes: builder.query({
      query: () => "api/cable-tray/cable-sizes",
    }),
    getCableTrayTraySizes: builder.query({
      query: () => "api/cable-tray/tray-sizes",
    }),
    getCableTrayTrayTypes: builder.query({
      query: () => "api/cable-tray/tray-types",
    }),
    addEarthmatCalculation: builder.mutation({
      query: (data) => ({
        url: "api/earthmat/calculate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Earthmat"],
    }),
    getEarthmatAutofill: builder.query({
      query: (projectId) => `api/earthmat/autofill/${projectId}`,
      providesTags: ["Earthmat"],
    }),
    updateEarthmatCalculation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `api/earthmat/update/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Earthmat"],
    }),
    getEarthmatReference: builder.query({
      query: () => "api/earthmat/reference",
      providesTags: ["Earthmat"],
    }),
    getBuildingStandards: builder.query({
      query: () => "api/water-demand-v2/building-standards",
    }),
    // ✅ Calculate single standard building
    calculateStandardWaterDemand: builder.mutation({
      query: (data) => ({
        url: "api/water-demand-v2/calculate",
        method: "POST",
        body: data,
      }),
    }),

    // ✅ Calculate custom building
    calculateCustomBuildingDemand: builder.mutation({
      query: (data) => ({
        url: "api/water-demand-v2/calculate-custom",
        method: "POST",
        body: data,
      }),
    }),

    // ✅ Calculate multiple buildings
    calculateAllSelectedBuildings: builder.mutation({
      query: (data) => ({
        url: "api/water-demand-v2/calculate-multiple",
        method: "POST",
        body: data,
      }),
    }),
    // ✅ 1. Get Standard Building Types
    getStandardBuildingTypes: builder.query({
      query: () => `api/water-demand-v2/standards`,
    }),

    // ✅ 2. Save or Update Water Demand (Calculate + Save)
    saveOrUpdateWaterDemand: builder.mutation({
      query: (data) => ({
        url: `api/water-demand-v2/save-or-update`,
        method: "POST",
        body: data,
      }),
    }),

    // ✅ 3. Get Saved Water Demand (Autofill)
    getWaterDemandByProject: builder.query({
      query: ({ projectId, buildingType }) =>
        `api/water-demand-v2/get?projectId=${projectId}&buildingType=${buildingType}`,
    }),

    // ✅ 4. Calculate Multiple Buildings (No DB Save)
    calculateMultipleWaterDemands: builder.mutation({
      query: (data) => ({
        url: `api/water-demand-v2/calculate-multiple`,
        method: "POST",
        body: data,
      }),
    }),
    getSprinklerLayout: builder.query({
      query: ({ projectId, roomId }) => {
        let url = `api/sprinkler-layout/?projectId=${projectId}`;
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
        url: "api/sprinkler-layout/save",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "SprinklerLayout", id: "LIST" }],
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
