export type CosmicEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  targetPlanetId?: string;
};

export const COSMIC_EVENTS: CosmicEvent[] = [
  {
    id: "great-conjunction-2020",
    date: "2020-12-21",
    title: "목성-토성 대결합 (Great Conjunction)",
    titleEn: "Great Conjunction (Jupiter-Saturn)",
    description: "약 800년 만에 목성과 토성이 밤하늘에서 거의 하나처럼 보일 정도로 최단 거리에 근접했던 희귀 천문 현상입니다.",
    descriptionEn: "A rare astronomical event where Jupiter and Saturn closely aligned in the night sky for the first time in nearly 800 years.",
    targetPlanetId: "jupiter",
  },
  {
    id: "mars-close-2020",
    date: "2020-10-06",
    title: "화성 대접근 (Mars Close Approach)",
    titleEn: "Mars Close Approach",
    description: "화성과 지구가 궤도 상 가장 가까워져, 밤하늘에서 화성이 유난히 붉고 밝게 빛났던 날입니다.",
    descriptionEn: "The day Mars and Earth made their closest orbital approach, making Mars shine exceptionally bright red in the night sky.",
    targetPlanetId: "mars",
  },
  {
    id: "venus-transit-2012",
    date: "2012-06-06",
    title: "금성의 태양면 통과 (Venus Transit)",
    titleEn: "Transit of Venus",
    description: "금성이 태양 앞을 지나가며 점으로 관측된 현상으로, 2117년에야 다시 볼 수 있는 21세기 희귀 현상입니다.",
    descriptionEn: "Venus passed directly across the Sun as a dark dot, a 21st-century rare phenomenon that won't recur until 2117.",
    targetPlanetId: "venus",
  },
  {
    id: "halley-perihelion-1986",
    date: "1986-02-09",
    title: "핼리 혜성의 근일점 통과 (1986)",
    titleEn: "Halley's Comet Perihelion (1986)",
    description: "75년 주기의 핼리 혜성이 태양과 가장 가까워졌던 날입니다. 3D 시뮬레이션에서 혜성과 푸른 꼬리를 확인해보세요.",
    descriptionEn: "The perihelion passage of Halley's Comet closest to the Sun. Observe the comet nucleus and blue tail in 3D simulation.",
    targetPlanetId: "halley",
  },
  {
    id: "halley-next-2061",
    date: "2061-07-28",
    title: "핼리 혜성 재방문 (2061)",
    titleEn: "Halley's Comet Return (2061)",
    description: "약 75년을 주기로 돌아오는 핼리 혜성이 다시 태양계 안쪽으로 들어오는 미래의 주요 천문 이벤트입니다.",
    descriptionEn: "Future major astronomical event when Halley's Comet returns to the inner solar system on its ~75 year periodic orbit.",
    targetPlanetId: "halley",
  },
];
