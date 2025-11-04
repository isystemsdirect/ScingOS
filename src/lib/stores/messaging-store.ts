import { create } from 'zustand';

type TargetUser = {
  id: string;
  name: string;
};

type MessagingState = {
  isOpen: boolean;
  targetUser: TargetUser | null;
};

type MessagingActions = {
  openDialog: (userId: string, userName: string) => void;
  closeDialog: () => void;
};

export const useMessagingStore = create<MessagingState & MessagingActions>((set) => ({
  isOpen: false,
  targetUser: null,
  openDialog: (userId, userName) => set({ isOpen: true, targetUser: { id: userId, name: userName } }),
  closeDialog: () => set({ isOpen: false, targetUser: null }),
}));
