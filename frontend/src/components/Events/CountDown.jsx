import React, { useEffect, useState } from "react";

const CountDown = ({ product }) => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

  function calculateTimeLeft() {
    if (!product?.eventEndDate) return null;

    const endTime = new Date(product.eventEndDate).getTime();
    const startTime = new Date(product.eventStartDate).getTime();
    const now = new Date().getTime();

    // Event hasn't started
    if (now < startTime) {
      const diff = startTime - now;

      return {
        type: "start",
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    }

    // Event ended
    if (now >= endTime) {
      return { type: "ended" };
    }

    // Event active
    const diff = endTime - now;

    return {
      type: "end",
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    if (!product?.eventEndDate) return;

    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
    }, 1000);

    return () => clearInterval(timer);
  }, [product?.eventEndDate]);

  if (!timeLeft || timeLeft.type === "ended") {
    return <span className="text-red-500 text-sm md:text-base font-medium">{product?.eventTag} has ended</span>;
  }

  return (
    <div
      className={`text-sm md:text-base font-medium flex items-center gap-2 ${
        timeLeft.type === "start" ? "text-orange-500" : "text-indigo-600"
      }`}
    >
      <span className="font-bold">
        {product?.eventTag} {timeLeft.type === "start" ? "starts in:" : "ends in:"}
      </span>

      <span>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
};

export default CountDown;
