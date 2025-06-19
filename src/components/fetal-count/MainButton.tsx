import { View, Text, Image } from "@tarojs/components";
import { Button } from "@nutui/nutui-react-taro";
import babyIcon from "../../assets/baby.png";

interface MainButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export const MainButton = ({ isActive, onClick }: MainButtonProps) => {
  return (
    <View className="flex justify-center">
      <View
        className={`w-44 h-44 rounded-full text-lg font-semibold transition-all duration-300 flex flex-col items-center justify-center ${
          isActive
            ? " "
            : "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-pink-200 border-pink-300"
        }`}
        onClick={onClick}
      >
        {!isActive ? (
          <View className="flex flex-col items-center justify-center ">
            <Text className="text-lg font-semibold">开始记录</Text>
          </View>
        ) : (
          <View className="flex flex-col items-center justify-center">
            <Image src={babyIcon} className="w-44 h-44" />
          </View>
        )}
      </View>
    </View>
  );
};
