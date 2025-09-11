import { create } from "zustand";
import axios from "../api/api";

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,

  login: async (email, password) => {
    const res = await axios.post("/auth/login", { email, password });
    set({ user: res.data });
  },

  logout: async () => {
    await axios.post("/auth/logout");
    set({ user: null });
  },

  register: async (name, email, password) => {
    const res = await axios.post("/auth/register", { name, email, password, role: "patient" });
    set({ user: res.data });
  },
}));

export default useAuthStore;
