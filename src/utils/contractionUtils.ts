/**
 * 格式化时间显示 (mm:ss)
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 格式化间隔时间显示
 */
export const formatInterval = (seconds: number): string => {
  if (seconds === 0) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}秒`;
  return `${mins}分${secs > 0 ? secs + '秒' : ''}`;
};

/**
 * 格式化开始时间 (HH:mm)
 */
export const formatStartTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};
