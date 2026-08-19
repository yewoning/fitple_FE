import { requestRaw } from '@/services/api-client';
import { getDemoMemberProfile } from '@/mocks/demo-store';
import { withDemoFallback } from '@/services/demo-fallback';
import type { MemberProfile } from '@/types/member';

export function getMyProfile(memberId: number) {
  return withDemoFallback(
    () => requestRaw<MemberProfile>(`/api/members/me?memberId=${memberId}`),
    () => getDemoMemberProfile(memberId),
  );
}
