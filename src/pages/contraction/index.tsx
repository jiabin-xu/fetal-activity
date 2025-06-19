import { View } from "@tarojs/components";
import { useContractionRecords } from "../../hooks/useContractionRecords";
import {
  TipsCard,
  RecordingArea,
  RecordsTable,
} from "../../components/contraction";

export default function ContractionRecord() {
  const {
    isRecording,
    elapsedTime,
    todayStats,
    startRecording,
    stopRecording,
  } = useContractionRecords();

  return (
    <View className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <View className="px-6 py-2">
        {/* 温馨提示 */}
        <TipsCard />

        {/* 主记录区域 */}
        <RecordingArea
          elapsedTime={elapsedTime}
          isRecording={isRecording}
          todayStats={todayStats}
          onStart={startRecording}
          onStop={stopRecording}
        />

        {/* 今日记录 */}
        <RecordsTable todayStats={todayStats} />
      </View>
    </View>
  );
}
