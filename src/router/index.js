import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore'; // 💡 로그인 Pinia 스토어를 IMPORT

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/components/views/Onboarding.vue'),
      meta: { isFullPage: true }, // 전체 화면 모드
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/components/views/Dashboard.vue'),
      meta: { isFullPage: false },
    },

    {
      path: '/addTransaction',
      name: 'addTransaction',
      component: () => import('@/components/views/addTransactions.vue'),
      meta: { isFullPage: false },
    },
    {
      path: '/TransactionList',
      name: 'TransactionList',
      component: () => import('@/components/views/TransactionList.vue'),
      meta: { isFullPage: false },
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/components/views/Calendar.vue'),
      meta: { isFullPage: false },
    },
    {
      path: '/api/transactionList',
      name: 'transactionList',
      component: () => import('@/components/views/TransactionList.vue'),
      meta: { isFullPage: false },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/components/views/Profile.vue'),
      meta: { isFullPage: false },
      children: [
        {
          path: '', // URL이 '/profile'일 때 기본으로 보여줄 곳
          name: 'profile-view',
          component: () => import('@/components/profile/ViewProfile.vue'),
        },
        {
          path: 'edit', // URL이 '/profile/edit'일 때 보여줄 곳
          name: 'profile-edit',
          component: () => import('@/components/profile/EditProfile.vue'),
        },
      ],
    },
  ],
});

/**
 * 🚩 네비게이션 가드 (출입 통제 로직)
router.beforeEach((to, from, next) => {
  // 💡 가드 안에서 스토어를 선언해야 안전하게 상태를 가져올 수 있음
  const userStore = useUserStore();

  // 스토어에 저장된 uid가 있으면 로그인된 것으로 판단함 (예시)
  const isLoggedIn = userStore.isLoggedIn;

  // 1. 로그인 안 된 사용자가 온보딩 외의 페이지로 가려 할 때
  if (!isLoggedIn && to.name !== 'onboarding') {
    next({ name: 'onboarding' });
  }
  // 2. 이미 로그인된 사용자가 온보딩 페이지로 되돌아가려 할 때
  else if (isLoggedIn && to.name === 'onboarding') {
    next({ name: 'calendar' }); // 메인인 달력 페이지로 보냄
  }
  // 3. 그 외에는 자유롭게 통과
  else {
    next();
  }
});
*/
export default router;
