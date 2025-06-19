import { View, Text } from "@tarojs/components";
import { Button } from "@nutui/nutui-react-taro";
import { formatDuration } from "../../utils/contractionUtils";

interface RecordingAreaProps {
  elapsedTime: number;
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const RecordingArea = ({
  elapsedTime,
  isRecording,
  onStart,
  onStop,
}: RecordingAreaProps) => {
  return (
    <View className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 mb-6 shadow-xl shadow-pink-200/40 border border-pink-100/50">
      {/* 当前状态显示 */}
      <View className="text-center mb-8">
        <View className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4 border border-blue-100">
          <Text className="text-5xl font-mono font-bold text-pink-600 mb-2">
            {formatDuration(elapsedTime)}
          </Text>
          <Text className="text-sm text-gray-800 font-medium">
            {isRecording ? "宫缩进行中..." : "等待开始"}
          </Text>
        </View>
      </View>

      {/* 主按钮 */}
      <View className="flex justify-center">
        <Button
          className={`w-44 h-44 rounded-full text-lg font-semibold transition-all duration-300 flex flex-col items-center justify-center shadow-2xl border-4 ${
            !isRecording
              ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-blue-200 border-blue-300"
              : "bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-red-200 border-red-300"
          }`}
          onClick={isRecording ? onStop : onStart}
        >
          {!isRecording ? (
            <View className="flex flex-col items-center justify-center">
              <Text className="text-4xl mb-2">⏱️</Text>
              <Text className="text-lg font-semibold">开始记录</Text>
            </View>
          ) : (
            <View className="flex flex-col items-center justify-center">
              <Text className="text-4xl mb-2">⏹️</Text>
              <Text className="text-base font-semibold">宫缩结束</Text>
              <Text className="text-sm opacity-90">点击停止</Text>
            </View>
          )}
        </Button>
      </View>
    </View>
  );
};
