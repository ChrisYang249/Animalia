import { create } from 'zustand';

interface LikedCatsState {
  likedIds: number[];
  toggleLike: (id: number) => void;
  isLiked: (id: number) => boolean;
}

export const useLikedCatsStore = create<LikedCatsState>((set, get) => ({
  likedIds: [],
  toggleLike: (id) =>
    set((state) => ({
      likedIds: state.likedIds.includes(id)
        ? state.likedIds.filter((x) => x !== id)
        : [...state.likedIds, id],
    })),
  isLiked: (id) => get().likedIds.includes(id),
}));
