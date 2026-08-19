import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface Props extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
}

export function PrimaryButton({ label, variant = 'primary', loading, disabled, className, ...rest }: Props) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  const containerClass = [
    'h-[52px] items-center justify-center rounded-full px-5',
    isPrimary && 'bg-sky-blue',
    variant === 'secondary' && 'bg-gray-2',
    isOutline && 'border border-sky-blue bg-transparent',
    (disabled || loading) && 'opacity-50',
    typeof className === 'string' ? className : '',
  ]
    .filter(Boolean)
    .join(' ');

  const textClass = isPrimary ? 'text-white' : isOutline ? 'text-sky-blue' : 'text-black';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      className={containerClass}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#4876ee'} />
      ) : (
        <Text className={`font-sans text-[15px] font-semibold ${textClass}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
