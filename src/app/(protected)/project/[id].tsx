import { useLocalSearchParams } from 'expo-router';
import { ProjectDetailScreen } from '@/components/project-detail-screen';

export default function ProjectDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProjectDetailScreen projectId={id} />;
}
