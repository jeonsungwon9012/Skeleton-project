import { createRouter, createWebHistory } from 'vue-router';
import TransactionList from '@/components/views/TransactionList.vue';
import Dashboard from '@/components/views/Dashboard.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Dashboard,
    },
    {
      path: '/api/data',
      name: 'transactionList',
      component: TransactionList,
    },
  ],
});

export default router;
