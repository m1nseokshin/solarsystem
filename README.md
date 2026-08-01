# [Solar System](https://m1nseokshin.github.io/solarsystem/)

실제 위치 기반 3D 태양계 및 핼리 혜성 관측 시뮬레이터 (An interactive 3D Solar System explorer powered by real planetary positions & ESA Rosetta 67P Comet model).

[![Solar System Demo](https://m1nseokshin.github.io/solarsystem/icon.svg)](https://m1nseokshin.github.io/solarsystem/)

## 🌌 주요 기능 (Key Features)

- **실제 3D 태양계 탐험 (Real 3D Solar System)**: astronomy-engine 기반 실제 날짜별 천체 위치 시뮬레이션.
- **ESA/NASA 관측 핼리 혜성 3D 모델 (Halley's Comet 3D Model)**: 고해상도 2K 암석 질감 표면 텍스처 맵핑과 3D 부채꼴 광륜 꼬리 효과.
- **인터랙티브 타임라인 (Timeline Events)**: 핼리 혜성 근일점 통과, 보이저 1호 태양계 이탈 등 우주 역사 이벤트 탐색.
- **반응형 UI & 가로/세로 퍼펙트 레이아웃**: 모바일 풀스크린 딥 블랙 내비게이션 패널 및 세련된 미니멀 아키텍처.

## 🚀 시작하기 (Getting Started)

개발 서버 실행:

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속하여 확인할 수 있습니다.

## 🛠️ 기술 스택 (Tech Stack)

- **Framework**: Next.js 15 (App Router)
- **3D Graphics**: Three.js, React Three Fiber (@react-three/fiber), Drei (@react-three/drei)
- **Astronomy Math**: astronomy-engine (J2000 Keplerian Calculations)
- **Styling**: TailwindCSS
