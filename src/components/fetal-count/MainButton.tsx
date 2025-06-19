import { View, Text } from "@tarojs/components";
import { Button } from "@nutui/nutui-react-taro";

interface MainButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export const MainButton = ({ isActive, onClick }: MainButtonProps) => {
  return (
    <View className="flex justify-center">
      <Button
        className={`w-44 h-44 rounded-full text-lg font-semibold transition-all duration-300 flex flex-col items-center justify-center shadow-2xl border-4 ${
          !isActive
            ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-blue-200 border-blue-300"
            : "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-pink-200 border-pink-300"
        }`}
        onClick={onClick}
      >
        {!isActive ? (
          <View className="flex flex-col items-center justify-center">
            <Text className="text-4xl mb-2">🎯</Text>
            <Text className="text-lg font-semibold">开始记录</Text>
          </View>
        ) : (
          <View className="flex flex-col items-center justify-center">
            <Text className="text-4xl mb-2">👶</Text>
            <Text className="text-base font-semibold">感受到了吗？</Text>
            <Text className="text-sm opacity-90">轻触记录</Text>
          </View>
        )}
      </Button>
    </View>
  );
};
