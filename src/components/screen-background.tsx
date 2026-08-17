import { View, useWindowDimensions } from 'react-native';

// 좌측 상단 sky-blue 블롭
const BLUE_BLOB_SIZE_RATIO = 0.9;
const BLUE_BLOB_OFFSET_RATIO = 0.38;
const BLUE_BLOB_BLUR = 90;
const BLUE_BLOB_OPACITY = 0.55;

// 우측 중단 yellow-2 블롭
const YELLOW_BLOB_SIZE_RATIO = 0.6;
const YELLOW_BLOB_OFFSET_RATIO = 0.4;
const YELLOW_BLOB_TOP_RATIO = 0.38;
const YELLOW_BLOB_BLUR = 65;
const YELLOW_BLOB_OPACITY = 0.6;

export function ScreenBackground() {
  const { width, height } = useWindowDimensions();

  const blueBlobSize = width * BLUE_BLOB_SIZE_RATIO;
  const yellowBlobSize = width * YELLOW_BLOB_SIZE_RATIO;

  return (
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      <View
        className="absolute rounded-full bg-sky-blue"
        style={{
          width: blueBlobSize,
          height: blueBlobSize,
          top: -blueBlobSize * BLUE_BLOB_OFFSET_RATIO,
          left: -blueBlobSize * BLUE_BLOB_OFFSET_RATIO,
          opacity: BLUE_BLOB_OPACITY,
          filter: `blur(${BLUE_BLOB_BLUR}px)`,
        }}
      />
      <View
        className="absolute rounded-full bg-yellow-2"
        style={{
          width: yellowBlobSize,
          height: yellowBlobSize,
          top: height * YELLOW_BLOB_TOP_RATIO - yellowBlobSize * YELLOW_BLOB_OFFSET_RATIO,
          right: -yellowBlobSize * YELLOW_BLOB_OFFSET_RATIO,
          opacity: YELLOW_BLOB_OPACITY,
          filter: `blur(${YELLOW_BLOB_BLUR}px)`,
        }}
      />
    </View>
  );
}
