import { useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { ProjectCard } from '@/components/project-card';
import type { ProjectCardData } from '@/types/project';

export interface ProjectCarouselProps {
  projects: ProjectCardData[];
}

const OUTER_PADDING = 20;
const CARD_GAP = 12;
const PEEK_WIDTH = 24;

export function ProjectCarousel({ projects }: ProjectCarouselProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const cardWidth = width - OUTER_PADDING * 2 - PEEK_WIDTH;
  const snapInterval = cardWidth + CARD_GAP;

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    setActiveIndex(Math.max(0, Math.min(index, projects.length - 1)));
  }

  return (
    <View className="mt-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: OUTER_PADDING }}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {projects.map((project) => (
          <View key={project.id} style={{ width: cardWidth, marginRight: CARD_GAP }}>
            <ProjectCard data={project} variant="carousel" />
          </View>
        ))}
      </ScrollView>

      <View className="mt-3 flex-row justify-center gap-1.5">
        {projects.map((project, index) => (
          <View
            key={project.id}
            className="h-1.5 rounded-full"
            style={{
              width: index === activeIndex ? 16 : 6,
              backgroundColor: index === activeIndex ? '#4876ee' : '#cccfdb',
            }}
          />
        ))}
      </View>
    </View>
  );
}
