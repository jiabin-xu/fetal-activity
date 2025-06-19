import { View, Text } from "@tarojs/components";
import { formatTime } from "@/utils/time";
import { Card } from "@/components/common/Card";
import { StatBox } from "@/components/common/StatBox";

interface CounterDisplayProps {
  remainingTime: number;
  isActive: boolean;
  totalClicks?: number;
  currentCount?: number;
}

export const CounterDisplay = ({
  remainingTime,
  isActive,
  totalClicks,
  currentCount,
}: CounterDisplayProps) => {
  return (
    <View className="text-center mb-8">
      <Card variant="secondary" className="p-6 mb-4">
        <Text className="text-5xl font-mono font-bold text-pink-600 mb-2">
          {formatTime(remainingTime)}
        </Text>
        <Text className="text-sm text-gray-800 font-medium">
          {isActive ? "记录中..." : "准备开始"}
        </Text>
      </Card>

      {isActive && (
        <View className="flex justify-center space-x-4">
          <StatBox value={totalClicks || 0} label=" 实际点击" />
          <StatBox value={currentCount || 0} label=" 有效次数" />
        </View>
      )}
    </View>
  );
};
