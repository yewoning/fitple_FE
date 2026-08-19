import { Text, View } from 'react-native';
import { ProjectCard, type ProjectCardVariant } from '@/components/project-card';
import { SectionPlaceholder } from '@/components/section-placeholder';
import type { ProjectCardData } from '@/types/project';

export interface ProjectGridSectionProps {
  title: string;
  data: ProjectCardData[];
  variant: Extract<ProjectCardVariant, 'progress' | 'task'>;
  /** 홈은 요약 화면이므로 섹션마다 보여줄 카드 수를 제한한다. 2열 기준 4 = 2행, 2 = 1행. */
  maxItems: number;
  isLoading: boolean;
  errorMessage: string | null;
  emptyMessage: string;
  onProjectPress?: (id: string) => void;
}

/**
 * 섹션 내부에는 스크롤을 두지 않는다. 홈 전체가 하나의 세로 ScrollView라서, 여기에
 * 또 세로 ScrollView를 넣으면 제스처가 충돌하고 잘린 카드에 도달하지 못한다.
 * 대신 maxItems로 개수를 제한해 홈이 요약 화면의 길이를 유지하게 한다.
 */
export function ProjectGridSection({
  title,
  data,
  variant,
  maxItems,
  isLoading,
  errorMessage,
  emptyMessage,
  onProjectPress,
}: ProjectGridSectionProps) {
  const visibleProjects = data.slice(0, maxItems);

  return (
    <View className="mt-5 px-5">
      <Text className="mb-3 font-sans-semibold text-base text-black">{title}</Text>

      {isLoading || errorMessage || visibleProjects.length === 0 ? (
        <SectionPlaceholder
          isLoading={isLoading}
          errorMessage={errorMessage}
          emptyMessage={emptyMessage}
        />
      ) : (
        <View className="flex-row flex-wrap gap-x-2 gap-y-2.5 pb-1">
          {visibleProjects.map((project) => {
            const linkId = project.linkId;
            return (
              <View key={project.id} className="w-[48%]">
                <ProjectCard
                  data={project}
                  variant={variant}
                  onPress={
                    onProjectPress && linkId ? () => onProjectPress(linkId) : undefined
                  }
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
