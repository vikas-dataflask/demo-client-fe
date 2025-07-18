import { createSlice } from "@reduxjs/toolkit";

const storedUser = JSON.parse(localStorage.getItem("user"));

const initialState = storedUser || {
  _id: "",
  email: "",
  username: "",
  firstName: "",
  lastName: "",
  contactNumber: "",
  profilePicUrl: "",
  token: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // This is the core reducer that updates the user state with data from the API
    setUser: (state, action) => {
      // Use Object.assign to merge the existing state with all new data from the payload
      Object.assign(state, action.payload);
      localStorage.setItem("user", JSON.stringify(state));
    },
    clearUser: (state) => {
      localStorage.removeItem("user");
      return {
        _id: "",
        email: "",
        username: "",
        firstName: "",
        lastName: "",
        contactNumber: "",
        profilePicUrl: "",
        token: "",
      };
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
