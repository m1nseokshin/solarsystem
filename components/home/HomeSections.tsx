import Link from "next/link";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

const features = [
  {
    ko: "astronomy-engine 천문 계산으로 오늘 날짜의 실제 행성 위치를 재현합니다.",
    en: "Real planetary positions computed for today's date.",
  },
  {
    ko: "실제 공전 주기 비율 그대로, 시간을 배속해 태양계의 움직임을 관찰합니다.",
    en: "Watch the system move with true relative orbital periods.",
  },
  {
    ko: "행성을 클릭하면 NASA 팩트시트 기반의 상세 정보를 볼 수 있습니다.",
    en: "Click any planet for facts based on NASA fact sheets.",
  },
];

export default function HomeSections() {
  return (
    <>
      <section className="relative bg-background px-6 py-28 sm:py-36">
        <div className="mx-auto max-w-4xl">
          <RevealOnScroll>
            <p className="type-eyebrow text-muted">What Is This</p>
            <h2 className="type-display-xl mt-4">
              Real Positions.
              <br />
              Real Motion.
            </h2>
            <p className="type-body-lg mt-8 max-w-2xl text-foreground-mute">
              이 사이트는 태양계를 눈으로 이해하기 위한 3D 인터랙티브 교육
              사이트입니다. 그림이 아니라 계산된 태양계 — 행성들은 지금 이
              순간의 실제 위치에 있습니다.
            </p>
            <p className="type-caption mt-3 max-w-2xl text-muted">
              An educational 3D experience — not an illustration, but a
              computed solar system.
            </p>
          </RevealOnScroll>

          <div className="mt-16 border-t border-hairline">
            {features.map((f, i) => (
              <RevealOnScroll key={f.en} delay={i * 100}>
                <div className="grid gap-2 border-b border-hairline py-6 sm:grid-cols-[3rem_1fr]">
                  <span className="type-eyebrow text-muted">0{i + 1}</span>
                  <div>
                    <p className="type-body-lg text-foreground-mute">{f.ko}</p>
                    <p className="type-eyebrow mt-1 text-muted">{f.en}</p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-surface px-6 py-28 text-center sm:py-36">
        <RevealOnScroll>
          <p className="type-eyebrow text-muted">Ready When You Are</p>
          <h2 className="type-display-lg mt-4">
            Explore the
            <br />
            Solar System
          </h2>
          <p className="type-caption mx-auto mt-6 max-w-md text-muted">
            드래그로 돌려보고, 시간을 배속하고, 행성을 눌러보세요.
          </p>
          <div className="mt-10">
            <Link href="/explore/" className="btn-ghost">
              Start Exploring
            </Link>
          </div>
          <p className="type-caption mt-10 text-muted">
            만든 사람이 궁금하다면{" "}
            <Link href="/about/" className="link-dark">
              About
            </Link>
          </p>
        </RevealOnScroll>
      </section>
    </>
  );
}
