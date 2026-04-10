// ================================================================
// api/category.js
// 카테고리 관련 API 요청 모음
// - json-server 기준 엔드포인트 사용
// - vite proxy 설정으로 /api → http://localhost:3000 으로 포워딩
// ================================================================

import axios from 'axios';

const BASE_URL = '/api';

export const categoryApi = {
  // 전체 카테고리 목록 조회 (CATEGORY 테이블 전체)
  getCategories: () => axios.get(`${BASE_URL}/CATEGORY`),

  // 유저의 카테고리별 목표 예산 조회 (uid로 필터)
  getCategoryBudgets: (uid) =>
    axios.get(`${BASE_URL}/CATEGORY_BUDGET?uid=${uid}`),

  // 유저의 전체 지출 내역 조회 (uid로 필터)
  getBudgets: (uid) => axios.get(`${BASE_URL}/BUDGET?uid=${uid}`),
};
