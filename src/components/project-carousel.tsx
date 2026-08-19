import { useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { RecommendedProjectRow } from '@/components/recommended-project-row';
import type { ProjectCardData } from '@/types/project';

export interface ProjectCarouselProps {
  projects: ProjectCardData[];
  onProjectPress?: (id: string) => void;
}

const SIDE_INSET = 32;
const CARD_GAP = 12;
const CHUNK_SIZE = 4;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function ProjectCarousel({ projects, onProjectPress }: ProjectCarouselProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const pages = chunk(projects, CHUNK_SIZE);
  const cardWidth = width - SIDE_INSET * 2;
  const snapInterval = cardWidth + CARD_GAP;

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    setActiveIndex(Math.max(0, Math.min(index, pages.length - 1)));
  }

  return (
    <View className="mt-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: SIDE_INSET }}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {pages.map((page, pageIndex) => (
          <View
            key={page[0]?.id ?? pageIndex}
            className="rounded-[36px] bg-white px-5 py-3"
            style={{ width: cardWidth, marginRight: CARD_GAP }}
          >
            {page.map((project) => (
              <RecommendedProjectRow
                key={project.id}
                data={project}
                onPress={() => onProjectPress?.(project.id)}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      {pages.length > 1 ? (
        <View className="mt-3 flex-row justify-center gap-1.5">
          {pages.map((page, index) => (
            <View
              key={page[0]?.id ?? index}
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: index === activeIndex ? '#3946a6' : '#cccfdb',
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
