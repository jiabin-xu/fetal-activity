import { useState, useEffect, useRef } from "react";
import Taro from "@tarojs/taro";
import dayjs from "dayjs";

export interface ContractionRecord {
  id: string; // 使用startTime作为id
  duration: number; // 持续时间（秒）
}

const STORAGE_KEY = 'contraction_records';

export const useContractionRecords = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentStartTime, setCurrentStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [records, setRecords] = useState<ContractionRecord[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  // 从localStorage加载数据
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

  // 保存数据到localStorage
  const saveRecordsToStorage = (newRecords: ContractionRecord[]) => {
    try {
      Taro.setStorageSync(STORAGE_KEY, JSON.stringify(newRecords));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  };

  // 获取今日记录
  const getTodayRecords = () => {
    const today = new Date().toDateString();
    return records.filter(r => new Date(r.id).toDateString() === today);
  };

  // 计算间隔时间
  const calculateInterval = (currentRecord: ContractionRecord, previousRecord: ContractionRecord) => {
    return dayjs(currentRecord.id).diff(dayjs(previousRecord.id), 'seconds');
  };

  // 获取今日统计数据
  const getTodayStats = () => {
    const todayRecords = getTodayRecords().sort((a, b) => parseInt(a.id) - parseInt(b.id));

    const totalCount = todayRecords.length;
    const avgDuration = totalCount > 0 ?
      Math.round(todayRecords.reduce((sum, r) => sum + r.duration, 0) / totalCount) : 0;

    let avgInterval = 0;
    if (totalCount > 1) {
      const intervals = todayRecords.slice(1).map((record, index) =>
        calculateInterval(record, todayRecords[index])
      );
      avgInterval = Math.round(intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length);
    }

    return {
      totalCount,
      avgDuration,
      avgInterval,
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

    const newRecord: ContractionRecord = {
      id: currentStartTime.toString(),
      duration: duration,
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
    calculateInterval,
  };
};
