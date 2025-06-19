import { View } from "@tarojs/components";
import { useFetalCount } from "@/hooks/useFetalCount";
import { Card } from "@/components/common/Card";
import { TipCard } from "@/components/fetal-count/TipCard";
import { CounterDisplay } from "@/components/fetal-count/CounterDisplay";
import { MainButton } from "@/components/fetal-count/MainButton";
import { RecordsList } from "@/components/fetal-count/RecordsList";

export default function FetalCount() {
  const {
    isActive,
    currentCount,
    remainingTime,
    totalClicks,
    startSession,
    recordMovement,
    getTodayStats,
  } = useFetalCount();

  const todayStats = getTodayStats();

  const handleMainButton = () => {
    if (!isActive) {
      startSession();
    } else {
      recordMovement();
    }
  };

  return (
    <View className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <View className="px-6 py-2">
        <TipCard />

        <Card variant="primary" className="p-8 mb-6">
          <CounterDisplay
            remainingTime={remainingTime}
            isActive={isActive}
            totalClicks={totalClicks}
            currentCount={currentCount}
          />
          <MainButton isActive={isActive} onClick={handleMainButton} />
        </Card>

        <RecordsList
          records={todayStats.todayRecords}
          totalSessions={todayStats.totalSessions}
          totalCounts={todayStats.totalCounts}
        />
      </View>
    </View>
  );
}
