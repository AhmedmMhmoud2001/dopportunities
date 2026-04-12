import { useEffect, useState } from 'react';

interface UseCountUpOptions {
  duration?: number;
  start?: number;
  decimals?: number;
}

export const useCountUp = (
  end: number,
  options: UseCountUpOptions = {}
) => {
  const { duration = 2000, start = 0, decimals = 0 } = options;
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const startTime = Date.now();
    const difference = end - start;

    const updateCount = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = start + difference * easeOut;
      
      setCount(Number(current.toFixed(decimals)));

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(updateCount);
  }, [end, start, duration, decimals]);

  return { count, isAnimating };
};

