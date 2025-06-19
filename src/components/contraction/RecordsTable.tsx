import { View, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { ProcessedContractionRecord } from "../../hooks/useContractionRecords";
import { formatStartTime, formatInterval } from "../../utils/contractionUtils";
import dayjs from "dayjs";

interface TodayStats {
  todayRecords: ProcessedContractionRecord[];
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
      Taro.navigateTo({
        url: "/pages/history/index",
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
          <View className="w-20 flex items-center justify-center">
            <Text className="text-sm font-semibold text-gray-700">
              开始时间
            </Text>
          </View>
          <View className="w-20 flex items-center justify-center">
            <Text className="text-sm font-semibold text-gray-700">
              持续时间
            </Text>
          </View>
          <View className="flex-1 flex items-center justify-center">
            <Text className="text-sm font-semibold text-gray-700">
              间隔时间
            </Text>
          </View>
        </View>

        {/* 表格数据 */}
        <View className="space-y-1">
          {todayStats.todayRecords
            .slice()
            .reverse()
            .map((record) => (
              <View
                key={record.id}
                className="flex items-center py-2 px-3 bg-white/80 rounded-xl border border-gray-200/60"
              >
                <View className="w-20 flex items-center justify-center">
                  <Text className="text-sm font-semibold text-pink-600">
                    {dayjs(record.id).format("HH:mm:ss")}
                  </Text>
                </View>
                <View className="w-20 flex items-center justify-center">
                  <Text className="text-sm font-bold text-pink-600">
                    {record.duration}秒
                  </Text>
                </View>
                <View className="flex-1 flex items-center justify-center min-h-8">
                  {record.showDash ? (
                    <Text className="text-sm font-bold text-gray-400">
                      --:--
                    </Text>
                  ) : (
                    <View className="flex items-center justify-center">
                      <Text className="text-sm font-bold text-pink-600">
                        {formatInterval(record.intervalSeconds)}
                      </Text>
                      {record.isLabor && (
                        <View className="ml-2 px-2 py-1 bg-red-100 rounded-lg">
                          <Text className="text-xs text-red-600 font-bold">
                            临产
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            ))}
        </View>
      </View>
    </View>
  );
};
