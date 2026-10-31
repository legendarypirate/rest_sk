'use client';

import { useEffect, useState } from 'react';

function formatClock(date: Date) {
  return date.toLocaleTimeString('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function KioskClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    function tick() {
      setNow(new Date());
    }

    tick();
    const timer = window.setInterval(tick, 15_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!now) {
    return (
      <time className="inline-block w-[5ch] tabular-nums" aria-hidden>
        {'\u00a0'}
      </time>
    );
  }

  return (
    <time className="inline-block w-[5ch] tabular-nums" dateTime={now.toISOString()}>
      {formatClock(now)}
    </time>
  );
}
