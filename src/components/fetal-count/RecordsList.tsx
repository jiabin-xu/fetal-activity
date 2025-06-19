import { View, Text } from "@tarojs/components";
import { formatStartTime } from "@/utils/time";
import { Card } from "@/components/common/Card";
import Taro from "@tarojs/taro";

interface Record {
  id: string;
  startTime: number;
  totalClicks: number;
  validCount: number;
}

interface RecordsListProps {
  records: Record[];
  totalSessions: number;
  totalCounts: number;
}

export const RecordsList = ({
  records,
  totalSessions,
  totalCounts,
}: RecordsListProps) => {
  const viewHistory = () => {
    Taro.showToast({
      title: "历史记录功能开发中",
      icon: "none",
    });
  };

  return (
    <Card variant="default" className="p-5 mb-8">
      <View className="flex items-center justify-between mb-4">
        <View className="flex items-center">
          <Text className="text-base font-semibold text-gray-800 mr-2">
            今日记录
          </Text>
          <Text className="text-lg">📋</Text>
        </View>
        <View
          className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full"
          onClick={viewHistory}
        >
          <Text className="text-xs text-blue-600 font-semibold">查看历史</Text>
        </View>
      </View>

      <View className="mb-4">
        <View className="flex bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl p-3 mb-3 border border-gray-200">
          <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
            开始时间
          </Text>
          <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
            实际点击
          </Text>
          <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
            有效胎动
          </Text>
        </View>

        <View className="space-y-2">
          {records
            .slice(-5)
            .reverse()
            .map((record) => (
              <View
                key={record.id}
                className="flex py-3 px-3 bg-white/80 rounded-xl border border-gray-200/60"
              >
                <Text className="flex-1 text-center text-sm font-semibold text-pink-600">
                  {formatStartTime(record.startTime)}
                </Text>
                <Text className="flex-1 text-center text-sm font-bold text-pink-600">
                  {record.totalClicks}
                </Text>
                <Text className="flex-1 text-center text-sm font-bold text-pink-600">
                  {record.validCount}
                </Text>
              </View>
            ))}
        </View>

        {records.length > 5 && (
          <Text className="text-xs text-gray-500 text-center mt-2">
            仅显示最近5条记录
          </Text>
        )}
      </View>

      <Card variant="secondary" className="p-4">
        <Text className="text-sm font-medium text-gray-800 text-center">
          预估12小时胎动数：
          <Text className="text-pink-600 font-bold text-lg">
            {totalSessions > 0
              ? Math.round((totalCounts / totalSessions) * 12)
              : 0}
          </Text>{" "}
          次
        </Text>
        <Text className="text-xs text-gray-600 text-center mt-1">
          基于今日 {totalSessions} 次记录，平均每次{" "}
          {totalSessions > 0 ? (totalCounts / totalSessions).toFixed(1) : 0}{" "}
          次胎动
        </Text>
      </Card>
    </Card>
  );
};
