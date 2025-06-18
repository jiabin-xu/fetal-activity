import { useState, useEffect, useRef } from "react";
import { View, Text } from "@tarojs/components";
import {
  Button,
  Progress,
  Card,
  Badge,
  NoticeBar,
} from "@nutui/nutui-react-taro";
import Taro from "@tarojs/taro";
import "./index.scss";

interface CountRecord {
  timestamp: number;
  period: "morning" | "noon" | "evening";
}

interface DayRecord {
  date: string;
  morning: number;
  noon: number;
  evening: number;
  total: number;
}

export default function FetalCount() {
  const [currentPeriod, setCurrentPeriod] = useState<
    "morning" | "noon" | "evening"
  >("morning");
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(3600); // 1小时 = 3600秒
  const [records, setRecords] = useState<CountRecord[]>([]);
  const [lastClickTime, setLastClickTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const periods = {
    morning: { label: "早上", time: "8:00-9:00", color: "#87CEEB" },
    noon: { label: "中午", time: "12:00-13:00", color: "#87CEEB" },
    evening: { label: "晚上", time: "18:00-19:00", color: "#87CEEB" },
  };

  // 获取今日数据
  const getTodayData = (): DayRecord => {
    const today = new Date().toDateString();
    const todayRecords = records.filter(
      (r) => new Date(r.timestamp).toDateString() === today
    );

    return {
      date: today,
      morning: todayRecords.filter((r) => r.period === "morning").length,
      noon: todayRecords.filter((r) => r.period === "noon").length,
      evening: todayRecords.filter((r) => r.period === "evening").length,
      total: todayRecords.length,
    };
  };

  // 计算12小时胎动总数
  const calculate12HourTotal = () => {
    const todayData = getTodayData();
    return (todayData.morning + todayData.noon + todayData.evening) * 4;
  };

  // 健康状态评估
  const getHealthStatus = () => {
    const todayData = getTodayData();
    const total12Hour = calculate12HourTotal();

    if (total12Hour >= 30) {
      return { status: "good", text: "胎动正常", color: "#52c41a" };
    } else if (total12Hour >= 20) {
      return { status: "warning", text: "需要继续观察", color: "#faad14" };
    } else {
      return { status: "danger", text: "建议就医咨询", color: "#ff4d4f" };
    }
  };

  // 开始计数
  const startCounting = () => {
    setIsActive(true);
    setCount(0);
    setRemainingTime(3600);

    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          stopCounting();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 停止计数
  const stopCounting = () => {
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // 保存当前时段的数据
    if (count > 0) {
      Taro.showToast({
        title: `${periods[currentPeriod].label}计数完成: ${count}次`,
        icon: "success",
      });
    }
  };

  // 胎动计数
  const handleFetalMovement = () => {
    if (!isActive) return;

    const now = Date.now();

    // 检查是否在5分钟内（连续胎动只算1次）
    if (lastClickTime && now - lastClickTime < 5 * 60 * 1000) {
      Taro.showToast({
        title: "连续胎动只计算1次",
        icon: "none",
        duration: 1000,
      });
      return;
    }

    setCount((prev) => prev + 1);
    setLastClickTime(now);

    // 记录这次胎动
    const newRecord: CountRecord = {
      timestamp: now,
      period: currentPeriod,
    };
    setRecords((prev) => [...prev, newRecord]);

    // 震动反馈
    Taro.vibrateShort();
  };

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // 切换时段
  const switchPeriod = (period: "morning" | "noon" | "evening") => {
    if (isActive) {
      Taro.showModal({
        title: "提示",
        content: "当前正在计数中，是否要切换时段？",
        success: (res) => {
          if (res.confirm) {
            stopCounting();
            setCurrentPeriod(period);
          }
        },
      });
    } else {
      setCurrentPeriod(period);
    }
  };

  const todayData = getTodayData();
  const healthStatus = getHealthStatus();
  const progress = Math.min(((3600 - remainingTime) / 3600) * 100, 100);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <View className="fetal-count-page">
      {/* 顶部状态栏 */}
      <View className="status-bar">
        <NoticeBar
          content="每小时胎动≥3次，12小时胎动≥30次为正常"
          style={{
            backgroundColor: "#E6F7FF",
            color: "#1890ff",
          }}
        />
      </View>

      {/* 今日统计卡片 */}
      <Card className="today-summary">
        <View className="summary-header">
          <Text className="summary-title">今日胎动统计</Text>
          <Badge
            value={healthStatus.text}
            style={{ backgroundColor: healthStatus.color }}
          />
        </View>
        <View className="summary-content">
          <View className="period-stats">
            <View className="stat-item">
              <Text className="stat-label">早上</Text>
              <Text className="stat-value">{todayData.morning}次</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-label">中午</Text>
              <Text className="stat-value">{todayData.noon}次</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-label">晚上</Text>
              <Text className="stat-value">{todayData.evening}次</Text>
            </View>
          </View>
          <View className="total-12hour">
            <Text className="total-label">预估12小时总数</Text>
            <Text className="total-value">{calculate12HourTotal()}次</Text>
          </View>
        </View>
      </Card>

      {/* 时段选择 */}
      <View className="period-selector">
        {Object.entries(periods).map(([key, period]) => (
          <View
            key={key}
            className={`period-item ${currentPeriod === key ? "active" : ""}`}
            onClick={() => switchPeriod(key as any)}
          >
            <Text className="period-label">{period.label}</Text>
            <Text className="period-time">{period.time}</Text>
          </View>
        ))}
      </View>

      {/* 计数器主界面 */}
      <View className="counter-section">
        <View className="timer-display">
          <Text className="timer-text">{formatTime(remainingTime)}</Text>
          <Progress
            percent={progress}
            color="#87CEEB"
            style={{ marginTop: "20px" }}
          />
        </View>

        <View className="count-display">
          <Text className="count-number">{count}</Text>
          <Text className="count-label">次胎动</Text>
        </View>

        <View className="count-button-wrapper">
          {!isActive ? (
            <Button
              className="start-button"
              size="large"
              onClick={startCounting}
            >
              开始计数 - {periods[currentPeriod].label}
            </Button>
          ) : (
            <>
              <Button
                className="count-button"
                size="large"
                onClick={handleFetalMovement}
              >
                感受到胎动
              </Button>
              <Button
                className="stop-button"
                size="large"
                fill="outline"
                onClick={stopCounting}
              >
                结束计数
              </Button>
            </>
          )}
        </View>
      </View>

      {/* 提示信息 */}
      <View className="tips-section">
        <Text className="tips-title">计数说明：</Text>
        <Text className="tips-item">• 连续的胎动只算1次</Text>
        <Text className="tips-item">• 间隔5分钟以上才计为新的胎动</Text>
        <Text className="tips-item">• 每天早中晚各计数1小时</Text>
        <Text className="tips-item">• 如持续低于正常值请及时就医</Text>
      </View>
    </View>
  );
}
