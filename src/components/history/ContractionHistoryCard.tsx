import { View, Text } from "@tarojs/components";
import dayjs from "dayjs";
import { formatInterval } from "../../utils/contractionUtils";

interface ContractionRecord {
  id: string;
  duration: number;
}

interface ProcessedContractionRecord extends ContractionRecord {
  intervalSeconds: number;
  showDash: boolean;
  isLabor: boolean;
}

interface ContractionHistoryCardProps {
  date: string;
  records: ContractionRecord[];
}

export const ContractionHistoryCard = ({
  date,
  records,
}: ContractionHistoryCardProps) => {
  // 计算间隔时间的函数
  const calculateInterval = (
    currentRecord: ContractionRecord,
    previousRecord: ContractionRecord
  ) => {
    return dayjs(currentRecord.id).diff(dayjs(previousRecord.id), "seconds");
  };

  // 处理记录数据
  const processedRecords: ProcessedContractionRecord[] = records
    .sort((a, b) => dayjs(a.id).diff(dayjs(b.id)))
    .map((record, index) => {
      let intervalSeconds = 0;
      let showDash = true;
      let isLabor = false;

      // 不是第一条记录时计算间隔
      if (index > 0) {
        const previousRecord = records[index - 1];
        intervalSeconds = calculateInterval(record, previousRecord);

        // 间隔时间 > 60分钟显示 "--:--"
        showDash = intervalSeconds > 3600;
        // 间隔时间 < 5分钟显示临产标签
        isLabor = intervalSeconds > 0 && intervalSeconds < 300;
      }

      return {
        ...record,
        intervalSeconds,
        showDash,
        isLabor,
      };
    });

  // 计算当日统计
  const totalCount = records.length;
  const avgDuration =
    totalCount > 0
      ? Math.round(records.reduce((sum, r) => sum + r.duration, 0) / totalCount)
      : 0;

  const laborCount = processedRecords.filter((r) => r.isLabor).length;

  const isToday = dayjs(date).isSame(dayjs(), "day");
  const isYesterday = dayjs(date).isSame(dayjs().subtract(1, "day"), "day");

  const getDateDisplay = () => {
    if (isToday) return "今天";
    if (isYesterday) return "昨天";
    return dayjs(date).format("MM月DD日");
  };

  return (
    <View className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 mb-4 shadow-lg shadow-pink-200/20 border border-pink-100/50">
      {/* 日期标题 */}
      <View className="flex items-center justify-between mb-4">
        <View className="flex items-center">
          <Text className="text-lg font-bold text-gray-800 mr-2">
            {getDateDisplay()}
          </Text>
          <Text className="text-sm text-gray-500">
            {dayjs(date).format("YYYY年MM月DD日 dddd")}
          </Text>
        </View>
        <Text className="text-2xl">⏱️</Text>
      </View>

      {/* 当日统计卡片 */}
      <View className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-blue-200/60">
        <View className="flex justify-between items-center">
          <View className="flex-1 text-center">
            <Text className="text-2xl font-bold text-blue-600">
              {totalCount}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">宫缩次数</Text>
          </View>
          <View className="flex-1 text-center">
            <Text className="text-2xl font-bold text-blue-600">
              {avgDuration}秒
            </Text>
            <Text className="text-sm text-gray-600 mt-1">平均持续</Text>
          </View>
          <View className="flex-1 text-center">
            <Text className="text-2xl font-bold text-red-600">
              {laborCount}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">临产信号</Text>
          </View>
        </View>
      </View>

      {/* 详细记录 */}
      {processedRecords.length > 0 && (
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-3">
            详细记录
          </Text>

          {/* 表头 */}
          <View className="flex bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl p-3 mb-2 border border-gray-200">
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

          {/* 记录列表 */}
          <View className="space-y-1">
            {processedRecords
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
      )}
    </View>
  );
};
