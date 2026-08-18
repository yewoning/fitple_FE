import { ScrollView, Text, View } from 'react-native';
import { ProjectCard, type ProjectCardVariant } from '@/components/project-card';
import type { ProjectCardData } from '@/types/project';

export interface ProjectGridSectionProps {
  title: string;
  data: ProjectCardData[];
  variant: Extract<ProjectCardVariant, 'progress' | 'task'>;
  /** 스크롤 없이 항상 보여줄 행 수 (2열 기준, 1행=2개, 2행=4개). 그 이상은 내부 스크롤. */
  visibleRows: 1 | 2;
}

const ROW_HEIGHT = 84;
const ROW_GAP = 10;

function getMaxHeight(rows: number) {
  return rows * ROW_HEIGHT + (rows - 1) * ROW_GAP;
}

export function ProjectGridSection({ title, data, variant, visibleRows }: ProjectGridSectionProps) {
  return (
    <View className="mt-5 px-5">
      <Text className="mb-3 font-sans-semibold text-base text-black">{title}</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ maxHeight: getMaxHeight(visibleRows) }}
      >
        <View className="flex-row flex-wrap gap-x-2 gap-y-2.5 pb-1">
          {data.map((project) => (
            <View key={project.id} className="w-[48%]">
              <ProjectCard data={project} variant={variant} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
