import { useQuery } from '@tanstack/react-query';

import { getApplications, getMyTodayTasks, getResumeVersions, getScraps } from '@/api/mypage';
import { getProfile } from '@/api/profile';

export const mypageKeys = {
  profile: ['mypage', 'profile'] as const,
  scraps: ['mypage', 'scraps'] as const,
  applications: ['mypage', 'applications'] as const,
  resumes: ['mypage', 'resumes'] as const,
  tasks: ['mypage', 'tasks'] as const,
};

export function useProfileQuery() {
  return useQuery({
    queryKey: mypageKeys.profile,
    queryFn: getProfile,
  });
}

export function useScrapsQuery() {
  return useQuery({
    queryKey: mypageKeys.scraps,
    queryFn: getScraps,
  });
}

export function useApplicationsQuery() {
  return useQuery({
    queryKey: mypageKeys.applications,
    queryFn: getApplications,
  });
}

export function useResumeVersionsQuery() {
  return useQuery({
    queryKey: mypageKeys.resumes,
    queryFn: getResumeVersions,
  });
}

export function useMyTodayTasksQuery() {
  return useQuery({
    queryKey: mypageKeys.tasks,
    queryFn: getMyTodayTasks,
  });
}
