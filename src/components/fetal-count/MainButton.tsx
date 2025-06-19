import { View, Text, Image } from "@tarojs/components";
import babyIcon from "../../assets/baby.png";
import "./MainButton.scss";

interface MainButtonProps {
  isActive: boolean;
  onClick: () => void;
}

export const MainButton = ({ isActive, onClick }: MainButtonProps) => {
  return (
    <View className="flex justify-center">
      <View
        className={`main-button w-44 h-44 rounded-full text-lg font-semibold transition-all duration-500 flex flex-col items-center justify-center transform hover:scale-105 ${
          isActive
            ? "active bg-gradient-to-br from-pink-200 to-rose-200 shadow-lg shadow-pink-200/50"
            : "inactive bg-gradient-to-br from-pink-300 to-rose-300 text-white shadow-lg shadow-pink-200/50 border-pink-300 hover:shadow-xl hover:shadow-pink-200/60"
        }`}
        onClick={onClick}
        style={{
          cursor: "pointer",
        }}
      >
        {!isActive ? (
          <View className="flex flex-col items-center justify-center transform transition-all duration-300">
            <Text className="start-text text-2xl font-bold">开始记录</Text>
          </View>
        ) : (
          <View className="flex flex-col items-center justify-center">
            <Image
              src={babyIcon}
              className="baby-icon w-40 h-40 transform transition-all duration-700 rounded-full"
              style={{
                filter: "drop-shadow(0 4px 8px rgba(244, 114, 182, 0.3))",
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
};
