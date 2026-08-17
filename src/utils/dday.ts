function toMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDDayLabel(deadline: string, referenceDate: Date = new Date()): string {
  const [year, month, day] = deadline.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const diffDays = Math.round(
    (target.getTime() - toMidnight(referenceDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'D-DAY';
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}
