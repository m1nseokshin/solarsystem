import {
  Body,
  HelioVector,
  RotateVector,
  Rotation_EQJ_ECL,
} from "astronomy-engine";
import { asset } from "./asset";

/**
 * 실거리(AU)를 화면 좌표로 압축하는 거듭제곱 스케일.
 * 실스케일이면 해왕성(30AU)이 수성(0.39AU)의 77배 거리라 화면에 함께 못 담음 →
 * r^0.45로 압축해 약 7:1로 줄임. 궤도선도 같은 함수로 샘플링해야 위치와 일치함.
 */
const DIST_SCALE = 12;
const DIST_EXP = 0.45;

/** 행성 반지름도 별도 스케일로 압축 (실비율이면 목성 옆에서 수성이 안 보임) */
const SIZE_SCALE = 0.5;
const SIZE_EXP = 0.5;
const EARTH_RADIUS_KM = 6371;

export const SUN_DISPLAY_RADIUS = 2.6;

export interface PlanetFact {
  labelKo: string;
  labelEn: string;
  value: string;
}

export interface PlanetData {
  id: string;
  body: Body;
  nameKo: string;
  nameEn: string;
  texture: string;
  /** 라벨·하이라이트 등 UI 보조용 대표색 */
  color: string;
  radiusKm: number;
  semiMajorAxisAu: number;
  orbitalPeriodDays: number;
  /** 시간(hour), 음수 = 역행 자전 */
  rotationPeriodHours: number;
  axialTiltDeg: number;
  moons: number;
  taglineKo: string;
  taglineEn: string;
  descriptionKo: string;
  descriptionEn?: string;
  facts: PlanetFact[];
  hasRing?: boolean;
}

type PlanetCore = Omit<PlanetData, "facts">;

function buildFacts(d: PlanetCore, massE24: number): PlanetFact[] {
  const rot = Math.abs(d.rotationPeriodHours);
  const rotStr =
    rot >= 48
      ? `${(rot / 24).toFixed(1)}일 (days)`
      : `${rot.toFixed(1)}시간 (hours)`;
  return [
    {
      labelKo: "지름",
      labelEn: "Diameter",
      value: `${(d.radiusKm * 2).toLocaleString()} km`,
    },
    {
      labelKo: "질량",
      labelEn: "Mass",
      value: `${massE24} × 10²⁴ kg`,
    },
    {
      labelKo: "태양과의 평균 거리",
      labelEn: "Distance from Sun",
      value: `${d.semiMajorAxisAu} AU`,
    },
    {
      labelKo: "공전 주기",
      labelEn: "Orbital period",
      value:
        d.orbitalPeriodDays >= 1000
          ? `${(d.orbitalPeriodDays / 365.25).toFixed(1)}년 (years)`
          : `${d.orbitalPeriodDays.toFixed(1)}일 (days)`,
    },
    {
      labelKo: "자전 주기",
      labelEn: "Rotation period",
      value: `${rotStr}${d.rotationPeriodHours < 0 ? " · 역행 (retrograde)" : ""}`,
    },
    {
      labelKo: "자전축 기울기",
      labelEn: "Axial tilt",
      value: `${d.axialTiltDeg}°`,
    },
    {
      labelKo: "위성 수",
      labelEn: "Moons",
      value: `${d.moons}`,
    },
  ];
}

function planet(p: PlanetCore, massE24: number): PlanetData {
  return { ...p, texture: asset(p.texture), facts: buildFacts(p, massE24) };
}

/** NASA Planetary Fact Sheet 기준 */
export const PLANETS: PlanetData[] = [
  planet(
    {
      id: "mercury",
      body: Body.Mercury,
      nameKo: "수성",
      nameEn: "Mercury",
      texture: "/textures/2k_mercury.jpg",
      color: "#8a8a8a",
      radiusKm: 2439.7,
      semiMajorAxisAu: 0.387,
      orbitalPeriodDays: 87.97,
      rotationPeriodHours: 1407.6,
      axialTiltDeg: 0.03,
      moons: 0,
      taglineKo: "태양에 가장 가까운 행성",
      taglineEn: "The closest planet to the Sun",
      descriptionKo:
        "태양계에서 가장 작은 행성으로, 대기가 거의 없어 낮에는 430°C까지 오르고 밤에는 -180°C까지 떨어집니다. 한 번 자전하는 데 지구 기준 59일이 걸립니다.",
      descriptionEn:
        "The smallest planet in the Solar System. With almost no atmosphere, surface temperatures range from 430°C during the day to -180°C at night. Takes 59 Earth days per rotation.",
    },
    0.33,
  ),
  planet(
    {
      id: "venus",
      body: Body.Venus,
      nameKo: "금성",
      nameEn: "Venus",
      texture: "/textures/2k_venus_surface.jpg",
      color: "#c9a06c",
      radiusKm: 6051.8,
      semiMajorAxisAu: 0.723,
      orbitalPeriodDays: 224.7,
      rotationPeriodHours: -5832.5,
      axialTiltDeg: 177.4,
      moons: 0,
      taglineKo: "태양계에서 가장 뜨거운 행성",
      taglineEn: "The hottest planet in the solar system",
      descriptionKo:
        "짙은 이산화탄소 대기의 온실효과로 표면 온도가 465°C에 달합니다. 다른 행성과 반대 방향으로 자전하며, 자전 한 바퀴(243일)가 공전(225일)보다 깁니다.",
      descriptionEn:
        "Surface temperature reaches 465°C due to extreme greenhouse effect from dense CO2 atmosphere. Rotates backward relative to most planets, with a day longer than its year.",
    },
    4.87,
  ),
  planet(
    {
      id: "earth",
      body: Body.Earth,
      nameKo: "지구",
      nameEn: "Earth",
      texture: "/textures/2k_earth_daymap.jpg",
      color: "#8fd3ff",
      radiusKm: 6371,
      semiMajorAxisAu: 1.0,
      orbitalPeriodDays: 365.26,
      rotationPeriodHours: 23.93,
      axialTiltDeg: 23.44,
      moons: 1,
      taglineKo: "생명이 확인된 유일한 행성",
      taglineEn: "The only known planet with life",
      descriptionKo:
        "표면의 71%가 바다로 덮여 있는, 지금까지 생명이 확인된 유일한 천체입니다. 23.4°의 자전축 기울기가 계절을 만듭니다.",
      descriptionEn:
        "71% of its surface is covered by oceans, making it the only known body to harbor life. An axial tilt of 23.4° produces our familiar seasons.",
    },
    5.97,
  ),
  planet(
    {
      id: "mars",
      body: Body.Mars,
      nameKo: "화성",
      nameEn: "Mars",
      texture: "/textures/2k_mars.jpg",
      color: "#b0603f",
      radiusKm: 3389.5,
      semiMajorAxisAu: 1.524,
      orbitalPeriodDays: 686.98,
      rotationPeriodHours: 24.62,
      axialTiltDeg: 25.19,
      moons: 2,
      taglineKo: "붉은 사막의 행성",
      taglineEn: "The red desert planet",
      descriptionKo:
        "산화철 먼지 때문에 붉게 보입니다. 태양계에서 가장 큰 화산인 올림푸스 몬스(높이 약 22km)가 있으며, 하루 길이는 지구와 비슷한 24.6시간입니다.",
      descriptionEn:
        "Appears reddish due to iron oxide dust. Home to Olympus Mons (22km high), the largest volcano in the Solar System. Has a day length similar to Earth (24.6 hours).",
    },
    0.642,
  ),
  planet(
    {
      id: "jupiter",
      body: Body.Jupiter,
      nameKo: "목성",
      nameEn: "Jupiter",
      texture: "/textures/2k_jupiter.jpg",
      color: "#c8a97e",
      radiusKm: 69911,
      semiMajorAxisAu: 5.204,
      orbitalPeriodDays: 4332.59,
      rotationPeriodHours: 9.93,
      axialTiltDeg: 3.13,
      moons: 95,
      taglineKo: "태양계에서 가장 큰 행성",
      taglineEn: "The largest planet in the solar system",
      descriptionKo:
        "지구 1,300개가 들어가는 크기의 가스 행성입니다. 대적점은 지구보다 큰 폭풍으로 최소 300년 이상 지속되고 있습니다. 자전이 가장 빨라 하루가 10시간이 안 됩니다.",
      descriptionEn:
        "A gas giant large enough to hold 1,300 Earths. The Great Red Spot is a persistent storm larger than Earth. Fastest rotation speed with a day under 10 hours.",
    },
    1898,
  ),
  planet(
    {
      id: "saturn",
      body: Body.Saturn,
      nameKo: "토성",
      nameEn: "Saturn",
      texture: "/textures/2k_saturn.jpg",
      color: "#d6c08e",
      radiusKm: 58232,
      semiMajorAxisAu: 9.573,
      orbitalPeriodDays: 10759.22,
      rotationPeriodHours: 10.66,
      axialTiltDeg: 26.73,
      moons: 146,
      taglineKo: "고리를 두른 가스 행성",
      taglineEn: "The ringed gas giant",
      descriptionKo:
        "얼음과 암석 조각으로 이루어진 고리는 폭이 약 28만 km에 달하지만 두께는 수십 미터에 불과합니다. 밀도가 물보다 낮은 유일한 행성입니다.",
      descriptionEn:
        "Famous for its ice and rock ring system spanning 280,000 km in width. The only planet in the Solar System less dense than water.",
      hasRing: true,
    },
    568,
  ),
  planet(
    {
      id: "uranus",
      body: Body.Uranus,
      nameKo: "천왕성",
      nameEn: "Uranus",
      texture: "/textures/2k_uranus.jpg",
      color: "#9fd4d9",
      radiusKm: 25362,
      semiMajorAxisAu: 19.165,
      orbitalPeriodDays: 30688.5,
      rotationPeriodHours: -17.24,
      axialTiltDeg: 97.77,
      moons: 28,
      taglineKo: "누워서 도는 얼음 행성",
      taglineEn: "The sideways ice giant",
      descriptionKo:
        "자전축이 97.8° 기울어져 거의 누운 채로 공전합니다. 메탄 대기가 붉은빛을 흡수해 청록색으로 보이며, 태양계에서 가장 추운 대기(-224°C)를 가졌습니다.",
      descriptionEn:
        "Orbits nearly on its side with an extreme axial tilt of 97.8°. Cyan appearance caused by atmospheric methane. Has the coldest planetary atmosphere (-224°C).",
    },
    86.8,
  ),
  planet(
    {
      id: "neptune",
      body: Body.Neptune,
      nameKo: "해왕성",
      nameEn: "Neptune",
      texture: "/textures/2k_neptune.jpg",
      color: "#4666c8",
      radiusKm: 24622,
      semiMajorAxisAu: 30.178,
      orbitalPeriodDays: 60182,
      rotationPeriodHours: 16.11,
      axialTiltDeg: 28.32,
      moons: 16,
      taglineKo: "태양계 가장 바깥의 행성",
      taglineEn: "The outermost planet",
      descriptionKo:
        "태양 빛이 지구의 900분의 1밖에 닿지 않는 가장 먼 행성입니다. 시속 2,000km가 넘는 태양계에서 가장 빠른 바람이 붑니다. 공전 한 바퀴에 165년이 걸립니다.",
      descriptionEn:
        "The most distant major planet receiving 1/900th of Earth's sunlight. Experiences the fastest winds in the Solar System (>2,000 km/h). One orbit takes 165 years.",
    },
    102,
  ),
];

export const HALLEY_COMET: PlanetData = planet(
  {
    id: "halley",
    body: Body.Sun, // Custom orbit
    nameKo: "핼리 혜성",
    nameEn: "Halley's Comet",
    texture: "/textures/2k_comet.jpg",
    color: "#70c3ff",
    radiusKm: 5.5,
    semiMajorAxisAu: 17.8,
    orbitalPeriodDays: 27500, // 75.3년
    rotationPeriodHours: 52.8,
    axialTiltDeg: 18.0,
    moons: 0,
    taglineKo: "75년 주기의 가장 유명한 얼음 혜성",
    taglineEn: "The most famous periodic comet",
    descriptionKo:
      "약 75~76년 주기로 태양계 안쪽을 방문하는 타원 궤도의 얼음 혜성입니다. 태양에 가까워지면 얼음과 먼지가 승화하며 약 1억 km 길이의 아름다운 푸른 꼬리를 형상화합니다.",
    descriptionEn:
      "A famous icy comet visiting the inner Solar System every 75-76 years on a highly elliptical orbit. Sublimating ice and dust create a 100M km blue ion tail near perihelion.",
  },
  0.00000000022,
);

/** 핼리 혜성의 실제 Kepler 궤도 요소 기반 위치 계산 (1986-02-09 근일점) */
export function halleyPosition(date: Date): [number, number, number] {
  const perihelionTime = new Date(1986, 1, 9, 15, 30).getTime();
  const periodDays = 75.32 * 365.25;
  const periodMs = periodDays * 86400 * 1000;

  // 근일점 기준 경과 시간 (주기 랩핑)
  let dt = (date.getTime() - perihelionTime) % periodMs;
  if (dt < 0) dt += periodMs;

  const M = (2 * Math.PI * dt) / periodMs; // 평균 근점이각

  // 케플러 궤도 요소 (Halley's Comet official orbital elements)
  const a = 17.834; // 장반경 AU
  const e = 0.96714; // 편심률
  const iDeg = 162.26; // 궤도 경사각 (역행)
  const omegaDeg = 111.85; // 근일점 인수
  const nodeDeg = 58.42; // 승교점 경도

  // 케플러 방정식 (E - e*sinE = M)
  let E = M;
  for (let step = 0; step < 10; step++) {
    E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
  }

  // 궤도 평면 상의 극좌표
  const rAu = a * (1 - e * Math.cos(E));
  const v = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));

  // 3차원 황도 궤도 회전 (Euler Rotation: Node -> Inclination -> Perihelion argument)
  const rad = Math.PI / 180;
  const i = iDeg * rad;
  const w = omegaDeg * rad;
  const N = nodeDeg * rad;

  const u = v + w;
  const xEcl = rAu * (Math.cos(N) * Math.cos(u) - Math.sin(N) * Math.sin(u) * Math.cos(i));
  const yEcl = rAu * (Math.sin(N) * Math.cos(u) + Math.cos(N) * Math.sin(u) * Math.cos(i));
  const zEcl = rAu * (Math.sin(u) * Math.sin(i));

  const len = Math.sqrt(xEcl * xEcl + yEcl * yEcl + zEcl * zEcl);
  if (len === 0) return [0, 0, 0];
  const scaled = DIST_SCALE * Math.pow(len, DIST_EXP);
  const f = scaled / len;

  // Three.js 씬 좌표계 (XZ 평면 황도, Y축 높이)
  return [xEcl * f, zEcl * f, -yEcl * f];
}

export function getPlanet(id: string): PlanetData | undefined {
  if (id === "halley") return HALLEY_COMET;
  return PLANETS.find((p) => p.id === id);
}

export function displayRadius(radiusKm: number): number {
  return SIZE_SCALE * Math.pow(radiusKm / EARTH_RADIUS_KM, SIZE_EXP);
}

/**
 * 특정 날짜의 실제 태양 중심 위치(astronomy-engine, J2000 적도좌표)를
 * 황도좌표로 회전 후 압축 스케일을 적용해 three.js 좌표 [x, y, z]로 반환.
 * 황도면이 XZ 평면, 궤도 경사는 Y로 유지됨.
 */
export function displayPosition(
  body: Body,
  date: Date,
): [number, number, number] {
  const eq = HelioVector(body, date);
  const ecl = RotateVector(Rotation_EQJ_ECL(), eq);
  const len = Math.sqrt(ecl.x * ecl.x + ecl.y * ecl.y + ecl.z * ecl.z);
  if (len === 0) return [0, 0, 0];
  const scaled = DIST_SCALE * Math.pow(len, DIST_EXP);
  const f = scaled / len;
  return [ecl.x * f, ecl.z * f, -ecl.y * f];
}

/** 궤도선: 공전 주기를 N등분해 displayPosition과 같은 압축으로 샘플링 */
export function orbitPoints(
  planet: PlanetData,
  date: Date,
  segments = 360,
): [number, number, number][] {
  const points: [number, number, number][] = [];
  const periodMs = planet.orbitalPeriodDays * 86400 * 1000;
  // 현재 선택된 날짜를 중심으로 전후 반주기를 샘플링하여 궤도선과 행성 포지션이 정확히 일치하도록 함
  const startTime = date.getTime();
  for (let i = 0; i <= segments; i++) {
    const t = new Date(startTime + (periodMs * i) / segments);
    points.push(displayPosition(planet.body, t));
  }
  return points;
}
