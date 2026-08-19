/**
 * 날짜 포맷터는 값이 없는 경우를 항상 견뎌야 한다.
 * 백엔드 스펙상 필수인 날짜 필드도 AI 생성 결과처럼 실제로는 null이 올 수 있고,
 * 화면 한 곳에서 터지면 그 화면 전체가 렌더되지 않는다.
 */

export const UNKNOWN_DATE_LABEL = '미정';

function toMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** "2026-09-30" → "D-41". 값이 없거나 형식이 어긋나면 null. */
export function getDDayLabel(
  deadline: string | null | undefined,
  referenceDate: Date = new Date()
): string | null {
  if (!deadline) return null;

  const [year, month, day] = deadline.split('-').map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

  const target = new Date(year, month - 1, day);
  const diffDays = Math.round(
    (target.getTime() - toMidnight(referenceDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return formatDDayValue(diffDays);
}

export function formatDDayValue(diffDays: number): string {
  if (diffDays === 0) return 'D-DAY';
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}

/** "2026-09-30" → "~26.09.30". 값이 없으면 '미정'. */
export function formatShortDateLabel(dateStr: string | null | undefined): string {
  if (!dateStr) return UNKNOWN_DATE_LABEL;
  return `~${dateStr.slice(2).replace(/-/g, '.')}`;
}
