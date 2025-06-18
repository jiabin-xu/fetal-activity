import { useState, useEffect, useRef } from "react";
import { View, Text } from "@tarojs/components";
import { Button } from "@nutui/nutui-react-taro";
import Taro from "@tarojs/taro";

interface CountRecord {
  id: string;
  startTime: number;
  endTime: number;
  validCount: number;
  totalClicks: number;
  date: string;
}

const STORAGE_KEY = "fetal_count_records";

export default function FetalCount() {
  const [isActive, setIsActive] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(3600); // 倒计时（秒）
  const [totalClicks, setTotalClicks] = useState(0); // 实际点击次数
  const [records, setRecords] = useState<CountRecord[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [lastRecordTime, setLastRecordTime] = useState(0); // 上次记录胎动的时间
  const timerRef = useRef<NodeJS.Timeout>();

  // 从localStorage加载数据
  const loadRecordsFromStorage = () => {
    try {
      const storedData = Taro.getStorageSync(STORAGE_KEY);
      if (storedData) {
        setRecords(JSON.parse(storedData));
      } else {
        // 如果没有缓存数据，创建一些假数据用于预览效果
        const mockData = createMockData();
        setRecords(mockData);
        saveRecordsToStorage(mockData);
      }
    } catch (error) {
      console.error("加载数据失败:", error);
    }
  };

  // 保存数据到localStorage
  const saveRecordsToStorage = (newRecords: CountRecord[]) => {
    try {
      Taro.setStorageSync(STORAGE_KEY, JSON.stringify(newRecords));
    } catch (error) {
      console.error("保存数据失败:", error);
    }
  };

  // 创建假数据
  const createMockData = (): CountRecord[] => {
    const today = new Date();
    const todayStr = today.toDateString();

    return [
      {
        id: "mock_1",
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          8,
          30
        ).getTime(),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          9,
          30
        ).getTime(),
        validCount: 5,
        totalClicks: 8,
        date: todayStr,
      },
      {
        id: "mock_2",
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          12,
          15
        ).getTime(),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          13,
          15
        ).getTime(),
        validCount: 4,
        totalClicks: 6,
        date: todayStr,
      },
      {
        id: "mock_3",
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          15,
          45
        ).getTime(),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          16,
          45
        ).getTime(),
        validCount: 6,
        totalClicks: 9,
        date: todayStr,
      },
      {
        id: "mock_4",
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          19,
          20
        ).getTime(),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          20,
          20
        ).getTime(),
        validCount: 3,
        totalClicks: 5,
        date: todayStr,
      },
      {
        id: "mock_5",
        startTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          21,
          10
        ).getTime(),
        endTime: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          22,
          10
        ).getTime(),
        validCount: 7,
        totalClicks: 12,
        date: todayStr,
      },
    ];
  };

  // 计算今日统计
  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayRecords = records.filter((r) => r.date === today);

    const totalSessions = todayRecords.length;
    const totalCounts = todayRecords.reduce(
      (sum, record) => sum + record.validCount,
      0
    );
    const avgPerHour =
      totalSessions > 0 ? (totalCounts / totalSessions).toFixed(1) : "0";

    return { totalSessions, totalCounts, avgPerHour, todayRecords };
  };

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 格式化开始时间
  const formatStartTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
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
            // 倒计时结束，自动保存记录
            const endTime = Date.now();
            const newRecord: CountRecord = {
              id: `${sessionStartTime}_${endTime}`,
              startTime: sessionStartTime,
              endTime: endTime,
              validCount: currentCount,
              totalClicks: totalClicks,
              date: new Date(sessionStartTime).toDateString(),
            };

            const updatedRecords = [...records, newRecord];
            setRecords(updatedRecords);
            saveRecordsToStorage(updatedRecords);

            // 重置状态
            setIsActive(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }

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
      } else {
        // 超过5分钟或首次点击，算作有效胎动
        setCurrentCount((prev) => prev + 1);
        setLastRecordTime(now);

        // 震动反馈
        Taro.vibrateShort();
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
    // 组件加载时读取缓存数据
    loadRecordsFromStorage();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <View className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <View className="px-6 py-2">
        {/* 温馨提示 */}
        <View className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-6 border border-amber-200/60 ">
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

        {/* 主计数区域 */}
        <View className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 mb-6 shadow-xl shadow-pink-200/40 border border-pink-100/50">
          {/* 倒计时显示 */}
          <View className="text-center mb-8">
            <View className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4 border border-blue-100">
              <Text className="text-5xl font-mono font-bold text-pink-600 mb-2">
                {formatTime(remainingTime)}
              </Text>
              <Text className="text-sm text-gray-800 font-medium">
                {isActive ? "记录中..." : "准备开始"}
              </Text>
            </View>

            {/* 实时统计 */}
            {isActive && (
              <View className="flex justify-center space-x-4">
                <View className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 min-w-18 border border-gray-200">
                  <Text className="text-xl font-bold text-pink-600">
                    {totalClicks}
                  </Text>
                  <Text className="text-xs text-gray-800 font-medium">
                    总点击
                  </Text>
                </View>
                <View className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 min-w-18 border border-pink-200">
                  <Text className="text-xl font-bold text-pink-600">
                    {currentCount}
                  </Text>
                  <Text className="text-xs text-gray-800 font-medium">
                    有效次数
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* 主按钮 */}
          <View className="flex justify-center">
            <Button
              className={`w-44 h-44 rounded-full text-lg font-semibold transition-all duration-300 flex flex-col items-center justify-center shadow-2xl border-4 ${
                !isActive
                  ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-blue-200 border-blue-300"
                  : "bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-pink-200 border-pink-300"
              }`}
              onClick={handleMainButton}
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
        </View>

        {/* 今日记录 */}
        {todayStats.todayRecords.length > 0 && (
          <View className="bg-white/95 backdrop-blur-sm rounded-3xl p-5 mb-8 shadow-lg shadow-pink-200/30 border border-pink-100/50">
            <View className="flex items-center justify-between mb-4">
              <View className="flex items-center">
                <Text className="text-base font-semibold text-gray-800 mr-2">
                  今日记录
                </Text>
                <Text className="text-lg">📋</Text>
              </View>
              <View
                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full"
                onClick={viewHistory}
              >
                <Text className="text-xs text-blue-600 font-semibold">
                  查看历史
                </Text>
              </View>
            </View>

            {/* 记录列表 */}
            <View className="mb-4">
              {/* 表头 */}
              <View className="flex bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl p-3 mb-3 border border-gray-200">
                <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
                  开始时间
                </Text>
                <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
                  实际点击
                </Text>
                <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
                  有效胎动
                </Text>
              </View>

              {/* 表格数据 */}
              <View className="space-y-2">
                {todayStats.todayRecords
                  .slice(-5)
                  .reverse()
                  .map((record, index) => (
                    <View
                      key={record.id}
                      className="flex py-3 px-3 bg-white/80 rounded-xl border border-gray-200/60"
                    >
                      <Text className="flex-1 text-center text-sm font-semibold text-pink-600">
                        {formatStartTime(record.startTime)}
                      </Text>
                      <Text className="flex-1 text-center text-sm font-bold text-pink-600">
                        {record.totalClicks}
                      </Text>
                      <Text className="flex-1 text-center text-sm font-bold text-pink-600">
                        {record.validCount}
                      </Text>
                    </View>
                  ))}
              </View>

              {todayStats.todayRecords.length > 5 && (
                <Text className="text-xs text-gray-500 text-center mt-2">
                  仅显示最近5条记录
                </Text>
              )}
            </View>

            {/* 12小时胎动数 */}
            <View className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200">
              <Text className="text-sm font-medium text-gray-800 text-center">
                预估12小时胎动数：
                <Text className="text-pink-600 font-bold text-lg">
                  {todayStats.totalSessions > 0
                    ? Math.round(
                        (todayStats.totalCounts / todayStats.totalSessions) * 12
                      )
                    : 0}
                </Text>{" "}
                次
              </Text>
              <Text className="text-xs text-gray-600 text-center mt-1">
                基于今日 {todayStats.totalSessions} 次记录，平均每次{" "}
                {todayStats.totalSessions > 0
                  ? (todayStats.totalCounts / todayStats.totalSessions).toFixed(
                      1
                    )
                  : 0}{" "}
                次胎动
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
