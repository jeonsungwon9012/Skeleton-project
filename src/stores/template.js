import { defineStore } from 'pinia';
import { ref } from 'vue';
import { templateApi } from '@/api/template';

export const useTemplateStore = defineStore('template', () => {
  // 유저의 템플릿 목록 (최대 3개)
  const templates = ref([]);
  const isLoading = ref(false);

  // 유저의 템플릿 목록 fetch (최대 3개)
  const fetchTemplates = async (uid) => {
    isLoading.value = true;
    try {
      const res = await templateApi.getTemplates(uid);
      templates.value = res.data.slice(0, 3);
    } finally {
      isLoading.value = false;
    }
  };

  // 템플릿으로 오늘 날짜 거래 즉시 추가
  const applyTemplate = async (tmpl, uid) => {
    const today = new Date().toISOString().slice(0, 10);
    await templateApi.addBudgetFromTemplate({
      date: today,
      type: tmpl.type,
      amount: tmpl.amount,
      detail: tmpl.detail,
      memo: tmpl.memo,
      uid: Number(uid),
      cid: tmpl.cid,
      isRecurring: false,
      cycle: null,
    });
  };

  // 템플릿 삭제
  const deleteTemplate = async (id, uid) => {
    await templateApi.deleteTemplate(id);
    await fetchTemplates(uid); // 목록 갱신
  };

  return {
    templates,
    isLoading,
    fetchTemplates,
    applyTemplate,
    deleteTemplate,
  };
});
