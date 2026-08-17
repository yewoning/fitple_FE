import { useLocalSearchParams } from 'expo-router';
import { ProjectCompleteScreen } from '@/components/project-complete-screen';

export default function ProjectCompleteRoute() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  return <ProjectCompleteScreen projectId={projectId} />;
}
