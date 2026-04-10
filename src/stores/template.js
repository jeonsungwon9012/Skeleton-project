import { defineStore } from 'pinia';
import { ref } from 'vue';
import { templateApi } from '@/api/template';

export const useTemplateStore = defineStore('template', () => {
  // 유저의 템플릿 목록 (최대 3개)
  const templates = ref([]);
  const isLoading = ref(false);

  const fetchTemplates = async (uid) => {
    isLoading.value = true;
    try {
      const res = await templateApi.getTemplates(uid);
      // 최대 3개만 사용
      templates.value = res.data.slice(0, 3);
    } finally {
      isLoading.value = false;
    }
  };

  return { templates, isLoading, fetchTemplates };
});
