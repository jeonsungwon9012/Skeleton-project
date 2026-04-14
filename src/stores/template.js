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
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;

    await templateApi.addBudgetFromTemplate({
      date: formattedDate,
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
    // templates.value = templates.value.filter((template) => String(template.id) !== String(id));
  };

  return {
    templates,
    isLoading,
    fetchTemplates,
    applyTemplate,
    deleteTemplate,
  };
});
