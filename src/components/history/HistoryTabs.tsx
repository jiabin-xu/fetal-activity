import { View, Text } from "@tarojs/components";

interface HistoryTabsProps {
  activeTab: "fetal" | "contraction";
  onTabChange: (tab: "fetal" | "contraction") => void;
  fetalCount: number;
  contractionCount: number;
}

export const HistoryTabs = ({
  activeTab,
  onTabChange,
  fetalCount,
  contractionCount,
}: HistoryTabsProps) => {
  return (
    <View className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/60 shadow-lg shadow-pink-200/20">
      <View className="flex">
        {/* 胎动选项卡 */}
        <View
          className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
            activeTab === "fetal"
              ? "bg-gradient-to-r from-pink-100 to-rose-100 border border-pink-200 shadow-sm"
              : "hover:bg-gray-50"
          }`}
          onClick={() => onTabChange("fetal")}
        >
          <View className="flex items-center justify-center">
            <Text className="text-2xl mr-2">👶</Text>
            <View className="flex flex-col items-center">
              <Text
                className={`font-semibold text-sm ${
                  activeTab === "fetal" ? "text-pink-700" : "text-gray-600"
                }`}
              >
                胎动记录
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  activeTab === "fetal" ? "text-pink-600" : "text-gray-500"
                }`}
              >
                {fetalCount}天记录
              </Text>
            </View>
          </View>
        </View>

        {/* 宫缩选项卡 */}
        <View
          className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
            activeTab === "contraction"
              ? "bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 shadow-sm"
              : "hover:bg-gray-50"
          }`}
          onClick={() => onTabChange("contraction")}
        >
          <View className="flex items-center justify-center">
            <Text className="text-2xl mr-2">⏱️</Text>
            <View className="flex flex-col items-center">
              <Text
                className={`font-semibold text-sm ${
                  activeTab === "contraction"
                    ? "text-blue-700"
                    : "text-gray-600"
                }`}
              >
                宫缩记录
              </Text>
              <Text
                className={`text-xs mt-1 ${
                  activeTab === "contraction"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {contractionCount}天记录
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};
