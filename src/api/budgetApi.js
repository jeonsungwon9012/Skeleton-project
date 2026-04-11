import axios from 'axios';

const BASE_URL = '/api';

export const fetchBudgets = () => axios.get(`${BASE_URL}/BUDGET`);
export const fetchCategories = () => axios.get(`${BASE_URL}/CATEGORY`);

export const fetchAllDashboardData = async () => {
  const [budgetRes, categoryRes] = await Promise.all([
    fetchBudgets(),
    fetchCategories(),
  ]);
  return {
    BUDGET: budgetRes.data,
    CATEGORY: categoryRes.data,
  };
};
