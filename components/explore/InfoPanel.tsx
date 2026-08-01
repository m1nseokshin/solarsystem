"use client";

import { useEffect, useRef, useState } from "react";
import type { PlanetData } from "@/lib/planets";

type Props = {
  planet: PlanetData | null;
  onClose: () => void;
};

const PEEK_HEIGHT = 120; // 미니 상태 높이 (px)

export default function InfoPanel({ planet, onClose }: Props) {
  const [shown, setShown] = useState<PlanetData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragHeight, setDragHeight] = useState<number | null>(null);

  const startYRef = useRef<number>(0);
  const startHeightRef = useRef<number>(PEEK_HEIGHT);

  useEffect(() => {
    if (planet) {
      setShown(planet);
      setIsExpanded(false);
      setDragHeight(null);
    }
  }, [planet]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // 터치 시작: 현재 손가락 Y 위치와 시작 높이 저장
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startYRef.current = e.touches[0].clientY;
    const maxH = window.innerHeight * 0.75;
    startHeightRef.current = isExpanded ? maxH : PEEK_HEIGHT;
  };

  // 터치 이동: 손가락 움직임(delta)에 따라 즉각적으로 높이(height) 변경
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = startYRef.current - e.touches[0].clientY; // 위로 올리면 양수
    const maxH = window.innerHeight * 0.8;
    const minH = 80;
    const newHeight = Math.min(Math.max(startHeightRef.current + deltaY, minH), maxH);
    setDragHeight(newHeight);
  };

  // 터치 종료: 손가락 뗐을 때 최종 높이에 따라 스냅 (전체/PEEK/닫기)
  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragHeight !== null) {
      const maxH = window.innerHeight * 0.75;
      const midH = (maxH + PEEK_HEIGHT) / 2;

      if (dragHeight < PEEK_HEIGHT - 30) {
        // 너무 아래로 내렸으면 닫기
        onClose();
      } else if (dragHeight > midH) {
        // 중간 이상 올렸으면 완전히 펼치기
        setIsExpanded(true);
      } else {
        // 그 외엔 PEEK 상태로
        setIsExpanded(false);
      }
    }
    setDragHeight(null);
  };

  // 계산된 모바일 높이 (드래그 중이면 동적 height, 아니면 state 기준)
  const currentMobileHeight = dragHeight !== null
    ? `${dragHeight}px`
    : isExpanded
      ? "75dvh"
      : `${PEEK_HEIGHT}px`;

  return (
    <aside
      aria-hidden={!planet}
      style={{
        height: typeof window !== "undefined" && window.innerWidth < 640 ? currentMobileHeight : undefined,
      }}
      className={`fixed z-40 bg-surface/95 backdrop-blur-md flex flex-col
        inset-x-0 bottom-0 border-t border-hairline shadow-2xl rounded-t-2xl
        sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-0 sm:h-full sm:w-full sm:max-w-md sm:rounded-none sm:border-l sm:border-t-0
        ${isDragging ? "transition-none" : "transition-all duration-300 ease-out"}
        ${
          planet
            ? "translate-y-0 sm:translate-x-0"
            : "translate-y-full sm:translate-x-full sm:translate-y-0"
        }`}
    >
      {shown && (
        <div className="relative flex flex-col h-full w-full">
          {/* 모바일 상단 드래그 핸들 (미니 상태 표출 헤더) */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              if (!isDragging) setIsExpanded((v) => !v);
            }}
            className="flex flex-col items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing select-none sm:hidden"
          >
            <div className="h-1.5 w-12 rounded-full bg-muted/60 mb-2" />
            {!isExpanded && (
              <div className="flex items-center justify-between w-full px-6">
                <div>
                  <p className="type-eyebrow text-muted text-xs leading-relaxed mb-0.5">{shown.taglineKo}</p>
                  <h3 className="type-display-lg text-foreground text-3xl font-bold">{shown.nameKo}</h3>
                </div>
              </div>
            )}
          </div>

          {/* 닫기 버튼 */}
          <button
            type="button"
            onClick={onClose}
            aria-label="패널 닫기"
            className="type-button-cap absolute right-5 top-3.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-hairline transition-colors hover:border-foreground sm:right-6 sm:top-20 sm:h-10 sm:w-10"
          >
            ✕
          </button>

          {/* 패널 본문 (스크롤 영역) */}
          <div
            onScroll={() => {
              if (!isExpanded && !isDragging) setIsExpanded(true);
            }}
            className="flex-1 overflow-y-auto px-6 pb-12 pt-2 sm:px-8 sm:pt-24"
          >
            {/* 데스크톱 또는 모바일 확장 상태일 때 헤더 노출 (리드카피 → 타이틀 순) */}
            <div className={!isExpanded ? "hidden sm:block" : "block"}>
              <p className="type-eyebrow text-muted text-sm sm:text-base leading-loose mb-1">
                {shown.taglineKo}
              </p>
              <h2 className="type-display-lg text-4xl sm:text-5xl font-bold">{shown.nameKo}</h2>
            </div>

            <p className="type-body-lg mt-4 sm:mt-8 text-foreground-mute">
              {shown.descriptionKo}
            </p>

            <dl className="mt-8 sm:mt-10 border-t border-hairline">
              {shown.facts.map((fact) => (
                <div
                  key={fact.labelEn}
                  className="flex items-center justify-between gap-6 border-b border-hairline py-3.5"
                >
                  <dt>
                    <span className="type-caption block">{fact.labelKo}</span>
                    <span className="type-eyebrow block text-muted">
                      {fact.labelEn}
                    </span>
                  </dt>
                  <dd className="type-caption text-right">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </aside>
  );
}
