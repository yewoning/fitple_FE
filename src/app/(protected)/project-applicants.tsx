import { useLocalSearchParams } from 'expo-router';
import { ProjectApplicantsScreen } from '@/components/project-applicants-screen';

export default function ProjectApplicantsRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  return <ProjectApplicantsScreen projectId={id} />;
}
