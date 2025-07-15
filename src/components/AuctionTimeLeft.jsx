import React, { useEffect, useState } from "react";

const getStatusAndTime = (startTime, endTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (now < start) return { status: "예정", time: start };
  if (now >= start && now < end) return { status: "진행중", time: end };
  return { status: "마감", time: end };
};

const formatTimeLeft = (target) => {
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) return "마감";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  let result = "";
  if (days > 0) result += `${days}일 `;
  if (days > 0 || hours > 0) result += `${hours}시간 `;
  if (days > 0 || hours > 0 || minutes > 0) result += `${minutes}분 `;
  result += `${seconds}초`;
  return result.trim();
};

const AuctionTimeLeft = ({ startTime, endTime, onStatusChange }) => {
  const [status, setStatus] = useState("진행중");
  const [timeText, setTimeText] = useState("");

  useEffect(() => {
    const update = () => {
      const { status, time } = getStatusAndTime(startTime, endTime);
      setStatus(status);
      setTimeText(status === "진행중" ? formatTimeLeft(time) : status === "예정" ? "예정" : "마감");
      if (onStatusChange) onStatusChange(status);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [startTime, endTime, onStatusChange]);

  return (
    <span className={`auction-time-left auction-status-${status}`}>{status === "진행중" ? timeText : status}</span>
  );
};

export default AuctionTimeLeft; 