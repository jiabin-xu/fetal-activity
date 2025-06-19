import { useState, useEffect, useRef } from "react";
import Taro from "@tarojs/taro";
import dayjs from "dayjs";

export interface ContractionRecord {
  id: string; // 使用startTime作为id
  duration: number; // 持续时间（秒）
}

export interface ProcessedContractionRecord extends ContractionRecord {
  intervalSeconds: number; // 间隔时间（秒）
  showDash: boolean; // 是否显示 "--:--"
  isLabor: boolean; // 是否显示临产标签
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

  // 计算间隔时间
  const calculateInterval = (currentRecord: ContractionRecord, previousRecord: ContractionRecord) => {
    return dayjs(currentRecord.id).diff(dayjs(previousRecord.id), 'seconds');
  };

  // 获取今日统计数据
  const getTodayStats = () => {
    const today = dayjs().format('YYYY-MM-DD');
    const todayRecords = records.filter((r) => r.id.includes(today));

    // 处理每条记录的展示数据
    const processedRecords: ProcessedContractionRecord[] = todayRecords.map((record, index) => {
      let intervalSeconds = 0;
      let showDash = true;
      let isLabor = false;

      // 不是第一条记录时计算间隔
      if (index > 0) {
        const previousRecord = todayRecords[index - 1];
        intervalSeconds = calculateInterval(record, previousRecord);

        // 间隔时间 > 60分钟显示 "--:--"
        showDash = intervalSeconds > 3600;
        // 间隔时间 < 5分钟显示临产标签
        isLabor = intervalSeconds > 0 && intervalSeconds < 300;
      }

      return {
        ...record,
        intervalSeconds,
        showDash,
        isLabor
      };
    });

    return {
      todayRecords: processedRecords
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
      id: dayjs(currentStartTime).format('YYYY-MM-DD HH:mm:ss'),
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
