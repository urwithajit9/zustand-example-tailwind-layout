import { create } from "zustand";

// Create a store to manage the global state
interface Store {
  count: number;
  text: string;
  increment: () => void;
  decrement: () => void;
  setText: (text: string) => void;
}

const useStore = create<Store>((set) => ({
  count: 0,
  text: "",
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setText: (text: string) => set({ text }),
}));

export default useStore;
