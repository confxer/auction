import React, { useEffect, useState } from "react";

// 상태 및 종료 시각 판단 함수
const getStatusAndTime = (startTime, endTime, isClosed) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isClosed || now >= end) return { status: "마감", time: end };
  if (now < start) return { status: "예정", time: start };
  return { status: "진행중", time: end };
};

// 남은 시간 포맷 함수
const formatTimeLeft = (targetTime) => {
  const now = new Date();
  const diff = targetTime - now;
  if (diff <= 0) return "마감";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
};

const AuctionTimeLeft = ({ startTime, endTime, isClosed, onStatusChange, fnc, id }) => {
  const [status, setStatus] = useState("예정");
  const [timeText, setTimeText] = useState("");

  useEffect(() => {
    const updateStatus = () => {
      const { status: newStatus, time } = getStatusAndTime(startTime, endTime, isClosed);
      const newTimeText = newStatus === "진행중" ? formatTimeLeft(time) : newStatus;

      setStatus((prev) => {
        if (prev !== newStatus && onStatusChange) {
          onStatusChange(newStatus);
        }

        // 마감 시 콜백 (즉시구매든 시간이 끝났든 모두 포함)
        if (newStatus === "마감" && fnc && !isClosed) {
          fnc(id, isClosed);
        }

        return newStatus;
      });

      setTimeText(newTimeText);
    };

    updateStatus(); // 초기 실행
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime, isClosed, onStatusChange, fnc, id]);

  return (
    <span className={`auction-time-left auction-status-${status}`}>
      {timeText}
    </span>
  );
};

export default AuctionTimeLeft;
