import { Text, TouchableOpacity, View } from 'react-native';

export interface SegmentOption {
  key: string;
  label: string;
}

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
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.8}
            className={`rounded-full px-3.5 py-[7px] ${active ? 'bg-sky-blue' : 'bg-gray-2'}`}
          >
            <Text className={`font-sans text-[13px] font-bold ${active ? 'text-white' : 'text-gray-6'}`}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
