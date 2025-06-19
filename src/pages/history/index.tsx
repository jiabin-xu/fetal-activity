import { View, Text } from "@tarojs/components";
import { useState } from "react";
import { useFetalCount } from "../../hooks/useFetalCount";
import { useContractionRecords } from "../../hooks/useContractionRecords";
import { HistoryTabs } from "../../components/history/HistoryTabs";
import { FetalHistoryCard } from "../../components/history/FetalHistoryCard";
import { ContractionHistoryCard } from "../../components/history/ContractionHistoryCard";
import dayjs from "dayjs";

export default function History() {
  const [activeTab, setActiveTab] = useState<"fetal" | "contraction">("fetal");
  const fetalHook = useFetalCount();
  const contractionHook = useContractionRecords();

  // 按日期分组胎动记录
  const groupFetalRecordsByDate = () => {
    const groups: Record<string, any[]> = {};
    fetalHook.records.forEach((record) => {
      const date = dayjs(record.id, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
    });
    return groups;
  };

  // 按日期分组宫缩记录
  const groupContractionRecordsByDate = () => {
    const groups: Record<string, any[]> = {};
    contractionHook.records.forEach((record) => {
      const date = dayjs(record.id).format("YYYY-MM-DD");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
    });
    return groups;
  };

  const fetalGroups = groupFetalRecordsByDate();
  const contractionGroups = groupContractionRecordsByDate();

  // 获取所有日期并排序（最新的在前）
  const fetalDates = Object.keys(fetalGroups).sort((a, b) =>
    dayjs(b).diff(dayjs(a))
  );
  const contractionDates = Object.keys(contractionGroups).sort((a, b) =>
    dayjs(b).diff(dayjs(a))
  );

  return (
    <View className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <View className="px-6 py-4">
        {/* 页面标题 */}
        <View className="text-center mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            历史记录
          </Text>
          <Text className="text-sm text-gray-600">回顾过往，守护健康</Text>
        </View>

        {/* Tabs切换 */}
        <HistoryTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          fetalCount={fetalDates.length}
          contractionCount={contractionDates.length}
        />

        {/* 内容区域 */}
        <View className="mt-6">
          {activeTab === "fetal" && (
            <View>
              {fetalDates.length > 0 ? (
                <View className="space-y-4">
                  {fetalDates.map((date) => (
                    <FetalHistoryCard
                      key={date}
                      date={date}
                      records={fetalGroups[date]}
                    />
                  ))}
                </View>
              ) : (
                <View className="py-20 flex flex-col items-center justify-center bg-white/80 rounded-3xl border border-gray-200/60">
                  <Text className="text-6xl mb-4">👶</Text>
                  <Text className="text-gray-500 text-lg font-medium mb-2">
                    暂无胎动记录
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    开始记录宝宝的活动吧
                  </Text>
                </View>
              )}
            </View>
          )}

          {activeTab === "contraction" && (
            <View>
              {contractionDates.length > 0 ? (
                <View className="space-y-4">
                  {contractionDates.map((date) => (
                    <ContractionHistoryCard
                      key={date}
                      date={date}
                      records={contractionGroups[date]}
                    />
                  ))}
                </View>
              ) : (
                <View className="py-20 flex flex-col items-center justify-center bg-white/80 rounded-3xl border border-gray-200/60">
                  <Text className="text-6xl mb-4">⏱️</Text>
                  <Text className="text-gray-500 text-lg font-medium mb-2">
                    暂无宫缩记录
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    记录宫缩为分娩做准备
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
