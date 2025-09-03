"use client";

import React, { useEffect, useState } from "react";

type Props = {
  size?: number;       // overall component size in px (default 220)
  color?: string;      // active dot / glow color (default lime-ish)
  duration?: number;   // total time to reach 100% in ms (default 3800)
};

export default function VirusMorphLoader({
  size = 220,
  color = "#00FFAB",
  duration = 3800,
}: Props) {
  const DOTS = 28;
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  // animate progress from 0 -> 100
  useEffect(() => {
    let cur = 0;
    const steps = 100;
    const stepMs = Math.max(8, Math.round(duration / steps));
    const id = setInterval(() => {
      // random-ish increment for a more organic feel
      const inc = Math.random() < 0.12 ? 3 : Math.random() < 0.6 ? 2 : 1;
      cur = Math.min(100, cur + inc);
      setProgress(cur);
      if (cur >= 100) {
        clearInterval(id);
        // small delay before showing final emoji
        setTimeout(() => setDone(true), 200);
      }
    }, stepMs);
    return () => clearInterval(id);
  }, [duration]);

  const activeCount = Math.round((progress / 100) * DOTS);
  const radius = Math.max(28, Math.round(size / 2 - size * 0.14)); // px
  const dotSize = Math.max(6, Math.round(size * 0.06));

  return (
    <div
      className="vm-root"
      style={{ width: size, height: size, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}
      aria-hidden
    >
      {/* Ring of dots */}
      <div className={`vm-ring ${done ? "vm-ring--fade" : ""}`}>
        {Array.from({ length: DOTS }).map((_, i) => {
          const angle = (360 / DOTS) * i;
          const isOn = i < activeCount;
          const inlineTransform = `translate(-50%,-50%) rotate(${angle}deg) translate(${radius}px)`;
          // staggered transition delay so dots appear sweeping
          const delay = `${(i / DOTS) * 220}ms`;
          return (
            <div
              key={i}
              className={`vm-dot ${isOn ? "vm-dot--on" : "vm-dot--off"}`}
              style={{
                width: dotSize,
                height: dotSize,
                transform: inlineTransform,
                transitionDelay: delay,
                boxShadow: isOn ? `0 0 10px ${color}, 0 0 24px ${color}66` : undefined,
                background: isOn ? color : "rgba(255,255,255,0.07)",
              }}
            />
          );
        })}
      </div>

      {/* center emoji that shows after completion */}
      <div className={`vm-center ${done ? "vm-center--show" : ""}`} style={{ width: size * 0.7, height: size * 0.7 }}>
        <span className="vm-emoji" style={{ fontSize: Math.round(size * 0.45) }}>
          🦠
        </span>
      </div>

      {/* styles (styled-jsx works inside Next.js components) */}
      <style jsx>{`
        .vm-root {
          position: relative;
          display: inline-block;
        }

        .vm-ring {
          position: absolute;
          inset: 0;
          left: 0;
          top: 0;
          display: block;
          transform: translateZ(0);
          transition: opacity 450ms ease, transform 450ms ease;
        }

        .vm-ring--fade {
          opacity: 0;
          transform: scale(0.92);
        }

        .vm-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 999px;
          opacity: 0.28;
          transition: transform 240ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 240ms ease, background 240ms ease, box-shadow 240ms ease;
          will-change: transform, opacity, box-shadow, background;
        }

        .vm-dot--on {
          opacity: 1;
          transform-origin: center;
          transform: translate(-50%, -50%) scale(1.18);
        }

        .vm-dot--off {
          transform-origin: center;
        }

        .vm-center {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) scale(0.74);
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 520ms cubic-bezier(0.18, 0.9, 0.32, 1), opacity 260ms ease;
          pointer-events: none;
          user-select: none;
        }

        .vm-center--show {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }

        .vm-emoji {
          display: inline-block;
          transform-origin: center;
          filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45));
          animation: vm-pop 700ms cubic-bezier(0.2, 0.85, 0.3, 1);
        }

        @keyframes vm-pop {
          0% {
            transform: scale(0.82) rotate(-6deg);
            opacity: 0;
          }
          55% {
            transform: scale(1.12) rotate(6deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}