import { useState, useEffect, useRef } from "react";
import Taro from "@tarojs/taro";

export interface ContractionRecord {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // 持续时间（秒）
  interval: number; // 间隔时间（秒）
  date: string;
}

const STORAGE_KEY = 'contraction_records';

export const useContractionRecords = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentStartTime, setCurrentStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [records, setRecords] = useState<ContractionRecord[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  // 创建假数据
  const createMockData = (): ContractionRecord[] => {
    const today = new Date();
    const todayStr = today.toDateString();
    const baseTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0).getTime();

    return [
      {
        id: 'mock_1',
        startTime: baseTime,
        endTime: baseTime + 45000,
        duration: 45,
        interval: 0,
        date: todayStr,
      },
      {
        id: 'mock_2',
        startTime: baseTime + 300000,
        endTime: baseTime + 300000 + 50000,
        duration: 50,
        interval: 255,
        date: todayStr,
      },
      {
        id: 'mock_3',
        startTime: baseTime + 540000,
        endTime: baseTime + 540000 + 60000,
        duration: 60,
        interval: 190,
        date: todayStr,
      },
    ];
  };

  // 从localStorage加载数据
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

  // 保存数据到localStorage
  const saveRecordsToStorage = (newRecords: ContractionRecord[]) => {
    try {
      Taro.setStorageSync(STORAGE_KEY, JSON.stringify(newRecords));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  };

  // 获取今日统计数据
  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayRecords = records.filter(r => r.date === today);

    return {
      totalCount: todayRecords.length,
      avgDuration: todayRecords.length > 0 ?
        Math.round(todayRecords.reduce((sum, r) => sum + r.duration, 0) / todayRecords.length) : 0,
      avgInterval: todayRecords.length > 1 ?
        Math.round(todayRecords.slice(1).reduce((sum, r) => sum + r.interval, 0) / (todayRecords.length - 1)) : 0,
      todayRecords
    };
  };

  // 开始记录宫缩
  const startRecording = () => {
    const now = Date.now();
    setIsRecording(true);
    setCurrentStartTime(now);
    setElapsedTime(0);

    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    Taro.vibrateShort();
  };

  // 结束记录宫缩
  const stopRecording = () => {
    if (!isRecording) return;

    const now = Date.now();
    const duration = Math.round((now - currentStartTime) / 1000);

    // 计算与上一次宫缩的间隔
    const todayRecords = getTodayStats().todayRecords;
    let interval = 0;
    if (todayRecords.length > 0) {
      const lastRecord = todayRecords[todayRecords.length - 1];
      interval = Math.round((currentStartTime - lastRecord.endTime) / 1000);
    }

    const newRecord: ContractionRecord = {
      id: `${currentStartTime}_${now}`,
      startTime: currentStartTime,
      endTime: now,
      duration: duration,
      interval: interval,
      date: new Date().toDateString(),
    };

    const updatedRecords = [...records, newRecord];
    setRecords(updatedRecords);
    saveRecordsToStorage(updatedRecords);

    setIsRecording(false);
    setElapsedTime(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    Taro.vibrateShort();
  };

  // 清理定时器
  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    loadRecordsFromStorage();
    return cleanup;
  }, []);

  return {
    // 状态
    isRecording,
    elapsedTime,
    records,

    // 计算属性
    todayStats: getTodayStats(),

    // 方法
    startRecording,
    stopRecording,
    cleanup,
  };
};
