import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', () => {
  const items = ref([]);
  const loading = ref(false);

  //데이터 가져오기 함수
  const fetchItems = async () => {
    loading.value = true;
    try {
      const response = await axios.get('http://localhost:3000/items');
      items.value = response.data;
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      loading.value = false;
    }
  };

  return { items, loading, fetchItems };
});
