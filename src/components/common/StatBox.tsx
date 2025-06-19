import { View, Text } from "@tarojs/components";

interface StatBoxProps {
  value: number | string;
  label: string;
}

export const StatBox = ({ value, label }: StatBoxProps) => {
  return (
    <View>
      <Text className="text-xl font-bold text-pink-600">{value}</Text>
      <Text className="text-xs text-gray-800 font-medium">{label}</Text>
    </View>
  );
};
