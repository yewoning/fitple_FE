import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getUserSettings, updateUserSettings } from '@/api/settings';
import type { UserSettings } from '@/types';

export const settingsKeys = {
  user: (memberId: number) => ['settings', 'user', memberId] as const,
};

export function useUserSettingsQuery(memberId: number | null) {
  return useQuery({
    queryKey: settingsKeys.user(memberId ?? 0),
    queryFn: () => getUserSettings(memberId as number),
    enabled: memberId != null,
    retry: 1,
  });
}

export function useUpdateTranslationEnabledMutation(memberId: number | null) {
  const queryClient = useQueryClient();
  const queryKey = settingsKeys.user(memberId ?? 0);

  return useMutation({
    mutationFn: (translationEnabled: boolean) => {
      if (memberId == null) throw new Error('로그인 정보를 확인할 수 없습니다.');

      const current = queryClient.getQueryData<UserSettings>(queryKey) ?? {
        translationEnabled: false,
      };
      return updateUserSettings(memberId, { ...current, translationEnabled });
    },
    onMutate: async (translationEnabled) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<UserSettings>(queryKey);
      queryClient.setQueryData<UserSettings>(queryKey, {
        ...previous,
        translationEnabled,
      });
      return { previous };
    },
    onError: (_error, _translationEnabled, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
        return;
      }
      queryClient.removeQueries({ queryKey, exact: true });
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKey, settings);
    },
  });
}
