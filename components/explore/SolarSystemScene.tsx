"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  PLANETS,
  SUN_DISPLAY_RADIUS,
  getPlanet,
  orbitPoints,
  type PlanetData,
} from "@/lib/planets";
import { asset } from "@/lib/asset";
import AtmosphereGlow from "@/components/canvas/AtmosphereGlow";
import PlanetMesh from "./PlanetMesh";
import CameraRig, { OVERVIEW_POS } from "./CameraRig";
import InfoPanel from "./InfoPanel";
import TimeControls from "./TimeControls";
import CometMesh from "./CometMesh";

function SimClock({
  simDateRef,
  speed,
}: {
  simDateRef: RefObject<Date>;
  speed: number;
}) {
  useFrame((_, delta) => {
    if (speed === 0) return;
    simDateRef.current = new Date(
      simDateRef.current.getTime() + speed * delta * 86400 * 1000,
    );
  });
  return null;
}

function MilkyWay() {
  const texture = useTexture(asset("/textures/2k_stars_milky_way.jpg"));
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh rotation={[0, 0, Math.PI / 8]}>
      <sphereGeometry args={[600, 48, 48]} />
      {/* color로 어둡게 눌러 순흑 캔버스 위에 은은하게 */}
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        color="#8a8a8a"
        depthWrite={false}
      />
    </mesh>
  );
}

function Sun() {
  const texture = useTexture(asset("/textures/2k_sun.jpg"));
  texture.colorSpace = THREE.SRGBColorSpace;
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.02;
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[SUN_DISPLAY_RADIUS, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {/* 코로나: 태양 전방위 열감 발광 */}
      <AtmosphereGlow
        radius={SUN_DISPLAY_RADIUS}
        color="#ffb347"
        intensity={1.3}
        spread={1.4}
        facing={0}
      />
    </group>
  );
}

function OrbitLine({
  planet,
  simDateRef,
  highlighted,
}: {
  planet: PlanetData;
  simDateRef: RefObject<Date>;
  highlighted: boolean;
}) {
  const points = useMemo(
    () => orbitPoints(planet, simDateRef.current, 360),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [planet, simDateRef.current.getFullYear()],
  );
  return (
    <Line
      points={points}
      color="#ffffff"
      transparent
      opacity={highlighted ? 0.45 : 0.13}
      lineWidth={1}
    />
  );
}

export default function SolarSystemScene() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const simDateRef = useRef(new Date());
  const groupsRef = useRef(new Map<string, THREE.Group>());
  const epoch = useMemo(() => new Date(), []);

  const register = useCallback((id: string, group: THREE.Group | null) => {
    if (group) groupsRef.current.set(id, group);
    else groupsRef.current.delete(id);
  }, []);

  const selected = selectedId ? (getPlanet(selectedId) ?? null) : null;

  return (
    <div className="fixed inset-0 bg-background">
      <Canvas
        dpr={[1, 2]}
        camera={{
          position: OVERVIEW_POS.toArray(),
          fov: 50,
          near: 0.1,
          far: 1500,
        }}
        onPointerMissed={() => setSelectedId(null)}
      >
        <SimClock simDateRef={simDateRef} speed={speed} />
        <ambientLight intensity={0.14} />
        <pointLight position={[0, 0, 0]} intensity={2.4} decay={0} />
        <MilkyWay />
        <Stars
          radius={400}
          depth={80}
          count={6000}
          factor={6}
          saturation={0}
          fade
          speed={0.4}
        />

        <Sun />
        {PLANETS.map((p) => (
          <OrbitLine
            key={`orbit-${p.id}`}
            planet={p}
            simDateRef={simDateRef}
            highlighted={selectedId === p.id}
          />
        ))}
        {PLANETS.map((p) => (
          <PlanetMesh
            key={p.id}
            data={p}
            simDateRef={simDateRef}
            speed={speed}
            selected={selectedId === p.id}
            onSelect={setSelectedId}
            register={register}
          />
        ))}

        {/* 핼리 혜성 3D 모델 및 푸른 꼬리 렌더링 */}
        <CometMesh
          simDateRef={simDateRef}
          speed={speed}
          selected={selectedId === "halley"}
          onSelect={setSelectedId}
          register={register}
        />

        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={140}
        />
        <CameraRig selectedId={selectedId} groupsRef={groupsRef} />
      </Canvas>

      <TimeControls
        speed={speed}
        onSpeedChange={setSpeed}
        simDateRef={simDateRef}
        onSelectEvent={setSelectedId}
      />
      <InfoPanel planet={selected} onClose={() => setSelectedId(null)} />

      <p className="type-eyebrow pointer-events-none fixed bottom-6 right-6 z-30 hidden text-right text-muted sm:block">
        드래그 회전 · 스크롤 줌 · 행성 클릭
        <br />
        Drag to rotate · Scroll to zoom · Click a planet
      </p>
    </div>
  );
}
