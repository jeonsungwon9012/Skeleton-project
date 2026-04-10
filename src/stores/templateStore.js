import { defineStore } from 'pinia';

export const useTemplateStore = defineStore('template', {
  state: () => ({
    templates: [
      { id: 101, name: '점심 식사', amount: 9000, cid: 1 },
      { id: 102, name: '정기 구독', amount: 14900, cid: 3 },
    ],
  }),

  actions: {
    // 가계부 작성 로직 담당자에게 데이터를 넘겨줄 준비
    getTemplateData(id) {
      return this.templates.find((t) => t.id === id);
    },
  },
});
