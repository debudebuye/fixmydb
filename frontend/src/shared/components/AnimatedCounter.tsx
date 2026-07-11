import { useState, useEffect, useRef } from 'react';

/** Counts from 0 to `value` with eased animation. Optional `formatter` for locale-aware display. */
interface Props {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
}

export default function AnimatedCounter({ value, duration = 1200, formatter }: Props) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = value - start;
    if (diff === 0) return;

    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
        prevRef.current = value;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const fmt = formatter || ((n: number) => n.toLocaleString());
  return <>{fmt(display)}</>;
}
