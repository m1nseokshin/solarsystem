"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import HomeScene from "./HomeScene";
import { useLanguage } from "@/lib/i18n";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/** 아래에서 살짝 올라오며 등장 → 스크롤 진행에 따라 위로 빠지며 퇴장 */
function applyWindow(
  el: HTMLElement | null,
  p: number,
  in0: number,
  in1: number,
  out0: number,
  out1: number,
  dy = 28,
) {
  if (!el) return;
  const enter = smoothstep(in0, in1, p);
  const exit = smoothstep(out0, out1, p);
  el.style.opacity = `${enter * (1 - exit)}`;
  el.style.transform = `translateY(${(1 - enter) * dy - exit * dy}px)`;
}

export default function HomeHero() {
  const containerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const earthCapRef = useRef<HTMLDivElement>(null);
  const sunCapRef = useRef<HTMLDivElement>(null);
  const finalCapRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(mq.matches);
      // 모션 축소: 스크럽 없이 전체 태양계가 보이는 정적 컷
      if (mq.matches) progressRef.current = 1;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useGSAP(
    () => {
      if (reduced) return;
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          progressRef.current = p;
          if (titleRef.current) {
            titleRef.current.style.opacity = `${1 - smoothstep(0.02, 0.12, p)}`;
          }
          if (hintRef.current) {
            hintRef.current.style.opacity = `${1 - smoothstep(0.01, 0.06, p)}`;
          }
          applyWindow(earthCapRef.current, p, 0.16, 0.24, 0.34, 0.42);
          applyWindow(sunCapRef.current, p, 0.46, 0.54, 0.6, 0.68);
          applyWindow(finalCapRef.current, p, 0.78, 0.88, 1.1, 1.2);
        },
      });
    },
    { dependencies: [reduced], revertOnUpdate: true, scope: containerRef },
  );

  const { lang } = useLanguage();

  return (
    <section
      ref={containerRef}
      className={`relative ${reduced ? "h-screen" : "h-[1400vh]"}`}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Canvas dpr={[1, 2]} camera={{ fov: 55, near: 0.1, far: 800 }}>
          <HomeScene progressRef={progressRef} />
        </Canvas>

        {/* 타이틀: 스크롤 시작과 함께 사라짐 */}
        <div
          ref={titleRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 pb-40 text-center"
        >
          <p className="type-eyebrow text-foreground-mute">
            An Interactive 3D Explorer
          </p>
          <h1 className="type-display-xxl mt-3">Solar System</h1>
          <p className="type-caption mt-6 max-w-md text-muted">
            {lang === "ko" ? (
              <>
                실제 천문 계산으로 재현한 태양계.
                <br />
                스크롤해서 태양계를 여행해 보세요.
              </>
            ) : (
              <>
                Solar system recreated with real astronomical calculations.
                <br />
                Scroll down to explore the cosmos.
              </>
            )}
          </p>
        </div>

        {/* 1. 지구 공전 */}
        <div
          ref={earthCapRef}
          className="pointer-events-none absolute bottom-24 left-6 max-w-sm sm:left-10"
          style={{ opacity: 0 }}
        >
          <p className="type-eyebrow text-muted">Orbital Velocity</p>
          <p className="type-body-lg mt-2 text-foreground-mute">
            {lang === "ko" ? (
              <>
                지구는 초속 29.8km로 태양 주위를 돕니다.
                <br />
                <span className="type-caption text-muted">
                  Earth orbits the Sun at 29.8 km/s.
                </span>
              </>
            ) : (
              <>
                Earth orbits the Sun at a speed of 29.8 km/s.
                <br />
                <span className="type-caption text-muted">
                  Completing one orbit every 365.25 days.
                </span>
              </>
            )}
          </p>
        </div>

        {/* 2. 태양 */}
        <div
          ref={sunCapRef}
          className="pointer-events-none absolute bottom-24 left-6 max-w-sm sm:left-10"
          style={{ opacity: 0 }}
        >
          <p className="type-eyebrow text-muted">The Sun · 태양</p>
          <p className="type-body-lg mt-2 text-foreground-mute">
            {lang === "ko" ? (
              <>
                태양계 질량의 99.8%를 차지하는 항성.
                <br />
                표면 온도는 약 5,500°C에 달합니다.
                <br />
                <span className="type-caption text-muted">
                  A star holding 99.8% of the system&apos;s mass.
                </span>
              </>
            ) : (
              <>
                A star containing 99.8% of the mass in the Solar System.
                <br />
                Surface temperature reaches approx. 5,500°C.
              </>
            )}
          </p>
        </div>

        {/* 3. 여덟 행성 */}
        <div
          ref={finalCapRef}
          className="pointer-events-none absolute bottom-24 left-6 max-w-sm sm:left-10"
          style={{ opacity: reduced ? 1 : 0 }}
        >
          <p className="type-eyebrow text-muted">One Star, Eight Planets</p>
          <p className="type-body-lg mt-2 text-foreground-mute">
            {lang === "ko" ? (
              <>
                이러한 태양 주위를 여덟 행성이
                <br />
                저마다의 속도로 돌고 있습니다.
                <br />
                <span className="type-caption text-muted">
                  Eight planets orbit this star, each at its own pace.
                </span>
              </>
            ) : (
              <>
                Eight planets orbit around this star,
                <br />
                each at its own unique pace.
              </>
            )}
          </p>
        </div>

        {/* 스크롤 힌트: 흰 화살표, 은은한 깜빡임 */}
        {!reduced && (
          <div
            ref={hintRef}
            className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="scroll-hint flex flex-col items-center gap-2 text-foreground">
              <p className="type-eyebrow">Scroll</p>
              <svg
                width="18"
                height="26"
                viewBox="0 0 18 26"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 1v20" />
                <path d="M2 15l7 8 7-8" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
