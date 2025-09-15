/**
 * Date and Time Utility Functions
 */

/**
 * Format date to various formats
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  const dayNames = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
  const monthNames = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const formatMap = {
    'YYYY-MM-DD': `${year}-${month}-${day}`,
    'DD/MM/YYYY': `${day}/${month}/${year}`,
    'DD-MM-YYYY': `${day}-${month}-${year}`,
    'MM/DD/YYYY': `${month}/${day}/${year}`,
    'YYYY/MM/DD': `${year}/${month}/${day}`,
    'DD MMM YYYY': `${day} ${monthNames[d.getMonth()].slice(0, 3)} ${year}`,
    'DD MMMM YYYY': `${day} ${monthNames[d.getMonth()]} ${year}`,
    'dddd, DD MMMM YYYY': `${dayNames[d.getDay()]}, ${day} ${monthNames[d.getMonth()]} ${year}`,
    'HH:mm': `${hours}:${minutes}`,
    'HH:mm:ss': `${hours}:${minutes}:${seconds}`,
    'DD/MM/YYYY HH:mm': `${day}/${month}/${year} ${hours}:${minutes}`,
    'relative': getRelativeTime(d)
  };

  return formatMap[format] || formatMap['YYYY-MM-DD'];
};

/**
 * Get relative time (e.g., "2 days ago", "in 3 hours")
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;
  const absDiffMs = Math.abs(diffMs);

  const minute = 1000 * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;

  const rtf = new Intl.RelativeTimeFormat('it', { numeric: 'auto' });

  if (absDiffMs < minute) {
    return 'ora';
  } else if (absDiffMs < hour) {
    const minutes = Math.floor(absDiffMs / minute);
    return rtf.format(diffMs > 0 ? minutes : -minutes, 'minute');
  } else if (absDiffMs < day) {
    const hours = Math.floor(absDiffMs / hour);
    return rtf.format(diffMs > 0 ? hours : -hours, 'hour');
  } else if (absDiffMs < week) {
    const days = Math.floor(absDiffMs / day);
    return rtf.format(diffMs > 0 ? days : -days, 'day');
  } else if (absDiffMs < month) {
    const weeks = Math.floor(absDiffMs / week);
    return rtf.format(diffMs > 0 ? weeks : -weeks, 'week');
  } else if (absDiffMs < year) {
    const months = Math.floor(absDiffMs / month);
    return rtf.format(diffMs > 0 ? months : -months, 'month');
  } else {
    const years = Math.floor(absDiffMs / year);
    return rtf.format(diffMs > 0 ? years : -years, 'year');
  }
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const target = new Date(date);
  return (
    target.getDate() === today.getDate() &&
    target.getMonth() === today.getMonth() &&
    target.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if date is this week
 */
export const isThisWeek = (date) => {
  const today = new Date();
  const target = new Date(date);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  return target >= startOfWeek && target <= endOfWeek;
};

/**
 * Get start and end of week
 */
export const getWeekBounds = (date = new Date()) => {
  const d = new Date(date);
  const startOfWeek = new Date(d);
  startOfWeek.setDate(d.getDate() - d.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  return { start: startOfWeek, end: endOfWeek };
};

/**
 * Add days to date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add weeks to date
 */
export const addWeeks = (date, weeks) => {
  return addDays(date, weeks * 7);
};

/**
 * Get days between dates
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get weeks between dates
 */
export const getWeeksBetween = (startDate, endDate) => {
  return Math.floor(getDaysBetween(startDate, endDate) / 7);
};

/**
 * Format time duration (e.g., seconds to mm:ss)
 */
export const formatDuration = (seconds, format = 'mm:ss') => {
  if (!seconds || seconds < 0) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const formatMap = {
    'mm:ss': `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
    'h:mm:ss': `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
    'hh:mm:ss': `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
    'human': hours > 0 ? `${hours}h ${minutes}m` : minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`
  };

  return formatMap[format] || formatMap['mm:ss'];
};

/**
 * Parse time string to seconds
 */
export const parseTimeToSeconds = (timeString) => {
  if (!timeString) return 0;

  const parts = timeString.split(':');
  if (parts.length === 2) {
    // mm:ss format
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  } else if (parts.length === 3) {
    // hh:mm:ss format
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  }

  return 0;
};

/**
 * Get time of day greeting
 */
export const getTimeGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Buongiorno';
  } else if (hour < 18) {
    return 'Buon pomeriggio';
  } else {
    return 'Buonasera';
  }
};

/**
 * Check if time is within range
 */
export const isTimeInRange = (time, startTime, endTime) => {
  const current = new Date(`1970-01-01 ${time}`);
  const start = new Date(`1970-01-01 ${startTime}`);
  const end = new Date(`1970-01-01 ${endTime}`);

  if (start <= end) {
    return current >= start && current <= end;
  } else {
    // Handle overnight range (e.g., 22:00 - 06:00)
    return current >= start || current <= end;
  }
};

/**
 * Get next occurrence of a specific day
 */
export const getNextOccurrence = (dayOfWeek, fromDate = new Date()) => {
  const date = new Date(fromDate);
  const day = date.getDay();
  const targetDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday from 0 to 7
  const currentDay = day === 0 ? 7 : day;

  const daysUntilTarget = targetDay >= currentDay
    ? targetDay - currentDay
    : 7 - currentDay + targetDay;

  return addDays(date, daysUntilTarget);
};

export default {
  formatDate,
  getRelativeTime,
  isToday,
  isThisWeek,
  getWeekBounds,
  addDays,
  addWeeks,
  getDaysBetween,
  getWeeksBetween,
  formatDuration,
  parseTimeToSeconds,
  getTimeGreeting,
  isTimeInRange,
  getNextOccurrence
};