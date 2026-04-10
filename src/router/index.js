import { createRouter, createWebHistory } from 'vue-router';
//스토어 임포트 필요

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/components/views/Dashboard.vue'),
      // 전체화면이 아닌 네비게이션이 있는 페이지 isFullPage를 false로 설정
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
    /*{
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/components/views/Onboarding.vue'),
      meta: { isFullPage: true },
      // 온보딩 페이지는 전체 화면으로 표시하도록 메타 정보 추가
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/components/views/Calendar.vue'),
      meta: { isFullPage: false },
    },*/
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/components/views/Profile.vue'),
      meta: { isFullPage: false },
      children: [
        {
          path: '', // URL이 '/profile'일 때 기본으로 보여줄 곳
          name: 'profile-view',
          component: () => import('@/components/profile/ProfileForm.vue'),
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

/* 🚩 네비게이션 가드 (출입 통제) */
router.beforeEach((to, from, next) => {
  //pinia 스토어에서 로그인 상태 가져오기 필요
  // 임시 로그인 상태(true) 실제로 pinia 스토어로 교체필요
  const isLoggedIn = true;

  //로그인 안된 상태에서 다른 페이지 가려고 하면
  if (!isLoggedIn && to.name !== 'onboarding') {
    next({ name: 'onboarding' });
  } // 온보딩 페이지로 리다이렉트

  // 로그인된 상태에서 온보딩 페이지로 가려고 하면
  else if (isLoggedIn && to.name === 'onboarding') {
    next({ name: 'calendar' });
  }
  // 그 외의 경우는 정상적으로 이동
  else {
    next();
  }
});

export default router;
