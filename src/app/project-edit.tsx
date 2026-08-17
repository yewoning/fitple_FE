import { useLocalSearchParams } from 'expo-router';
import { ProjectEditScreen } from '@/components/project-edit-screen';

export default function ProjectEditRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <ProjectEditScreen projectId={id} />;
}
