import { View, Text } from "@tarojs/components";
import dayjs from "dayjs";

interface FetalRecord {
  id: string;
  validCount: number;
  totalClicks: number;
}

interface FetalHistoryCardProps {
  date: string;
  records: FetalRecord[];
}

export const FetalHistoryCard = ({ date, records }: FetalHistoryCardProps) => {
  // 计算当日统计
  const totalSessions = records.length;
  const totalCounts = records.reduce(
    (sum, record) => sum + record.validCount,
    0
  );
  const totalClicks = records.reduce(
    (sum, record) => sum + record.totalClicks,
    0
  );
  const avgPerSession =
    totalSessions > 0 ? (totalCounts / totalSessions).toFixed(1) : "0";

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
        <Text className="text-2xl">👶</Text>
      </View>

      {/* 当日统计卡片 */}
      <View className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 mb-4 border border-pink-200/60">
        <View className="flex justify-between items-center">
          <View className="flex-1 text-center">
            <Text className="text-2xl font-bold text-pink-600">
              {totalSessions}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">记录次数</Text>
          </View>
          <View className="flex-1 text-center">
            <Text className="text-2xl font-bold text-pink-600">
              {totalCounts}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">有效胎动</Text>
          </View>
          <View className="flex-1 text-center">
            <Text className="text-2xl font-bold text-pink-600">
              {avgPerSession}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">平均/次</Text>
          </View>
        </View>
      </View>

      {/* 详细记录 */}
      {records.length > 0 && (
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-3">
            详细记录
          </Text>

          {/* 表头 */}
          <View className="flex bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl p-3 mb-2 border border-gray-200">
            <View className="flex-1 flex items-center justify-center">
              <Text className="text-sm font-semibold text-gray-700">
                开始时间
              </Text>
            </View>
            <View className="flex-1 flex items-center justify-center">
              <Text className="text-sm font-semibold text-gray-700">
                实际点击
              </Text>
            </View>
            <View className="flex-1 flex items-center justify-center">
              <Text className="text-sm font-semibold text-gray-700">
                有效胎动
              </Text>
            </View>
          </View>

          {/* 记录列表 */}
          <View className="space-y-1">
            {records
              .sort((a, b) =>
                dayjs(b.id, "YYYY-MM-DD HH:mm").diff(
                  dayjs(a.id, "YYYY-MM-DD HH:mm")
                )
              )
              .map((record) => (
                <View
                  key={record.id}
                  className="flex items-center py-2 px-3 bg-white/80 rounded-xl border border-gray-200/60"
                >
                  <View className="flex-1 flex items-center justify-center">
                    <Text className="text-sm font-semibold text-pink-600">
                      {dayjs(record.id, "YYYY-MM-DD HH:mm").format("HH:mm")}
                    </Text>
                  </View>
                  <View className="flex-1 flex items-center justify-center">
                    <Text className="text-sm font-bold text-pink-600">
                      {record.totalClicks}次
                    </Text>
                  </View>
                  <View className="flex-1 flex items-center justify-center">
                    <Text className="text-sm font-bold text-pink-600">
                      {record.validCount}次
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </View>
      )}
    </View>
  );
};
