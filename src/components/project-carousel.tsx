import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  PointerEvent,
  ViewStyle,
} from 'react-native';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { RecommendedProjectRow } from '@/components/recommended-project-row';
import { SectionPlaceholder } from '@/components/section-placeholder';
import type { ProjectCardData } from '@/types/project';

export interface ProjectCarouselProps {
  projects: ProjectCardData[];
  isLoading: boolean;
  errorMessage: string | null;
  emptyMessage: string;
  onProjectPress?: (id: string) => void;
}

const SIDE_INSET = 32;
// 좌우에 다른 카드가 있다는 걸 보여주기 위해 노출하는 폭.
const PEEK = 10;
// 카드 간격을 이만큼 벌리면 스냅된 상태에서 옆 카드가 PEEK 만큼만 보인다.
const CARD_GAP = SIDE_INSET - PEEK;
const CHUNK_SIZE = 4;

// scale을 주면 옆 카드가 자기 중심으로 줄어들면서 PEEK 영역이 화면 밖으로 밀려나므로 opacity만 쓴다.
const INACTIVE_OPACITY = 0.85;
// 인디케이터 점 크기(h-1.5 / w-1.5와 동일).
const DOT_SIZE = 6;

const IS_WEB = Platform.OS === 'web';
// 웹에는 momentum 이벤트가 없어서 스크롤이 멈춘 뒤 직접 스냅시킨다.
const SETTLE_DELAY_MS = 110;
// scrollTo 애니메이션 중에 스냅 계산이 다시 끼어들지 않도록 잠그는 시간.
const PROGRAMMATIC_LOCK_MS = 450;
// 이 거리 이상 끌었으면 클릭이 아니라 드래그로 본다.
const DRAG_SLOP = 6;
// 손을 뗀 순간의 속도를 얼마나 앞당겨 반영할지(ms).
const FLICK_PROJECTION_MS = 90;

interface DragState {
  active: boolean;
  moved: boolean;
  startPointerX: number;
  startOffset: number;
  startIndex: number;
  lastPointerX: number;
  lastMoveTime: number;
  velocity: number;
}

function createDragState(): DragState {
  return {
    active: false,
    moved: false,
    startPointerX: 0,
    startOffset: 0,
    startIndex: 0,
    lastPointerX: 0,
    lastMoveTime: 0,
    velocity: 0,
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

// react-native 타입에는 grab 커서가 없지만, 웹에서는 드래그 가능하다는 신호가 필요하다.
// userSelect는 드래그 중 텍스트가 선택되는 것을 막는다.
const GRAB_STYLE = { cursor: 'grab', userSelect: 'none' } as unknown as ViewStyle;
const GRABBING_STYLE = { cursor: 'grabbing', userSelect: 'none' } as unknown as ViewStyle;

export function ProjectCarousel({
  projects,
  isLoading,
  errorMessage,
  emptyMessage,
  onProjectPress,
}: ProjectCarouselProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const offsetRef = useRef(0);
  const activeIndexRef = useRef(0);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pressLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockUntilRef = useRef(0);
  const dragRef = useRef<DragState>(createDragState());
  const suppressPressRef = useRef(false);

  const pages = chunk(projects, CHUNK_SIZE);
  const pageCount = pages.length;
  // 화면 폭이 바뀌면 카드도 같이 줄어들도록 매 렌더 화면 폭에서 계산한다.
  const cardWidth = Math.max(windowWidth - SIDE_INSET * 2, 1);
  const snapInterval = cardWidth + CARD_GAP;
  const maxOffset = Math.max((pageCount - 1) * snapInterval, 0);

  const setIndex = useCallback((index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, []);

  const indexFromOffset = useCallback(
    (offset: number) => clamp(Math.round(offset / snapInterval), 0, Math.max(pageCount - 1, 0)),
    [pageCount, snapInterval],
  );

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      const target = clamp(index, 0, Math.max(pageCount - 1, 0));
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      lockUntilRef.current = animated ? Date.now() + PROGRAMMATIC_LOCK_MS : 0;
      setIndex(target);
      scrollRef.current?.scrollTo({ x: target * snapInterval, animated });
    },
    [pageCount, setIndex, snapInterval],
  );

  // 스크롤이 멈춘 위치가 카드 중앙이 아니면 가장 가까운 카드로 부드럽게 붙인다.
  const settle = useCallback(() => {
    if (dragRef.current.active) return;
    const index = indexFromOffset(offsetRef.current);
    if (Math.abs(offsetRef.current - index * snapInterval) > 1) {
      scrollToIndex(index);
    } else {
      setIndex(index);
    }
  }, [indexFromOffset, scrollToIndex, setIndex, snapInterval]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetRef.current = event.nativeEvent.contentOffset.x;
      if (!IS_WEB || dragRef.current.active || Date.now() < lockUntilRef.current) return;
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(settle, SETTLE_DELAY_MS);
    },
    [settle],
  );

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      offsetRef.current = event.nativeEvent.contentOffset.x;
      setIndex(indexFromOffset(offsetRef.current));
    },
    [indexFromOffset, setIndex],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      if (!IS_WEB || event.nativeEvent.pointerType !== 'mouse' || pageCount < 2) return;
      const pointerX = event.nativeEvent.clientX;
      dragRef.current = {
        active: true,
        moved: false,
        startPointerX: pointerX,
        startOffset: offsetRef.current,
        startIndex: activeIndexRef.current,
        lastPointerX: pointerX,
        lastMoveTime: Date.now(),
        velocity: 0,
      };
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      lockUntilRef.current = 0;
      setIsDragging(true);
    },
    [pageCount],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag.active) return;

      const pointerX = event.nativeEvent.clientX;
      const now = Date.now();
      const elapsed = now - drag.lastMoveTime;
      if (elapsed > 0) drag.velocity = (pointerX - drag.lastPointerX) / elapsed;
      drag.lastPointerX = pointerX;
      drag.lastMoveTime = now;

      const delta = pointerX - drag.startPointerX;
      if (Math.abs(delta) > DRAG_SLOP) drag.moved = true;

      const next = clamp(drag.startOffset - delta, 0, maxOffset);
      offsetRef.current = next;
      scrollRef.current?.scrollTo({ x: next, animated: false });
    },
    [maxOffset],
  );

  const endDrag = useCallback(() => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    setIsDragging(false);

    if (drag.moved) {
      // 드래그 직후에 발생하는 클릭이 상세 이동으로 이어지지 않게 잠깐 막는다.
      suppressPressRef.current = true;
      if (pressLockTimerRef.current) clearTimeout(pressLockTimerRef.current);
      pressLockTimerRef.current = setTimeout(() => {
        suppressPressRef.current = false;
      }, 220);
    }

    const isStale = Date.now() - drag.lastMoveTime > 60;
    const velocity = isStale ? 0 : drag.velocity;
    const projected = offsetRef.current - velocity * FLICK_PROJECTION_MS;
    const nearest = Math.round(projected / snapInterval);
    // 한 번의 드래그로는 한 장씩만 넘어가도록 제한한다.
    scrollToIndex(clamp(nearest, drag.startIndex - 1, drag.startIndex + 1));
  }, [scrollToIndex, snapInterval]);

  const handleRowPress = useCallback(
    (id: string) => {
      if (suppressPressRef.current) return;
      onProjectPress?.(id);
    },
    [onProjectPress],
  );

  // 화면 폭이 바뀌면 스냅 위치도 바뀌므로 현재 카드를 다시 중앙에 맞춘다.
  useEffect(() => {
    if (pageCount === 0) return;
    const index = clamp(activeIndexRef.current, 0, pageCount - 1);
    activeIndexRef.current = index;
    offsetRef.current = index * snapInterval;
    scrollRef.current?.scrollTo({ x: offsetRef.current, animated: false });
  }, [pageCount, snapInterval]);

  useEffect(
    () => () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      if (pressLockTimerRef.current) clearTimeout(pressLockTimerRef.current);
    },
    [],
  );

  // 빈 배열이면 캐러셀이 아무것도 없는 빈 ScrollView만 그리게 되므로 상태 문구로 대체한다.
  if (isLoading || errorMessage || pageCount === 0) {
    return (
      <View className="mt-4 px-8">
        <View className="rounded-[36px] bg-white px-5 py-3">
          <SectionPlaceholder
            isLoading={isLoading}
            errorMessage={errorMessage}
            emptyMessage={emptyMessage}
          />
        </View>
      </View>
    );
  }

  const dragStyle = IS_WEB && pageCount > 1 ? (isDragging ? GRABBING_STYLE : GRAB_STYLE) : null;

  return (
    <View
      className="mt-4"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
      style={dragStyle}
    >
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        disableIntervalMomentum
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: SIDE_INSET }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          // 웹에는 네이티브 애니메이션 모듈이 없어서 켜두면 경고만 남는다.
          useNativeDriver: !IS_WEB,
          listener: handleScroll,
        })}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        {pages.map((page, pageIndex) => {
          const inputRange = [
            (pageIndex - 1) * snapInterval,
            pageIndex * snapInterval,
            (pageIndex + 1) * snapInterval,
          ];
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [INACTIVE_OPACITY, 1, INACTIVE_OPACITY],
            extrapolate: 'clamp',
          });

          return (
            // Animated.View에는 nativewind className이 적용되지 않으므로 카드 스타일은 안쪽 View가 갖는다.
            <Animated.View
              key={page[0]?.id ?? pageIndex}
              style={{
                width: cardWidth,
                marginRight: pageIndex === pageCount - 1 ? 0 : CARD_GAP,
                opacity,
              }}
            >
              <View className="rounded-[36px] bg-white px-5 py-3">
                {page.map((project) => (
                  <RecommendedProjectRow
                    key={project.id}
                    data={project}
                    onPress={() => handleRowPress(project.id)}
                  />
                ))}

                {/* 중앙에 없는 카드를 누르면 상세로 가는 대신 그 카드를 중앙으로 옮긴다. */}
                {pageIndex !== activeIndex ? (
                  <Pressable
                    accessibilityLabel={`${pageIndex + 1}번째 추천 프로젝트 목록 보기`}
                    accessibilityRole="button"
                    onPress={() => {
                      if (suppressPressRef.current) return;
                      scrollToIndex(pageIndex);
                    }}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
              </View>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>

      {pageCount > 1 ? (
        <View className="mt-3 flex-row justify-center gap-1.5">
          {pages.map((page, index) => {
            const dotOpacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * snapInterval,
                index * snapInterval,
                (index + 1) * snapInterval,
              ],
              outputRange: [0, 1, 0],
              extrapolate: 'clamp',
            });

            return (
              <View
                key={page[0]?.id ?? index}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: '#cccfdb' }}
              >
                <Animated.View
                  style={{
                    height: DOT_SIZE,
                    width: DOT_SIZE,
                    borderRadius: DOT_SIZE / 2,
                    backgroundColor: '#3946a6',
                    opacity: dotOpacity,
                  }}
                />
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
