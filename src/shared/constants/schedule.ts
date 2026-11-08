// 교환학생 지원 마감. (기준: 국제교류팀 공고, 2026)
// 2026-2학기 영어권 모집 마감(2026.01.13 12:00)을 1년 뒤로 맞춤.
export const APPLY_SCHEDULE = {
  semester: '2027-2학기',
  deadline: '2027-01-13T12:00:00+09:00',
};

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** 마감까지 남은 날 수. 마감 시각이 지나면 null */
export function getDaysLeft(now = new Date()) {
  const deadline = new Date(APPLY_SCHEDULE.deadline);
  if (now > deadline) return null;
  return Math.round((startOfDay(deadline) - startOfDay(now)) / DAY);
}
