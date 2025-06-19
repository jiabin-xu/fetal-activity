import { useState, useEffect, useRef } from 'react';
import Taro from '@tarojs/taro';
import dayjs from 'dayjs';

interface CountRecord {
  id: string;
  validCount: number;
  totalClicks: number;

}

const STORAGE_KEY = 'fetal_count_records';
const UNIT = 1
const VALID_INTERVAL = 5 * UNIT * 1000; // 5分钟间隔
const SESSION_DURATION = 60 * UNIT; // 1小时

export const useFetalCount = () => {
  const [isActive, setIsActive] = useState(false);
  const [validCount, setValidCount] = useState(0);
  const [remainingTime, setRemainingTime] = useState(SESSION_DURATION);
  const [totalClicks, setTotalClicks] = useState(0);
  const [records, setRecords] = useState<CountRecord[]>([]);
  const [lastRecordTime, setLastRecordTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  // 使用 ref 保存最新的状态值
  const validCountRef = useRef(0);
  const totalClicksRef = useRef(0);

  // 同步状态到 ref
  useEffect(() => {
    validCountRef.current = validCount;
  }, [validCount]);

  useEffect(() => {
    totalClicksRef.current = totalClicks;
  }, [totalClicks]);

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
    // 使用 ref 获取最新的状态值
    const newRecord: CountRecord = {
      id: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm'),
      validCount: validCountRef.current,
      totalClicks: totalClicksRef.current,
    };
    console.log('newRecord', validCountRef.current);

    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);

    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  console.log('validCount', validCount);

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
