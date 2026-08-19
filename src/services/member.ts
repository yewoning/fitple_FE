import { requestRaw } from '@/services/api-client';
import type { MemberProfile } from '@/types/member';

export function getMyProfile(memberId: number) {
  return requestRaw<MemberProfile>(`/api/members/me?memberId=${memberId}`);
}
