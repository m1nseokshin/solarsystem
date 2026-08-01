"use client";

import { useEffect, useState, type RefObject } from "react";
import { COSMIC_EVENTS, type CosmicEvent } from "@/lib/events";

const SPEEDS = [
  { value: 0, label: "∥", aria: "일시정지" },
  { value: 1, label: "1×", aria: "초당 1일" },
  { value: 7, label: "7×", aria: "초당 7일" },
  { value: 30, label: "30×", aria: "초당 30일" },
];

type Props = {
  speed: number;
  onSpeedChange: (v: number) => void;
  simDateRef: RefObject<Date>;
  onSelectEvent?: (planetId?: string) => void;
};

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default function TimeControls({
  speed,
  onSpeedChange,
  simDateRef,
  onSelectEvent,
}: Props) {
  const [label, setLabel] = useState("");
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    setLabel(formatDate(simDateRef.current));
    const id = setInterval(() => {
      setLabel(formatDate(simDateRef.current));
    }, 200);
    return () => clearInterval(id);
  }, [simDateRef]);

  const handleResetToday = () => {
    simDateRef.current = new Date();
    setLabel(formatDate(simDateRef.current));
  };

  const handleSelectEvent = (evt: CosmicEvent) => {
    const [y, m, d] = evt.date.split("-").map(Number);
    simDateRef.current = new Date(y, m - 1, d);
    setLabel(formatDate(simDateRef.current));
    setShowTimeline(false);
    if (evt.targetPlanetId && onSelectEvent) {
      onSelectEvent(evt.targetPlanetId);
    }
  };

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 p-6 sm:p-8 sm:px-12 md:px-16 lg:px-20">
      <div className="pointer-events-auto mb-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleResetToday}
          className="type-button-cap text-xs border border-hairline hover:border-foreground bg-surface/80 rounded-full px-3 py-1.5 text-foreground transition-colors flex items-center gap-1.5"
        >
          Today (오늘) ↺
        </button>
      </div>

      <p className="type-eyebrow text-muted">
        시뮬레이션 날짜 · Simulation date
      </p>

      <div className="flex items-baseline gap-4">
        <p
          className="mt-1 text-4xl tracking-wide"
          style={{ fontFamily: "var(--font-display)", fontSynthesisWeight: "none" }}
        >
          {label}
        </p>
      </div>

      <div className="pointer-events-auto mt-4 flex items-center gap-2 flex-wrap">
        {SPEEDS.map((s) => (
          <button
            key={s.value}
            type="button"
            aria-label={s.aria}
            onClick={() => onSpeedChange(s.value)}
            className={`type-button-cap rounded-full border px-4 py-2.5 transition-colors ${
              speed === s.value
                ? "border-foreground bg-foreground text-black"
                : "border-hairline text-foreground hover:border-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}

        {/* 타임라인 중요한 날짜 버튼 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTimeline((v) => !v)}
            className={`type-button-cap rounded-full border px-4 py-2.5 transition-colors flex items-center gap-1.5 ${
              showTimeline
                ? "border-foreground bg-foreground text-black"
                : "border-hairline text-foreground bg-surface/80 hover:border-foreground"
            }`}
          >
            ✦ 주요 이벤트 타임라인
          </button>

          {/* 타임라인 드롭업 메인 팝업 */}
          {showTimeline && (
            <div className="absolute bottom-full left-0 mb-3 w-80 max-h-80 overflow-y-auto rounded-2xl border border-hairline bg-surface/95 backdrop-blur-md p-4 shadow-2xl z-50">
              <p className="type-eyebrow text-muted mb-3 border-b border-hairline pb-2">
                우주 역사상 주요 날짜 (Timeline Events)
              </p>
              <div className="space-y-3">
                {COSMIC_EVENTS.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => handleSelectEvent(evt)}
                    className="w-full text-left p-2.5 rounded-xl border border-transparent hover:border-hairline hover:bg-background/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="type-caption font-bold text-foreground group-hover:text-foreground">
                        {evt.title}
                      </span>
                      <span className="type-eyebrow text-muted text-xs">{evt.date}</span>
                    </div>
                    <p className="type-caption text-xs text-muted mt-1 line-clamp-2">
                      {evt.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="type-caption mt-2 text-muted">
        1× = 1일/초 · 1 day per second
      </p>
    </div>
  );
}
