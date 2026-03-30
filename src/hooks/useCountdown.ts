import { useState, useEffect } from "react";

export const useCountdown = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const start = (newSeconds?: number) => {
    if (newSeconds !== undefined) {
      setSeconds(newSeconds);
    }
    setIsActive(true);
  };

  const reset = () => {
    setSeconds(initialSeconds);
    setIsActive(false);
  };

  return { seconds, isActive, start, reset };
};
