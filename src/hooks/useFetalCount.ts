import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';

interface CountRecord {
  id: string;
  startTime: number;
  endTime: number;
  validCount: number;
  totalClicks: number;
  date: string;
}

const STORAGE_KEY = 'fetal_count_records';
const VALID_INTERVAL = 5 * 60 * 1000; // 5分钟间隔

export const useFetalCount = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(3600);
  const [totalClicks, setTotalClicks] = useState(0);
  const [records, setRecords] = useState<CountRecord[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [lastRecordTime, setLastRecordTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const loadRecordsFromStorage = () => {
    try {
      const storedData = Taro.getStorageSync(STORAGE_KEY);
      if (storedData) {
        setRecords(JSON.parse(storedData));
      } else {
        const mockData = createMockData();
        setRecords(mockData);
        saveRecordsToStorage(mockData);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const saveRecordsToStorage = (newRecords: CountRecord[]) => {
    try {
      Taro.setStorageSync(STORAGE_KEY, JSON.stringify(newRecords));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  };

  const createMockData = (): CountRecord[] => {
    const today = new Date();
    const todayStr = today.toDateString();

    return [
      {
        id: 'mock_1',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30).getTime(),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30).getTime(),
        validCount: 5,
        totalClicks: 8,
        date: todayStr,
      },
      // ... 其他模拟数据
    ];
  };

  const startSession = () => {
    setIsActive(true);
    setCurrentCount(0);
    setTotalClicks(0);
    setRemainingTime(3600);
    setLastRecordTime(0);
    setSessionStartTime(Date.now());

    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endSession = () => {
    const endTime = Date.now();
    const newRecord: CountRecord = {
      id: `${sessionStartTime}_${endTime}`,
      startTime: sessionStartTime,
      endTime,
      validCount: currentCount,
      totalClicks,
      date: new Date(sessionStartTime).toDateString(),
    };

    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);

    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const recordMovement = () => {
    const now = Date.now();
    setTotalClicks((prev) => prev + 1);

    if (!lastRecordTime || now - lastRecordTime >= VALID_INTERVAL) {
      setCurrentCount((prev) => prev + 1);
      setLastRecordTime(now);
      Taro.vibrateShort();
    }
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayRecords = records.filter((r) => r.date === today);

    const totalSessions = todayRecords.length;
    const totalCounts = todayRecords.reduce((sum, record) => sum + record.validCount, 0);
    const avgPerHour = totalSessions > 0 ? (totalCounts / totalSessions).toFixed(1) : '0';

    return { totalSessions, totalCounts, avgPerHour, todayRecords };
  };

  useEffect(() => {
    loadRecordsFromStorage();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    isActive,
    currentCount,
    remainingTime,
    totalClicks,
    records,
    startSession,
    recordMovement,
    getTodayStats,
  };
};
