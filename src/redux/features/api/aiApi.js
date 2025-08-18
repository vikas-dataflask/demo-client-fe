import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const aiToken = localStorage.getItem("aiToken");
  const modifiedArgs = {
    ...args,
    headers: {
      ...(args.headers || {}),
      Authorization: aiToken ? `Bearer ${aiToken}` : "",
    },
  };
  return fetchBaseQuery({ baseUrl: "/ai-api" })(
    modifiedArgs,
    api,
    extraOptions
  );
};

export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery: baseQueryWithAuth,
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (User) => ({
        url: "login",
        method: "POST",
        body: User,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem("aiToken", data.access_token);
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),
    chat: builder.mutation({
      query: (Message) => ({
        url: "chatbots/46/chat",
        method: "POST",
        body: Message,
      }),
    }),
  }),
});

export const { useLoginMutation, useChatMutation } = aiApi;
