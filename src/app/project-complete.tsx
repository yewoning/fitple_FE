import { useLocalSearchParams } from 'expo-router';
import { ProjectCompleteScreen } from '@/components/project-complete-screen';

export default function ProjectCompleteRoute() {
  const { projectId, inviteLink, qrCodeUrl } = useLocalSearchParams<{
    projectId?: string;
    inviteLink?: string;
    qrCodeUrl?: string;
  }>();
  return <ProjectCompleteScreen projectId={projectId} inviteLink={inviteLink} qrCodeUrl={qrCodeUrl} />;
}
