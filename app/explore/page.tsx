import type { Metadata } from "next";
import SolarSystemScene from "@/components/explore/SolarSystemScene";

export const metadata: Metadata = {
  title: "Explore | Solar System",
  description:
    "실제 오늘 날짜의 행성 위치로 재현한 3D 태양계를 자유롭게 탐험하세요. Explore the solar system with real planetary positions.",
};

export default function ExplorePage() {
  return <SolarSystemScene />;
}
