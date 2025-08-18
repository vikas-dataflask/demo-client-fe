import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const latestAdminApi = createApi({
  reducerPath: "latestAdminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001",
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Location",
    "BuildingCategory",
    "BuildingType",
    "Floor",
    "Room",
    "EngineeringDiscipline",
    "EngineeringSubCategory",
    "Product",
    "Manufacturer",
    "EngineeringService",
    "EngineeringParameter",
    "EngineeringCalculation",
    "CalculationFieldTemplate",
    "EngineeringDesign",
    "ProductCapacity",
    "SpecTemplate",
    "ProductSpecification",
    "ProductSpec",
  ],
  endpoints: (builder) => ({
    // Health Check
    getHealth: builder.query({
      query: () => "/health",
      providesTags: ["Health"],
    }),

    // Location Management - GET only
    getLocations: builder.query({
      query: () => "/api/locations",
      providesTags: ["Location"],
    }),

    getLocationById: builder.query({
      query: (id) => `/api/locations/${id}`,
      providesTags: (result, error, id) => [{ type: "Location", id }],
    }),

    // Building Category Management - GET only
    getBuildingCategories: builder.query({
      query: () => "/api/building-categories",
      providesTags: ["BuildingCategory"],
    }),

    getBuildingCategoryById: builder.query({
      query: (id) => `/api/building-categories/${id}`,
      providesTags: (result, error, id) => [{ type: "BuildingCategory", id }],
    }),

    // Building Type Management - GET only
    getBuildingTypes: builder.query({
      query: () => "/api/building-types",
      providesTags: ["BuildingType"],
    }),

    getBuildingTypeById: builder.query({
      query: (id) => `/api/building-types/${id}`,
      providesTags: (result, error, id) => [{ type: "BuildingType", id }],
    }),

    // Floor Management - GET only
    getFloors: builder.query({
      query: () => "/api/floors",
      providesTags: ["Floor"],
    }),

    getFloorsFlat: builder.query({
      query: () => "/api/floors?flat=true",
      providesTags: ["Floor"],
    }),

    getFloorsByBuildingType: builder.query({
      query: (buildingTypeId) => `/api/floors?buildingType=${buildingTypeId}`,
      providesTags: ["Floor"],
    }),

    getFloorById: builder.query({
      query: (id) => `/api/floors/${id}`,
      providesTags: (result, error, id) => [{ type: "Floor", id }],
    }),

    // Room Management - GET only
    getRooms: builder.query({
      query: () => "/api/rooms",
      providesTags: ["Room"],
    }),

    getRoomsByFloor: builder.query({
      query: (floorId) => `/api/rooms?floor=${floorId}`,
      providesTags: ["Room"],
    }),

    getRoomById: builder.query({
      query: (id) => `/api/rooms/${id}`,
      providesTags: (result, error, id) => [{ type: "Room", id }],
    }),

    // Engineering Discipline Management - GET only
    getEngineeringDisciplines: builder.query({
      query: () => "/api/engineering-disciplines",
      providesTags: ["EngineeringDiscipline"],
    }),

    getEngineeringDisciplineById: builder.query({
      query: (id) => `/api/engineering-disciplines/${id}`,
      providesTags: (result, error, id) => [
        { type: "EngineeringDiscipline", id },
      ],
    }),

    // Engineering SubCategory Management - GET only
    getEngineeringSubCategories: builder.query({
      query: () => "/api/engineering-subcategories",
      providesTags: ["EngineeringSubCategory"],
    }),

    getEngineeringSubCategoryById: builder.query({
      query: (id) => `/api/engineering-subcategories/${id}`,
      providesTags: (result, error, id) => [
        { type: "EngineeringSubCategory", id },
      ],
    }),

    // Product Management - GET only
    getProducts: builder.query({
      query: () => "/api/products",
      providesTags: ["Product"],
    }),

    getProductById: builder.query({
      query: (id) => `/api/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    // Manufacturer Management - GET only
    getManufacturers: builder.query({
      query: () => "/api/manufacturers",
      providesTags: ["Manufacturer"],
    }),

    getManufacturerById: builder.query({
      query: (id) => `/api/manufacturers/${id}`,
      providesTags: (result, error, id) => [{ type: "Manufacturer", id }],
    }),

    // Additional GET endpoints for other modules
    getEngineeringServices: builder.query({
      query: () => "/api/engineering-services",
      providesTags: ["EngineeringService"],
    }),

    getEngineeringParameters: builder.query({
      query: () => "/api/engineering-parameters",
      providesTags: ["EngineeringParameter"],
    }),

    getEngineeringCalculations: builder.query({
      query: () => "/api/engineering-calculations",
      providesTags: ["EngineeringCalculation"],
    }),

    getCalculationFieldTemplates: builder.query({
      query: () => "/api/calculation-field-templates",
      providesTags: ["CalculationFieldTemplate"],
    }),

    getEngineeringDesigns: builder.query({
      query: () => "/api/engineering-designs",
      providesTags: ["EngineeringDesign"],
    }),

    getProductCapacities: builder.query({
      query: () => "/api/product-capacities",
      providesTags: ["ProductCapacity"],
    }),

    getSpecTemplates: builder.query({
      query: () => "/api/spec-template",
      providesTags: ["SpecTemplate"],
    }),

    getProductSpecifications: builder.query({
      query: () => "/api/product-specifications",
      providesTags: ["ProductSpecification"],
    }),

    getProductSpecs: builder.query({
      query: () => "/api/product-specs",
      providesTags: ["ProductSpec"],
    }),
  }),
});

// Export only GET query hooks (no mutations)
export const {
  // Health
  useGetHealthQuery,

  // Locations
  useGetLocationsQuery,
  useGetLocationByIdQuery,

  // Building Categories
  useGetBuildingCategoriesQuery,
  useGetBuildingCategoryByIdQuery,

  // Building Types
  useGetBuildingTypesQuery,
  useGetBuildingTypeByIdQuery,

  // Floors
  useGetFloorsQuery,
  useGetFloorsFlatQuery,
  useGetFloorsByBuildingTypeQuery,
  useGetFloorByIdQuery,

  // Rooms
  useGetRoomsQuery,
  useGetRoomsByFloorQuery,
  useGetRoomByIdQuery,

  // Engineering Disciplines
  useGetEngineeringDisciplinesQuery,
  useGetEngineeringDisciplineByIdQuery,

  // Engineering SubCategories
  useGetEngineeringSubCategoriesQuery,
  useGetEngineeringSubCategoryByIdQuery,

  // Products
  useGetProductsQuery,
  useGetProductByIdQuery,

  // Manufacturers
  useGetManufacturersQuery,
  useGetManufacturerByIdQuery,

  // Additional modules
  useGetEngineeringServicesQuery,
  useGetEngineeringParametersQuery,
  useGetEngineeringCalculationsQuery,
  useGetCalculationFieldTemplatesQuery,
  useGetEngineeringDesignsQuery,
  useGetProductCapacitiesQuery,
  useGetSpecTemplatesQuery,
  useGetProductSpecificationsQuery,
  useGetProductSpecsQuery,
} = latestAdminApi;
