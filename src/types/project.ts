export type ProjectStatus = 'recruiting' | 'recruit-closed' | 'in-progress' | 'completed';

export interface ProjectCardData {
  id: string;
  projectName: string;
  status: ProjectStatus;
  subInfo: string;
  deadline: string;
}
