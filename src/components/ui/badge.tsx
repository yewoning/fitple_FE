import { Text, View } from 'react-native';

import { RecruitStatus } from '@/types';

export function StatusBadge({ status }: { status: RecruitStatus }) {
  const isRecruiting = status === '모집중';
  return (
    <View
      className={`self-start rounded-lg px-2 py-[3px] ${
        isRecruiting ? 'bg-white-dark-sky-blue' : 'bg-gray-2'
      }`}
    >
      <Text className={`font-sans text-[11px] font-bold ${isRecruiting ? 'text-sky-blue' : 'text-gray-5'}`}>
        {status}
      </Text>
    </View>
  );
}

export function DDayBadge({ label }: { label: string }) {
  return <Text className="font-sans text-[13px] font-bold text-sky-blue">{label}</Text>;
}
