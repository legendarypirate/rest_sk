'use client';

import { useEffect, useState } from 'react';

export const KIOSK_WIDTH = 1080;
export const KIOSK_HEIGHT = 1920;

export function KioskStage({ children }: { children: React.ReactNode }) {
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    function fit() {
      const next = Math.min(
        window.innerWidth / KIOSK_WIDTH,
        window.innerHeight / KIOSK_HEIGHT,
      );
      setScale(next > 0 ? next : 1);
    }

    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  if (scale === null) {
    return <div className="fixed inset-0 bg-[#071018]" />;
  }

  return (
    <div className="fixed inset-0 grid place-items-center overflow-hidden bg-[#071018]">
      <div
        style={{
          width: KIOSK_WIDTH * scale,
          height: KIOSK_HEIGHT * scale,
        }}
      >
        <div
          className="origin-top-left"
          style={{
            width: KIOSK_WIDTH,
            height: KIOSK_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
