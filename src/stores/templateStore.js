import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useTemplateStore = defineStore('template', () => {
  const templates = ref([
    { id: 101, name: '점심 식사', amount: 9000, cid: 1 },
    { id: 102, name: '정기 구독', amount: 14900, cid: 3 }
  ])

  function getTemplateData(id) {
    return templates.value.find(t => t.id === id)
  }

  return { templates, getTemplateData }
})