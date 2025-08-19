import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApiSlice = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3001/api", // Admin backend URL
    prepareHeaders: (headers) => {
      // No authentication needed for admin API for now
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // Get all products with specifications for comparison
    getProductsWithSpecs: builder.query({
      query: () => ({
        url: "/products/comparison-data",
        method: "GET",
      }),
      providesTags: ["AdminProducts"],
      transformResponse: (response) => {
        console.log("🔄 API Response:", response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("❌ API Error:", response);
        return response;
      },
    }),

    // Get filtered products for comparison
    getFilteredProducts: builder.mutation({
      query: (filters) => ({
        url: "/products/filtered-comparison",
        method: "POST",
        body: filters,
      }),
      invalidatesTags: ["AdminProducts"],
    }),

    // Get products by hierarchy
    getProductsByHierarchy: builder.query({
      query: (params) => ({
        url: "/products/hierarchy",
        method: "GET",
        params,
      }),
      providesTags: ["AdminProducts"],
    }),

    // Get all engineering disciplines for comparison
    getEngineeringDisciplines: builder.query({
      query: () => ({
        url: "/engineering-disciplines/comparison/list",
        method: "GET",
      }),
      providesTags: ["EngineeringDisciplines"],
      transformResponse: (response) => {
        console.log("🔄 Disciplines Response:", response);
        return response;
      },
    }),

    // Get engineering subcategories for comparison
    getEngineeringSubCategories: builder.query({
      query: () => ({
        url: "/engineering-subcategories/comparison/list",
        method: "GET",
      }),
      providesTags: ["EngineeringSubCategories"],
      transformResponse: (response) => {
        console.log("🔄 SubCategories Response:", response);
        return response;
      },
    }),

    // Get subcategories by discipline (dependent filtering)
    getSubcategoriesByDiscipline: builder.query({
      query: (disciplineId) => ({
        url: `/products/subcategories/${disciplineId}`,
        method: "GET",
      }),
      providesTags: ["EngineeringSubCategories"],
      transformResponse: (response) => {
        console.log("🔄 SubCategories by Discipline Response:", response);
        return response;
      },
    }),

    // Get products by subcategory (dependent filtering)
    getProductsBySubcategory: builder.query({
      query: (subCategoryId) => ({
        url: `/products/products-by-subcategory/${subCategoryId}`,
        method: "GET",
      }),
      providesTags: ["Products"],
      transformResponse: (response) => {
        console.log("🔄 Products by SubCategory Response:", response);
        return response;
      },
    }),

    // Get capacities by product (dependent filtering)
    getCapacitiesByProduct: builder.query({
      query: (productId) => ({
        url: `/products/capacities-by-product/${productId}`,
        method: "GET",
      }),
      providesTags: ["ProductCapacities"],
      transformResponse: (response) => {
        console.log("🔄 Capacities by Product Response:", response);
        return response;
      },
    }),

    // Get manufacturers by product and capacity (dependent filtering)
    getManufacturersByProduct: builder.query({
      query: ({ productId, capacityId }) => ({
        url: `/products/manufacturers-by-product/${productId}/${capacityId}`,
        method: "GET",
      }),
      providesTags: ["Manufacturers"],
      transformResponse: (response) => {
        console.log("🔄 Manufacturers by Product Response:", response);
        return response;
      },
    }),

    // Get manufacturers for comparison
    getManufacturers: builder.query({
      query: () => ({
        url: "/manufacturers/comparison/list",
        method: "GET",
      }),
      providesTags: ["Manufacturers"],
    }),

    // Get product specifications
    getProductSpecifications: builder.query({
      query: (params) => ({
        url: "/products/specification",
        method: "GET",
        params,
      }),
      providesTags: ["ProductSpecifications"],
    }),

    // Get product capacities
    getProductCapacities: builder.query({
      query: (productId) => ({
        url: "/product-capacities",
        method: "GET",
        params: productId ? { product_id: productId } : {},
      }),
      providesTags: ["ProductCapacities"],
    }),

    // Get locations
    getLocations: builder.query({
      query: () => ({
        url: "/locations",
        method: "GET",
      }),
      providesTags: ["Locations"],
    }),
  }),
});

export const {
  useGetProductsWithSpecsQuery,
  useGetFilteredProductsMutation,
  useGetProductsByHierarchyQuery,
  useGetEngineeringDisciplinesQuery,
  useGetEngineeringSubCategoriesQuery,
  useGetSubcategoriesByDisciplineQuery,
  useGetProductsBySubcategoryQuery,
  useGetCapacitiesByProductQuery,
  useGetManufacturersByProductQuery,
  useGetManufacturersQuery,
  useGetProductSpecificationsQuery,
  useGetProductCapacitiesQuery,
  useGetLocationsQuery,
} = adminApiSlice;
