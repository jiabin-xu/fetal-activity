import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';

interface CountRecord {
  id: string;
  validCount: number;
  totalClicks: number;

}

const STORAGE_KEY = 'fetal_count_records';
const VALID_INTERVAL = 5 * 60 * 1000; // 5分钟间隔
const SESSION_DURATION = 60; // 1小时

export const useFetalCount = () => {
  const [isActive, setIsActive] = useState(false);
  const [validCount, setValidCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(SESSION_DURATION);
  const [totalClicks, setTotalClicks] = useState(0);
  const [records, setRecords] = useState<CountRecord[]>([]);
  const [lastRecordTime, setLastRecordTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const loadRecordsFromStorage = () => {
    try {
      const storedData = Taro.getStorageSync(STORAGE_KEY);
      if (storedData) {
        setRecords(JSON.parse(storedData));
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



  const startSession = () => {
    setIsActive(true);
    setValidCount(0);
    setTotalClicks(0);
    setRemainingTime(SESSION_DURATION);
    setLastRecordTime(0);

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
    const newRecord: CountRecord = {
      id: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm'),
      validCount,
      totalClicks,
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
      setValidCount((prev) => prev + 1);
      setLastRecordTime(now);

    }
    Taro.vibrateShort();
  };

  const getTodayStats = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const todayRecords = records.filter((r) => r.id.includes(today));

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
    validCount,
    remainingTime,
    totalClicks,
    records,
    startSession,
    recordMovement,
    getTodayStats,
  };
};
