"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";
import { asset } from "@/lib/asset";
import AtmosphereGlow from "@/components/canvas/AtmosphereGlow";
import { PLANETS, displayRadius } from "@/lib/planets";

const ORBIT_R = 12;
const EARTH_R = 0.9;
const SUN_R = 2.6;
const THETA_START = 0.2;
const THETA_SWEEP = Math.PI * 1.5;

// 카메라 경유지: 지구 클로즈업 → 지구 포커스 → 태양 확대 → 전체 태양계
const SUN_VIEW = new THREE.Vector3(0, 0.3, 5.6);
// 태양 페이즈: 시선을 옆(+X)으로 돌려 좌측면이 화면을 채우는 세로 크롭
const SUN_LOOK = new THREE.Vector3(4.2, 0, 0);
const OVERVIEW = new THREE.Vector3(0, 34, 60);

/** 홈은 연출용 — 궤도 반지름만 explore와 같은 압축 비율 사용 */
const orbitRadius = (au: number) => ORBIT_R * Math.pow(au, 0.45);

const OTHER_PLANETS = PLANETS.filter((p) => p.id !== "earth").map((p, i) => ({
  id: p.id,
  texture: p.texture,
  radius: 1.3 * displayRadius(p.radiusKm),
  orbitR: orbitRadius(p.semiMajorAxisAu),
  // 보기 좋게 흩어둔 고정 시작각 (연출용, 실위치 아님)
  baseAngle: [2.4, 4.9, 0.9, 3.6, 5.6, 1.7, 2.9][i],
  speed: 0.22 / Math.pow(p.semiMajorAxisAu, 0.7),
  appearAt: 0.64 + i * 0.038,
}));

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function earthPosition(p: number, out: THREE.Vector3) {
  const theta = THETA_START + THETA_SWEEP * p;
  return out.set(ORBIT_R * Math.cos(theta), 0, ORBIT_R * Math.sin(theta));
}

function circlePoints(radius: number): [number, number, number][] {
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= 128; i++) {
    const a = (Math.PI * 2 * i) / 128;
    pts.push([radius * Math.cos(a), 0, radius * Math.sin(a)]);
  }
  return pts;
}

type ProgressProp = { progressRef: RefObject<number> };

/** 태양 설명 이후 하나씩 나타나는 나머지 행성 */
function MinorPlanet({
  def,
  progressRef,
}: ProgressProp & { def: (typeof OTHER_PLANETS)[number] }) {
  const texture = useTexture(def.texture);
  texture.colorSpace = THREE.SRGBColorSpace;
  const groupRef = useRef<THREE.Group>(null);
  const lineRef = useRef<Line2>(null);
  const points = useMemo(() => circlePoints(def.orbitR), [def.orbitR]);

  useFrame(({ clock }) => {
    const p = THREE.MathUtils.clamp(progressRef.current ?? 0, 0, 1);
    const k = smoothstep(def.appearAt, def.appearAt + 0.06, p);
    const a = def.baseAngle + clock.elapsedTime * def.speed;
    const group = groupRef.current;
    if (group) {
      group.position.set(
        def.orbitR * Math.cos(a),
        0,
        def.orbitR * Math.sin(a),
      );
      group.scale.setScalar(Math.max(k, 0.0001));
    }
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.Material & {
        opacity: number;
      };
      mat.opacity = 0.2 * k;
    }
  });

  return (
    <>
      <Line
        ref={lineRef}
        points={points}
        color="#ffffff"
        transparent
        opacity={0}
        lineWidth={1}
      />
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[def.radius, 48, 48]} />
          <meshStandardMaterial map={texture} roughness={1} metalness={0} />
        </mesh>
      </group>
    </>
  );
}

export default function HomeScene({ progressRef }: ProgressProp) {
  const [dayMap, cloudsMap, sunMap] = useTexture([
    asset("/textures/2k_earth_daymap.jpg"),
    asset("/textures/2k_earth_clouds.jpg"),
    asset("/textures/2k_sun.jpg"),
  ]);
  dayMap.colorSpace = THREE.SRGBColorSpace;
  sunMap.colorSpace = THREE.SRGBColorSpace;
  dayMap.anisotropy = 8;

  const earthRef = useRef<THREE.Group>(null);
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const sunRef = useRef<THREE.Mesh>(null);
  const earthLineRef = useRef<Line2>(null);

  const earthOrbitPoints = useMemo(() => circlePoints(ORBIT_R), []);

  const scratch = useMemo(
    () => ({
      earthPos: new THREE.Vector3(),
      closePos: new THREE.Vector3(),
      camPos: new THREE.Vector3(),
      lookAt: new THREE.Vector3(),
      lookStart: new THREE.Vector3(),
      radialIn: new THREE.Vector3(),
      tmp: new THREE.Vector3(),
      origin: new THREE.Vector3(0, 0, 0),
    }),
    [],
  );

  useFrame(({ camera }, delta) => {
    const p = THREE.MathUtils.clamp(progressRef.current ?? 0, 0, 1);
    const { earthPos, closePos, camPos, lookAt, lookStart, radialIn, tmp, origin } =
      scratch;

    earthPosition(p, earthPos);
    if (earthRef.current) earthRef.current.position.copy(earthPos);

    // 클로즈업: 궤도 안쪽에서 지구 낮면, 시선은 위로 올려 상단 아크만
    radialIn.copy(earthPos).normalize().multiplyScalar(-2.6);
    closePos.copy(earthPos).add(radialIn).add(new THREE.Vector3(0, 0.5, 0));
    lookStart.copy(earthPos).add(new THREE.Vector3(0, 1.5, 0));

    // 지구 설명 뷰: 태양을 등지고 물러나 지구에 포커스 (지구 낮면이 프레임 중심)
    tmp.copy(earthPos).multiplyScalar(1 - 4.5 / ORBIT_R).setY(1.2);

    // 구간: 지구(A) → 태양 확대(B) → 전체 뷰(C)
    const sA = smoothstep(0.14, 0.34, p);
    const sB = smoothstep(0.4, 0.58, p);
    const sC = smoothstep(0.66, 0.9, p);

    camPos.copy(closePos).lerp(tmp, sA);
    camPos.lerp(SUN_VIEW, sB);
    camPos.lerp(OVERVIEW, sC);

    lookAt.copy(lookStart).lerp(earthPos, sA);
    lookAt.lerp(SUN_LOOK, sB);
    lookAt.lerp(origin, sC);
    camera.position.copy(camPos);
    camera.lookAt(lookAt);

    if (earthMeshRef.current) earthMeshRef.current.rotation.y += delta * 0.12;
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.16;
    if (sunRef.current) sunRef.current.rotation.y += delta * 0.02;

    if (earthLineRef.current) {
      const mat = earthLineRef.current.material as THREE.Material & {
        opacity: number;
      };
      mat.opacity = 0.25 * smoothstep(0.18, 0.34, p);
    }

  });

  return (
    <>
      <ambientLight intensity={0.18} />
      <pointLight position={[0, 0, 0]} intensity={2.6} decay={0} />
      <Stars
        radius={300}
        depth={60}
        count={5000}
        factor={5}
        saturation={0}
        fade
        speed={0.3}
      />

      <group>
        <mesh ref={sunRef}>
          <sphereGeometry args={[SUN_R, 64, 64]} />
          <meshBasicMaterial map={sunMap} />
        </mesh>
        {/* 코로나: 태양 전방위 열감 발광 */}
        <AtmosphereGlow
          radius={SUN_R}
          color="#ffb347"
          intensity={1.4}
          spread={1.45}
          facing={0}
        />
      </group>

      <Line
        ref={earthLineRef}
        points={earthOrbitPoints}
        color="#ffffff"
        transparent
        opacity={0}
        lineWidth={1}
      />

      {OTHER_PLANETS.map((def) => (
        <MinorPlanet key={def.id} def={def} progressRef={progressRef} />
      ))}

      <group ref={earthRef}>
        <mesh
          ref={earthMeshRef}
          rotation={[0, 0, THREE.MathUtils.degToRad(23.44)]}
        >
          <sphereGeometry args={[EARTH_R, 96, 96]} />
          <meshStandardMaterial
            map={dayMap}
            roughness={0.9}
            metalness={0}
            emissiveMap={dayMap}
            emissive="#ffffff"
            emissiveIntensity={0.22}
          />
        </mesh>
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[EARTH_R * 1.015, 96, 96]} />
          <meshLambertMaterial
            map={cloudsMap}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
            opacity={0.5}
          />
        </mesh>
        <AtmosphereGlow
          radius={EARTH_R}
          color="#8fd3ff"
          intensity={1.6}
          spread={1.35}
        />
      </group>
    </>
  );
}
