import { Text, View } from 'react-native';
import { ProjectCard, type ProjectCardVariant } from '@/components/project-card';
import type { ProjectCardData } from '@/types/project';

export interface ProjectGridSectionProps {
  title: string;
  data: ProjectCardData[];
  variant: Extract<ProjectCardVariant, 'progress' | 'task'>;
}

export function ProjectGridSection({ title, data, variant }: ProjectGridSectionProps) {
  return (
    <View className="mt-8 px-5">
      <Text className="mb-3 font-sans text-base font-semibold text-black">{title}</Text>
      <View className="flex-row flex-wrap gap-3">
        {data.map((project) => (
          <View key={project.id} className="w-[47%]">
            <ProjectCard data={project} variant={variant} />
          </View>
        ))}
      </View>
    </View>
  );
}
