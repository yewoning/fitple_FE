import { requestRaw } from '@/services/api-client';
import type { ProjectApiResponse } from '@/types/project';

export function getProjects() {
  return requestRaw<ProjectApiResponse[]>('/api/projects');
}
