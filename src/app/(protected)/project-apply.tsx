import { useLocalSearchParams } from 'expo-router';
import { ProjectApplyScreen } from '@/components/project-apply-screen';

export default function ProjectApplyRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <ProjectApplyScreen projectId={id} />;
}
