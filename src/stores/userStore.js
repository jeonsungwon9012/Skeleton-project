import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      uid: 'Darae_choi',
      name: '최다래',
      cids: [1, 2, 3, 4, 5], // 유저가 선택한 카테고리 ID들
    },
    isLoggedIn: true,
  }),
});
