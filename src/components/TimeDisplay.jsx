import React, { useState, useEffect, useCallback, memo } from 'react';
import './TimeDisplay.css';

const TimeDisplay = memo(({ 
  startTime, 
  endTime, 
  onTimeUp, 
  onStatusChange,
  mode = 'text', // 'text', 'timer', 'compact'
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [status, setStatus] = useState('진행중');

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    
    // 상태 결정
    if (now < start) {
      const newStatus = '예정';
      if (status !== newStatus) {
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);
      }
      const difference = start - now;
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    } else if (now >= start && now < end) {
      const newStatus = '진행중';
      if (status !== newStatus) {
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);
      }
      const difference = end - now;
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    } else {
      const newStatus = '마감';
      if (status !== newStatus) {
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);
        if (onTimeUp) onTimeUp();
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  }, [startTime, endTime, status, onTimeUp, onStatusChange]);

  useEffect(() => {
    // 초기 계산
    setTimeLeft(calculateTimeLeft());

    // 1초마다 업데이트
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const getTimeStatus = () => {
    const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
    
    if (status === '마감') return 'ended';
    if (status === '예정') return 'scheduled';
    if (totalSeconds <= 3600) return 'urgent'; // 1시간 이내
    if (totalSeconds <= 86400) return 'warning'; // 24시간 이내
    return 'normal';
  };

  const formatTimeText = () => {
    if (status === '예정') return '예정';
    if (status === '마감') return '마감';
    
    let result = '';
    if (timeLeft.days > 0) result += `${timeLeft.days}일 `;
    if (timeLeft.days > 0 || timeLeft.hours > 0) result += `${timeLeft.hours}시간 `;
    if (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0) result += `${timeLeft.minutes}분 `;
    result += `${timeLeft.seconds}초`;
    return result.trim();
  };

  const statusClass = getTimeStatus();

  // 컴팩트 모드
  if (mode === 'compact') {
    return (
      <span className={`time-display-compact time-status-${statusClass} ${className}`}>
        {formatTimeText()}
      </span>
    );
  }

  // 텍스트 모드
  if (mode === 'text') {
    return (
      <span className={`time-display-text time-status-${statusClass} ${className}`}>
        {formatTimeText()}
      </span>
    );
  }

  // 타이머 모드
  if (mode === 'timer') {
    if (status === '마감') {
      return (
        <div className={`time-display-timer ended ${className}`}>
          <div className="timer-label">경매 종료</div>
          <div className="timer-value">마감됨</div>
        </div>
      );
    }

    return (
      <div className={`time-display-timer ${statusClass} ${className}`}>
        <div className="timer-label">
          {status === '예정' ? '📅 시작 예정' : 
           statusClass === 'urgent' ? '🔥 긴급!' : '⏰ 남은 시간'}
        </div>
        <div className="timer-display">
          {timeLeft.days > 0 && (
            <div className="time-unit">
              <span className="time-value">{timeLeft.days}</span>
              <span className="time-label">일</span>
            </div>
          )}
          <div className="time-unit">
            <span className="time-value">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="time-label">시</span>
          </div>
          <div className="time-unit">
            <span className="time-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="time-label">분</span>
          </div>
          <div className="time-unit">
            <span className="time-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="time-label">초</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
});

TimeDisplay.displayName = 'TimeDisplay';

export default TimeDisplay; 