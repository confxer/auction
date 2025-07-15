import React, { useState, useEffect } from 'react';
import './AuctionTimer.css';

const AuctionTimer = ({ endTime, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsEnded(true);
        if (onTimeUp) onTimeUp();
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    // 초기 계산
    setTimeLeft(calculateTimeLeft());

    // 1초마다 업데이트
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onTimeUp]);

  const getTimeStatus = () => {
    const totalSeconds = timeLeft.days * 86400 + timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
    
    if (isEnded) return 'ended';
    if (totalSeconds <= 3600) return 'urgent'; // 1시간 이내
    if (totalSeconds <= 86400) return 'warning'; // 24시간 이내
    return 'normal';
  };

  const status = getTimeStatus();

  if (isEnded) {
    return (
      <div className={`auction-timer ended`}>
        <div className="timer-label">경매 종료</div>
        <div className="timer-value">마감됨</div>
      </div>
    );
  }

  return (
    <div className={`auction-timer ${status}`}>
      <div className="timer-label">
        {status === 'urgent' ? '🔥 긴급!' : '⏰ 남은 시간'}
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
};

export default AuctionTimer; 