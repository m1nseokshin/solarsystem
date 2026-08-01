"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { HALLEY_COMET, halleyPosition } from "@/lib/planets";
import { asset } from "@/lib/asset";
import AtmosphereGlow from "@/components/canvas/AtmosphereGlow";

type Props = {
  simDateRef: RefObject<Date>;
  speed: number;
  selected: boolean;
  onSelect: (id: string) => void;
  register: (id: string, group: THREE.Group | null) => void;
};

export default function CometMesh({
  simDateRef,
  selected,
  onSelect,
  register,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Group>(null);
  const tailGroupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // ESA / NASA 로제타 탐사선 관측 데이터를 기반으로 렌더링된 실제 혜성 3D GLTF 모델
  const { scene } = useGLTF(asset("/models/comet_67p.glb"));

  const radius = 0.55;

  // 반원(Head) + 이등변 삼각형(Body) 통합 벡터 그래픽 글로우 텍스처 (Canvas 2D Vector Texture)
  const tailTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, 512, 1024);

      const centerX = 256;

      // 1. 부드러운 가우시안 래디얼 글로우 (본체 코마 대기 글로우 #70c3ff 색상과 1:1 완벽 일치)
      const coreGrad = ctx.createRadialGradient(centerX, 100, 0, centerX, 100, 260);
      coreGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      coreGrad.addColorStop(0.2, "rgba(112, 195, 255, 0.85)");
      coreGrad.addColorStop(0.5, "rgba(60, 160, 240, 0.4)");
      coreGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

      // 2. 꼬리 방향 리니어 그라데이션 (#70c3ff 계열 동질 색상 사용)
      const tailGrad = ctx.createLinearGradient(centerX, 0, centerX, 1024);
      tailGrad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
      tailGrad.addColorStop(0.1, "rgba(112, 195, 255, 0.65)");
      tailGrad.addColorStop(0.4, "rgba(60, 150, 235, 0.3)");
      tailGrad.addColorStop(0.75, "rgba(25, 100, 190, 0.08)");
      tailGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

      // 3. 캔버스 전체에 부드러운 유체 그라데이션 적용
      ctx.fillStyle = tailGrad;
      ctx.fillRect(0, 0, 512, 1024);

      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, 512, 1024);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame((_, delta) => {
    const d = simDateRef.current;
    const [x, y, z] = halleyPosition(d);

    if (groupRef.current) {
      groupRef.current.position.set(x, y, z);
    }
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y += delta * 0.25;
      nucleusRef.current.rotation.x += delta * 0.1;
    }

    // 꼬리 평면을 항상 태양 반대편(0,0,0)을 향하도록 정렬
    if (tailGroupRef.current) {
      const pos = new THREE.Vector3(x, y, z);
      const sunDir = pos.clone().normalize(); // 태양(0,0,0) -> 혜성(x,y,z) 방향 벡터
      const targetQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, -1, 0), // Y축 아래 방향이 꼬리가 뻗어나갈 기본 축
        sunDir,
      );
      tailGroupRef.current.quaternion.slerp(targetQuat, 0.2);
    }
  });

  const texture = useTexture(asset("/textures/2k_comet.jpg"));
  texture.colorSpace = THREE.SRGBColorSpace;

  // 3D 메시 복제본에 실제 고해상도 암석 표면 텍스처 맵핑
  const clonedScene = useMemo(() => {
    const s = scene.clone();
    s.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        m.material = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.92,
          metalness: 0.08,
        });
      }
    });
    return s;
  }, [scene, texture]);

  return (
    <group
      ref={(g) => {
        groupRef.current = g;
        register("halley", g);
      }}
    >
      {/* 고해상도 2K 텍스처가 입혀진 실제 ESA/NASA 3D 암석 핵 */}
      <group
        ref={nucleusRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect("halley");
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
        scale={[0.00028, 0.00028, 0.00028]}
      >
        <primitive object={clonedScene} />
      </group>

      {/* 혜성 본체 은은한 푸른빛 대기 글로우 구체 (Atmosphere Glow) */}
      <AtmosphereGlow radius={radius * 1.1} color="#70c3ff" intensity={1.1} spread={1.5} />

      {/* 3D 혜성 꼬리 메쉬 (좁은 상단 0.2가 암석 핵 0,0,0에 밀착) */}
      {tailTexture && (
        <group ref={tailGroupRef}>
          <mesh position={[0, -12, 0]}>
            <cylinderGeometry args={[0.2, 2.8, 24, 64, 1, true]} />
            <meshBasicMaterial
              map={tailTexture}
              side={THREE.DoubleSide}
              transparent
              opacity={0.65}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      )}

      {/* 3D 라벨 */}
      <Html
        center
        position={[0, radius + 1.0, 0]}
        distanceFactor={70}
        zIndexRange={[40, 0]}
        wrapperClass="select-none"
      >
        <button
          type="button"
          aria-label="핼리 혜성 정보 보기"
          onClick={(e) => {
            e.stopPropagation();
            onSelect("halley");
          }}
          className="type-eyebrow cursor-pointer whitespace-nowrap px-2 py-1 transition-opacity duration-300"
          style={{
            opacity: selected ? 0 : 0.75,
            pointerEvents: selected ? "none" : "auto",
            color: "#70c3ff",
          }}
        >
          Halley&apos;s Comet
        </button>
      </Html>
    </group>
  );
}

useGLTF.preload(asset("/models/comet_67p.glb"));
