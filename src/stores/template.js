import { defineStore } from 'pinia';
import { ref } from 'vue';
import { templateApi } from '@/api/template';

export const useTemplateStore = defineStore('template', () => {
  const templates = ref([]);
  const isLoading = ref(false);

  const fetchTemplates = async (uid) => {
    isLoading.value = true;
    try {
      const res = await templateApi.getTemplates(uid);
      templates.value = res.data.slice(0, 3);
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTemplate = async (id, uid) => {
    await templateApi.deleteTemplate(id);
    if (uid) {
      await fetchTemplates(uid);
      return;
    }
    templates.value = templates.value.filter((template) => String(template.id) !== String(id));
  };

  return { templates, isLoading, deleteTemplate, fetchTemplates };
});
