"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { displayPosition, displayRadius, type PlanetData } from "@/lib/planets";
import { asset } from "@/lib/asset";
import AtmosphereGlow from "@/components/canvas/AtmosphereGlow";

const RING_TEXTURE = asset("/textures/2k_saturn_ring_alpha.png");

type Props = {
  data: PlanetData;
  simDateRef: RefObject<Date>;
  speed: number;
  selected: boolean;
  onSelect: (id: string) => void;
  register: (id: string, group: THREE.Group | null) => void;
};

function SaturnRing({ planetRadius }: { planetRadius: number }) {
  const texture = useTexture(RING_TEXTURE);
  const inner = planetRadius * 1.35;
  const outer = planetRadius * 2.35;

  // RingGeometry 기본 UV는 평면 투영이라 띠 텍스처가 방사형으로 안 감김 →
  // 반지름 방향을 U축으로 다시 매핑
  const geometry = useMemo(() => {
    const g = new THREE.RingGeometry(inner, outer, 96);
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, (v.length() - inner) / (outer - inner), 0.5);
    }
    return g;
  }, [inner, outer]);

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </mesh>
  );
}

export default function PlanetMesh({
  data,
  simDateRef,
  speed,
  selected,
  onSelect,
  register,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const texture = useTexture(data.texture);
  texture.colorSpace = THREE.SRGBColorSpace;

  const r = displayRadius(data.radiusKm);
  const tiltRad = THREE.MathUtils.degToRad(data.axialTiltDeg);
  const hitboxR = Math.max(r * 1.8, 0.65);

  useEffect(() => {
    register(data.id, groupRef.current);
    return () => register(data.id, null);
  }, [data.id, register]);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [hovered]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const [x, y, z] = displayPosition(data.body, simDateRef.current);
    group.position.set(x, y, z);

    // 자전: 시뮬레이션 배속에 비례하되 시각적으로 읽히는 속도로 클램프
    if (meshRef.current) {
      const rate = THREE.MathUtils.clamp(
        ((Math.PI * 2 * speed * 24) / data.rotationPeriodHours) * 0.1,
        -1.2,
        1.2,
      );
      meshRef.current.rotation.y += rate * delta;
    }
  });

  return (
    <group ref={groupRef}>
      <group rotation={[0, 0, tiltRad]}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[r, 48, 48]} />
          <meshStandardMaterial map={texture} roughness={1} metalness={0} />
        </mesh>
        {data.hasRing && <SaturnRing planetRadius={r} />}
        <AtmosphereGlow radius={r * 1.06} color={data.color} intensity={0.9} />
      </group>

      {/* 작은 행성도 클릭하기 쉽게 투명 히트박스 */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(data.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[hitboxR, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <Html
        center
        position={[0, r + 0.7, 0]}
        distanceFactor={70}
        zIndexRange={[40, 0]}
        wrapperClass="select-none"
      >
        <button
          type="button"
          aria-label={`${data.nameKo} 정보 보기`}
          onClick={(e) => {
            // 캔버스 래퍼까지 버블되면 r3f onPointerMissed가 선택을 되돌림
            e.stopPropagation();
            onSelect(data.id);
          }}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          className="type-eyebrow cursor-pointer whitespace-nowrap px-2 py-1 transition-opacity duration-300"
          style={{
            // 선택 중엔 카메라가 코앞이라 라벨이 화면을 덮음 → 숨김
            opacity: selected ? 0 : hovered ? 1 : 0.55,
            pointerEvents: selected ? "none" : "auto",
          }}
        >
          {data.nameEn}
        </button>
      </Html>
    </group>
  );
}
