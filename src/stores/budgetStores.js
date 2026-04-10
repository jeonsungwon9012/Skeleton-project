import axios from 'axios';
import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { categoryApi } from '@/api/category';
import { templateApi } from '@/api/template';

const BASE_URL = '/api';
const DEFAULT_USER_ID = 1;

export const useTransactionStore = defineStore('transaction', () => {
  const categories = ref([]);
  const budgets = ref([]);
  const templates = ref([]);
  const isLoading = ref(false);

  const sanitizeCategories = (items = []) =>
    items
      .filter((category) => category && category.name && category.img)
      .map((category) => ({
        ...category,
        id: String(category.id),
      }));

  const normalizedCategories = computed(() =>
    sanitizeCategories(categories.value),
  );

  const loadData = async (uid = DEFAULT_USER_ID) => {
    isLoading.value = true;
    try {
      const [categoryResponse, budgetResponse, templateResponse] = await Promise.all([
        categoryApi.getCategories(),
        axios.get(`${BASE_URL}/BUDGET?uid=${uid}`),
        templateApi.getTemplates(uid),
      ]);

      categories.value = sanitizeCategories(categoryResponse.data ?? []);
      budgets.value = budgetResponse.data ?? [];
      templates.value = templateResponse.data ?? [];
    } finally {
      isLoading.value = false;
    }
  };

  const addBudget = async (payload) => {
    const response = await axios.post(`${BASE_URL}/BUDGET`, payload);
    budgets.value.push(response.data);
    return response.data;
  };

  const editBudget = async (id, payload) => {
    const response = await axios.put(`${BASE_URL}/BUDGET/${id}`, payload);
    const index = budgets.value.findIndex((budget) => String(budget.id) === String(id));
    if (index !== -1) {
      budgets.value[index] = response.data;
    }
    return response.data;
  };

  const addTemplate = async (payload) => {
    const response = await axios.post(`${BASE_URL}/TEMPLATE`, payload);
    templates.value.push(response.data);
    return response.data;
  };

  const addCategory = async (payload) => {
    const response = await categoryApi.createCategory(payload);
    categories.value.push({
      ...response.data,
      id: String(response.data.id),
    });
    return response.data;
  };

  const getTemplateCountByUser = (uid = DEFAULT_USER_ID) =>
    templates.value.filter((template) => String(template.uid) === String(uid)).length;

  return {
    budgets,
    categories: normalizedCategories,
    templates,
    isLoading,
    addBudget,
    addCategory,
    addTemplate,
    editBudget,
    getTemplateCountByUser,
    loadData,
  };
});
