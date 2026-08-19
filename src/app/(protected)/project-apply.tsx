import { useLocalSearchParams } from 'expo-router';
import { ProjectApplyScreen } from '@/components/project-apply-screen';

export default function ProjectApplyRoute() {
  const { id, title } = useLocalSearchParams<{ id?: string; title?: string }>();
  return <ProjectApplyScreen projectId={id} projectTitle={title} />;
}
