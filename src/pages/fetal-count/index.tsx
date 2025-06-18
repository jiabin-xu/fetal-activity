import { useState, useEffect, useRef } from "react";
import { View, Text } from "@tarojs/components";
import { Button } from "@nutui/nutui-react-taro";
import Taro from "@tarojs/taro";

interface CountRecord {
  timestamp: number;
  count: number;
}

export default function FetalCount() {
  const [isActive, setIsActive] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(3600); // 倒计时（秒）
  const [totalClicks, setTotalClicks] = useState(0); // 实际点击次数
  const [records, setRecords] = useState<CountRecord[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [lastRecordTime, setLastRecordTime] = useState(0); // 上次记录胎动的时间
  const timerRef = useRef<NodeJS.Timeout>();

  // 计算今日统计
  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayRecords = records.filter(
      (r) => new Date(r.timestamp).toDateString() === today
    );

    const totalSessions = todayRecords.length;
    const totalCounts = todayRecords.reduce(
      (sum, record) => sum + record.count,
      0
    );
    const avgPerHour =
      totalSessions > 0 ? (totalCounts / totalSessions).toFixed(1) : "0";

    return { totalSessions, totalCounts, avgPerHour };
  };

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 开始计数或记录胎动
  const handleMainButton = () => {
    if (!isActive) {
      // 开始计数
      setIsActive(true);
      setCurrentCount(0);
      setTotalClicks(0);
      setRemainingTime(3600); // 重置为1小时倒计时
      setLastRecordTime(0);
      setSessionStartTime(Date.now());

      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            // 倒计时结束
            setIsActive(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }

            // 保存本次记录
            const newRecord: CountRecord = {
              timestamp: Date.now(),
              count: currentCount,
            };
            setRecords((prevRecords) => [...prevRecords, newRecord]);

            Taro.showToast({
              title: `计时完成！记录${currentCount}次胎动`,
              icon: "success",
              duration: 2000,
            });

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // 记录胎动
      const now = Date.now();
      setTotalClicks((prev) => prev + 1);

      // 检查是否在5分钟内（连续胎动只算1次）
      if (lastRecordTime && now - lastRecordTime < 5 * 60 * 1000) {
        // 5分钟内，只增加点击次数，不增加有效计数
        Taro.showToast({
          title: "5分钟内连续活动只算1次",
          icon: "none",
          duration: 1500,
        });
      } else {
        // 超过5分钟或首次点击，算作有效胎动
        setCurrentCount((prev) => prev + 1);
        setLastRecordTime(now);

        // 震动反馈
        Taro.vibrateShort();

        // 触觉反馈提示
        Taro.showToast({
          title: "胎动已记录",
          icon: "success",
          duration: 800,
        });
      }
    }
  };

  // 返回首页
  const goBack = () => {
    Taro.navigateBack();
  };

  // 查看历史记录
  const viewHistory = () => {
    Taro.showToast({
      title: "历史记录功能开发中",
      icon: "none",
    });
  };

  // 导航到其他页面
  const navigateTo = (page: string) => {
    Taro.showToast({
      title: `${page}功能开发中`,
      icon: "none",
    });
  };

  const todayStats = getTodayStats();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <View className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50 relative overflow-hidden">
      {/* 背景装饰 - 孕肚轮廓 */}
      <View className="absolute top-20 right-8 w-32 h-40 rounded-full bg-gradient-to-br from-sky-100/30 to-blue-100/30 opacity-60"></View>
      <View className="absolute bottom-32 left-8 w-24 h-32 rounded-full bg-gradient-to-br from-sky-100/20 to-blue-100/20 opacity-40"></View>

      {/* 顶部导航栏 */}
      <View className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-sky-100">
        <View
          className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center"
          onClick={goBack}
        >
          <Text className="text-sky-600 text-lg">←</Text>
        </View>
        <Text className="text-lg font-medium text-gray-800">胎动记录</Text>
        <View
          className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center"
          onClick={viewHistory}
        >
          <Text className="text-sky-600 text-sm">📊</Text>
        </View>
      </View>

      <View className="px-4 py-6 flex-1">
        {/* 主功能区 */}
        <View className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg shadow-sky-100/50 p-8 mb-6">
          {/* Tips提示 */}
          <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
            <View className="flex items-center">
              <Text className="text-base mr-2">💡</Text>
              <Text className="text-sm text-amber-700 flex-1">
                5分钟内连续活动只算作一次胎动
              </Text>
            </View>
          </View>

          {/* 第一部分：倒计时/实际点击/有效计数 */}
          <View className="text-center mb-8">
            {/* 倒计时显示 */}
            <View className="mb-6">
              <Text className="text-4xl font-mono font-bold text-sky-600 mb-2">
                {formatTime(remainingTime)}
              </Text>
              <Text className="text-sm text-gray-500">
                {isActive ? "剩余时间" : "倒计时"}
              </Text>
            </View>

            {/* 统计数据 */}
            {isActive && (
              <View className="flex justify-center space-x-8 mb-6">
                <View className="text-center">
                  <Text className="text-2xl font-bold text-gray-800">
                    {totalClicks}
                  </Text>
                  <Text className="text-xs text-gray-500">实际点击</Text>
                </View>
                <View className="text-center">
                  <Text className="text-2xl font-bold text-sky-600">
                    {currentCount}
                  </Text>
                  <Text className="text-xs text-gray-500">有效计数</Text>
                </View>
              </View>
            )}
          </View>

          {/* 第二部分：大型按钮 */}
          <View className="flex justify-center">
            <Button
              className={`w-40 h-40 rounded-full text-xl font-bold transition-all duration-200 flex flex-col items-center justify-center ${
                !isActive
                  ? "bg-gradient-to-br from-sky-400 to-sky-500 text-white shadow-lg shadow-sky-200"
                  : "bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg shadow-green-200"
              }`}
              onClick={handleMainButton}
            >
              {!isActive ? (
                "开始"
              ) : (
                <View className="flex flex-col items-center justify-center">
                  <Text className="text-4xl mb-1">👣</Text>
                  <Text className="text-base font-bold">动一下，点一下</Text>
                </View>
              )}
            </Button>
          </View>
        </View>

        {/* 数据卡片 */}
        <View className="space-y-4 mb-20">
          {/* 当日统计 */}
          <View className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-sky-100/30">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              今日统计
            </Text>
            <Text className="text-lg text-gray-800">
              已完成 {todayStats.totalSessions} 次，平均 {todayStats.avgPerHour}{" "}
              次/小时
            </Text>
          </View>

          {/* 健康提示 */}
          <View className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl p-4 border border-sky-100">
            <View className="flex items-center">
              <Text className="text-lg mr-2">💡</Text>
              <View>
                <Text className="text-sm font-medium text-sky-700">
                  健康提示
                </Text>
                <Text className="text-sm text-sky-600">
                  正常范围：＞3次/小时
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
