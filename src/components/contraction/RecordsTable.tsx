import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { ContractionRecord } from "../../hooks/useContractionRecords";
import { formatStartTime, formatInterval } from "../../utils/contractionUtils";

interface TodayStats {
  totalCount: number;
  avgDuration: number;
  avgInterval: number;
  todayRecords: ContractionRecord[];
}

interface RecordsTableProps {
  todayStats: TodayStats;
  onViewHistory?: () => void;
}

export const RecordsTable = ({
  todayStats,
  onViewHistory,
}: RecordsTableProps) => {
  const handleViewHistory = () => {
    if (onViewHistory) {
      onViewHistory();
    } else {
      Taro.showToast({
        title: "历史记录功能开发中",
        icon: "none",
      });
    }
  };

  if (todayStats.todayRecords.length === 0) {
    return null;
  }

  return (
    <View className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 mb-8 shadow-lg shadow-pink-200/30 border border-pink-100/50">
      <View className="flex items-center justify-between mb-4">
        <View className="flex items-center">
          <Text className="text-base font-semibold text-gray-800 mr-2">
            今日记录
          </Text>
          <Text className="text-lg">📋</Text>
        </View>
        <View
          className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full"
          onClick={handleViewHistory}
        >
          <Text className="text-xs text-blue-600 font-semibold">查看历史</Text>
        </View>
      </View>

      {/* 记录表格 */}
      <View className="mb-4">
        {/* 表头 */}
        <View className="flex bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl p-3 mb-3 border border-gray-200">
          <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
            开始时间
          </Text>
          <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
            持续时间
          </Text>
          <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
            间隔时间
          </Text>
        </View>

        {/* 表格数据 */}
        <View className="space-y-2">
          {todayStats.todayRecords
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
                  {record.duration}秒
                </Text>
                <Text className="flex-1 text-center text-sm font-bold text-pink-600">
                  {formatInterval(record.interval)}
                </Text>
              </View>
            ))}
        </View>

        {todayStats.todayRecords.length > 5 && (
          <Text className="text-xs text-gray-500 text-center mt-2">
            仅显示最近5条记录
          </Text>
        )}
      </View>

      {/* 统计信息 */}
      <View className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
        <Text className="text-sm font-medium text-gray-800 text-center">
          今日共记录{" "}
          <Text className="text-pink-600 font-bold text-lg">
            {todayStats.totalCount}
          </Text>{" "}
          次宫缩
        </Text>
        {todayStats.avgInterval > 0 && (
          <Text className="text-xs text-gray-600 text-center mt-1">
            平均持续 {todayStats.avgDuration} 秒，平均间隔{" "}
            {formatInterval(todayStats.avgInterval)}
          </Text>
        )}
      </View>
    </View>
  );
};
