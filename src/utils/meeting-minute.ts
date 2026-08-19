/**
 * 회의록 초안 생성 유틸.
 *
 * 백엔드엔 회의록 AI 생성 API가 없고(POST .../meeting-minutes는 title/content를 그대로 저장하는
 * CRUD입니다) content도 구조 없는 문자열 하나뿐이라, 대화 내역을 여기서 평문으로 정리해 초안을
 * 만들고 사용자가 시트에서 고친 뒤 저장합니다.
 * 나중에 백엔드에 meeting-minutes/ai-generate가 생기면 이 파일 호출부만 갈아끼우면 됩니다.
 */
import type { ChatMessage, MeetingMinuteDraft, TodayTask } from '@/types';

/** 명세 MeetingMinuteCreateRequest의 maxLength. 넘기면 400이 납니다. */
export const MEETING_MINUTE_TITLE_MAX = 200;
export const MEETING_MINUTE_CONTENT_MAX = 10000;

const TRUNCATION_SUFFIX = '\n…(이하 생략)';
const UNKNOWN_MEETING_DATE_LABEL = '날짜 미상';
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function pad2(value: number) {
  return value.toString().padStart(2, '0');
}

function toValidDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** ISO → '2026.08.20 (목) 16:30'. 값이 없거나 형식이 어긋나면 '날짜 미상'. */
export function formatMeetingDateLabel(iso: string | null | undefined): string {
  const date = toValidDate(iso);
  if (!date) return UNKNOWN_MEETING_DATE_LABEL;

  const ymd = `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
  const weekday = WEEKDAY_LABELS[date.getDay()];
  return `${ymd} (${weekday}) ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** '08.20' — 기본 제목과 과제 마감일 표기에 씁니다. */
function formatMonthDay(iso: string | null | undefined): string | null {
  const date = toValidDate(iso);
  if (!date) return null;
  return `${pad2(date.getMonth() + 1)}.${pad2(date.getDate())}`;
}

function formatTime(iso: string | null | undefined): string | null {
  const date = toValidDate(iso);
  if (!date) return null;
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function truncate(value: string, max: number, suffix = '') {
  if (value.length <= max) return value;
  return value.slice(0, max - suffix.length) + suffix;
}

interface BuildMeetingMinuteDraftParams {
  messages: ChatMessage[];
  tasks: TodayTask[];
  /** 서버 메시지/과제엔 이름이 없어서(memberId만 옴) 호출부의 팀원 목록으로 채웁니다. */
  resolveName: (memberId: number | null | undefined, fallback: string) => string;
  now?: Date;
}

/**
 * 대화 내역과 진행 중인 과제로 회의록 초안을 만듭니다.
 * 정리할 대화가 하나도 없으면 null을 돌려주고, 호출부에서 안내 후 중단합니다.
 */
export function buildMeetingMinuteDraft({
  messages,
  tasks,
  resolveName,
  now = new Date(),
}: BuildMeetingMinuteDraftParams): MeetingMinuteDraft | null {
  // 핏봇 안내는 서버에 저장되지 않는 화면 전용 메시지고, 음수 ID는 전송 중인 낙관적 메시지입니다.
  const conversation = (messages ?? []).filter(
    (message) => !message.isBot && message.messageId >= 0 && message.content?.trim()
  );

  if (conversation.length === 0) return null;

  const lines: string[] = [`${formatMeetingDateLabel(now.toISOString())} 나눈 대화 정리`, '', '[대화 내용]'];

  for (const message of conversation) {
    const time = formatTime(message.sentAt);
    const name = message.senderName?.trim() || resolveName(message.senderId, '팀원');
    const content = message.content.trim().replace(/\s*\n\s*/g, ' ');
    lines.push(`${time ? `${time} ` : ''}${name}: ${content}`);
  }

  const todoTasks = (tasks ?? []).filter((task) => task.status === 'TODO' && task.title?.trim());
  if (todoTasks.length > 0) {
    lines.push('', '[다음 할 일]');
    for (const task of todoTasks) {
      const name = task.assignee?.name?.trim() || resolveName(task.assignee?.memberId, '미배정');
      const due = formatMonthDay(task.dueDate);
      lines.push(`- ${name}: ${task.title.trim()}${due ? ` (마감 ${due})` : ''}`);
    }
  }

  return {
    title: truncate(`${formatMonthDay(now.toISOString()) ?? ''} 회의록`.trim(), MEETING_MINUTE_TITLE_MAX),
    content: truncate(lines.join('\n'), MEETING_MINUTE_CONTENT_MAX, TRUNCATION_SUFFIX),
  };
}
