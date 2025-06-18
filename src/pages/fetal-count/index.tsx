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
    <View className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-50 relative overflow-hidden">
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
          {/* 今日记录表格 */}
          {todayStats.todayRecords.length > 0 && (
            <View className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-md shadow-sky-100/30">
              <View className="text-sm font-medium text-gray-700 mb-3">
                今日胎动情况
              </View>

              {/* 表头 */}
              <View className="flex bg-sky-50 rounded-lg p-2 mb-2">
                <Text className="flex-1 text-center text-xs font-medium text-sky-700">
                  开始时间
                </Text>
                <Text className="flex-1 text-center text-xs font-medium text-sky-700">
                  实际点击
                </Text>
                <Text className="flex-1 text-center text-xs font-medium text-sky-700">
                  有效次数
                </Text>
              </View>

              {/* 表格数据 */}
              <View className="space-y-1">
                {todayStats.todayRecords
                  .slice(-5)
                  .reverse()
                  .map((record) => (
                    <View
                      key={record.id}
                      className="flex py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <Text className="flex-1 text-center text-sm text-gray-800">
                        {formatStartTime(record.startTime)}
                      </Text>
                      <Text className="flex-1 text-center text-sm text-gray-600">
                        {record.totalClicks}
                      </Text>
                      <Text className="flex-1 text-center text-sm text-sky-600 font-medium">
                        {record.validCount}
                      </Text>
                    </View>
                  ))}
              </View>

              {todayStats.todayRecords.length > 5 && (
                <Text className="text-xs text-gray-400 text-center mt-2">
                  仅显示最近5条记录
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
