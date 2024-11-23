import { create } from 'zustand';

interface ActionsState {
  isEnabled: boolean;
  toggleActions: () => void;
  enableActions: () => void;
  disableActions: () => void;
}

export const useActionsStore = create<ActionsState>((set) => ({
  isEnabled: true,
  toggleActions: () => set((state) => ({ isEnabled: !state.isEnabled })),
  enableActions: () => set({ isEnabled: true }),
  disableActions: () => set({ isEnabled: false }),
})); 