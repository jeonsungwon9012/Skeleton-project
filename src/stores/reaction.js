import { defineStore } from 'pinia';
import { ref } from 'vue';
import { reactionApi } from '@/api/reaction';

export const useReactionStore = defineStore('reaction', () => {
  const reactionMessages = ref([]);

  const fetchReactionMessages = async () => {
    if (reactionMessages.value.length) return; // 이미 로드됐으면 스킵
    const res = await reactionApi.getReactionMessages();
    reactionMessages.value = res.data;
  };

  /**
   * 방금 추가된 거래의 카테고리 + 이번 달 누적 횟수를 받아 출력할 메시지 결정
   * @param {number|string} cid        - 방금 추가된 거래의 카테고리 ID
   * @param {number}        count      - 이번 달 해당 카테고리 누적 지출 횟수 (방금 추가된 것 포함)
   * @param {string}        categoryName - 카테고리 이름 (fallback 메시지용)
   * @returns {string} 출력할 메시지
   */
  const resolveMessage = (cid, count, categoryName) => {
    // cid + goalCount가 정확히 일치하는 메시지 우선
    const exact = reactionMessages.value.find(
      (m) => String(m.cid) === String(cid) && Number(m.goalCount) === count,
    );
    if (exact) return exact.message;

    // 없으면 fallback
    return `이번 달 ${categoryName} 소비 ${count}번째예요!`;
  };

  return { reactionMessages, fetchReactionMessages, resolveMessage };
});
