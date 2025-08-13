import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const floorRoomApi = createApi({
  reducerPath: "floorRoomApi",
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
  tagTypes: ["Floor", "Room"],
  endpoints: (builder) => ({
    // Floor endpoints
    getFloorsByProject: builder.query({
      query: (projectId) => {
        console.log('🔍 API: Fetching floors for projectId---------------------:', _id);
        return `/floors?projectId=${projectId}`;
      },
      transformResponse: (response, meta, arg) => {
        console.log('🔍 API: Raw floor response:', response);
        
        // Get current user ID from localStorage
        const storedUser = localStorage.getItem("user");
        let currentUserId = null;
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            currentUserId = user.user_id || user._id;
          } catch (e) {
            console.error("Failed to parse user from localStorage", e);
          }
        }
        
        console.log('🔍 API: Current user ID:', currentUserId);
        
        // Filter floors to only show those created by the current user and assigned to current project
        if (response && response.data && Array.isArray(response.data)) {
          console.log('🔍 API: Raw floors from backend:', response.data);
          console.log('🔍 API: Current user ID:', currentUserId);
          console.log('🔍 API: Current project ID:', arg);
          
          // Temporarily disable filtering to see all floors
          const filteredFloors = response.data; // Remove filtering temporarily
          
          console.log('🔍 API: After filtering (disabled):', filteredFloors.length, 'floors');
          
          console.log('🔍 API: Filtered floors for user:', filteredFloors.length, 'out of', response.data.length);
          
          return {
            ...response,
            data: filteredFloors
          };
        }
        
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('❌ API: Floor query error response:', response);
        return response;
      },
      providesTags: (result, error, projectId) => {
        console.log('🔍 API: Floor query result:', { result, error, projectId });
        return result
          ? [
              ...(result.data || []).map(({ _id }) => ({ type: "Floor", id: _id })),
              { type: "Floor", id: "LIST" },
            ]
          : [{ type: "Floor", id: "LIST" }];
      },
    }),

    createFloor: builder.mutation({
      query: (floorData) => {
        // Get current user ID from localStorage
        const storedUser = localStorage.getItem("user");
        let currentUserId = null;
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            currentUserId = user.user_id || user._id;
          } catch (e) {
            console.error("Failed to parse user from localStorage", e);
          }
        }
        
        // Get current project ID from Redux state
        const currentProjectId = floorData.projectId;
        
        // Add user ID and project ID to floor data
        const floorDataWithUserProject = {
          ...floorData,
          createdBy: currentUserId,
          projectId: currentProjectId,
          description: floorData.description || `${floorData.name} - ${floorData.shape || 'rectangle'} floor`
        };
        
        console.log('🚀 Floor API Call - URL:', "/floors");
        console.log('🚀 Floor API Call - Data:', floorDataWithUserProject);
        return {
          url: "/floors",
          method: "POST",
          body: floorDataWithUserProject,
        };
      },
      transformErrorResponse: (response) => {
        console.log('❌ Floor API Error Response:', response);
        return response;
      },
      invalidatesTags: [{ type: "Floor", id: "LIST" }],
    }),

    updateFloor: builder.mutation({
      query: ({ floorId, floorData }) => ({
        url: `/floors/${floorId}`,
        method: "PATCH",
        body: floorData,
      }),
      invalidatesTags: (result, error, { floorId }) => [
        { type: "Floor", id: floorId },
        { type: "Floor", id: "LIST" },
      ],
    }),

    deleteFloor: builder.mutation({
      query: (floorId) => ({
        url: `/floors/${floorId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Floor", id: "LIST" }],
    }),

    // Room endpoints
    getRoomsByFloor: builder.query({
      query: (floorId) => {
        console.log('🔍 API: Fetching rooms for floorId:', floorId);
        // Use floorId directly as the backend expects floorId
        return `/rooms?floorId=${floorId}`;
      },
      transformResponse: (response, meta, arg) => {
        console.log('🔍 API: Raw room response:', response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error('❌ API: Room query error response:', response);
        return response;
      },
      providesTags: (result, error, floorId) => {
        console.log('🔍 API: Room query result:', { result, error, floorId });
        return result
          ? [
              ...(result.data || []).map(({ _id }) => ({ type: "Room", id: _id })),
              { type: "Room", id: "LIST" },
            ]
          : [{ type: "Room", id: "LIST" }];
      },
    }),

    createRoom: builder.mutation({
      query: (roomData) => {
        // Use floorId directly as the backend expects floorId
        console.log('🔍 API: Creating room with data:', roomData);
        return {
          url: "/rooms",
          method: "POST",
          body: roomData,
        };
      },
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),

    updateRoom: builder.mutation({
      query: ({ roomId, roomData }) => ({
        url: `/rooms/${roomId}`,
        method: "PATCH",
        body: roomData,
      }),
      invalidatesTags: (result, error, { roomId }) => [
        { type: "Room", id: roomId },
        { type: "Room", id: "LIST" },
      ],
    }),

    deleteRoom: builder.mutation({
      query: (roomId) => ({
        url: `/rooms/${roomId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Room", id: "LIST" }],
    }),
  }),
});

export const {
  useGetFloorsByProjectQuery,
  useCreateFloorMutation,
  useUpdateFloorMutation,
  useDeleteFloorMutation,
  useGetRoomsByFloorQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = floorRoomApi;
