import type { ImageSourcePropType } from 'react-native';

export type ProjectStatus = 'recruiting' | 'recruit-closed' | 'in-progress' | 'completed';

export interface ProjectCardData {
  id: string;
  projectName: string;
  status: ProjectStatus;
  subInfo: string;
  deadline: string;
}

export interface RecruitingProjectCardData {
  id: string;
  projectName: string;
  status: ProjectStatus;
  subInfo: string;
  deadline: string;
  icon: ImageSourcePropType;
}
