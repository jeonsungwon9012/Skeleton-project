import { createRouter, createWebHistory } from 'vue-router';
import AddTransactions from '../components/views/addTransactions.vue';
import Dashboard from '../components/views/Dashboard.vue';
import TransactionList from '../components/views/TransactionList.vue';
import Gamificaton from '../components/views/Gamificaton.vue';
import Profile from '../components/views/Profile.vue';

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/add-transaction', name: 'add-transaction', component: AddTransactions },
  { path: '/transactions', name: 'transactions', component: TransactionList },
  { path: '/gamification', name: 'gamification', component: Gamificaton },
  { path: '/profile', name: 'profile', component: Profile },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
