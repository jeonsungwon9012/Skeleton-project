import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useCounterStore = defineStore('counter', () => {
  // 상태 저장 변수
  const budgets = ref([]); //지출 내역
  const categories = ref([]); //카테고리 정보
  const loading = ref(false);

  //데이터 가져오기 함수
  const fetchAllData = async () => {
    loading.value = true;
    try {
      // db.json 데이터 가져오기
      const response = await axios.get('http://localhost:3000/db');
      budgets.value = response.data.BUDGET;
      categories.value = response.data.CATEGORY;
      console.log('데이터 로드 성공:', response.data);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      loading.value = false;
    }
  }
    // 카테고리 ID 받아서 색상 코드 찾아주는 함수 (getter)
    const getCategoryColor = (cid) => {
      const target = categories.value.find((c) => c.id === cid);
      // 찾으면 그 색상을, 못 찾으면 기본 회색 반환
      return target ? target.color : '#959999';
    };


  return { budgets, categories, loading, fetchAllData, getCategoryColor };
})
