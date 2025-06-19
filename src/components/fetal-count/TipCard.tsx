import { View, Text } from "@tarojs/components";

export const TipCard = () => {
  return (
    <View className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-6 border border-amber-200/60">
      <View className="flex items-start">
        <Text className="text-lg mr-3 mt-0.5">💡</Text>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-amber-800 mb-1">
            温馨提示
          </Text>
          <Text className="text-sm text-amber-700 leading-relaxed">
            5分钟内连续活动只算一次胎动～
          </Text>
        </View>
      </View>
    </View>
  );
};
