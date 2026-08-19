import { Text, TouchableOpacity, View } from 'react-native';

export interface SegmentOption {
  key: string;
  label: string;
}

// 스크랩/지원 현황/오늘의 과제 화면 스크린샷 기준: 첫 번째("전체")는 항상 진한 남색,
// 나머지는 선택 시 하늘색, 비선택 시 연회색으로 표시됩니다.
export function SegmentedTabs({
  options,
  value,
  onChange,
}: {
  options: SegmentOption[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <View className="flex-row gap-2 px-4 py-3">
      {options.map((opt, index) => {
        const active = opt.key === value;
        const isAllTab = index === 0;
        const bgClass = isAllTab ? 'bg-dark-blue' : active ? 'bg-sky-blue' : 'bg-gray-2';
        const textClass = isAllTab || active ? 'text-white' : 'text-gray-6';
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.8}
            className={`rounded-full px-3.5 py-[7px] ${bgClass}`}
          >
            <Text className={`font-sans-semibold text-[13px] ${textClass}`}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
