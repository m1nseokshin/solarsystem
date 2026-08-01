"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { displayRadius, getPlanet } from "@/lib/planets";

export const OVERVIEW_POS = new THREE.Vector3(0, 26, 48);
const OVERVIEW_TARGET = new THREE.Vector3(0, 0, 0);
const FLY_DURATION = 1.6;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

type Props = {
  selectedId: string | null;
  groupsRef: RefObject<Map<string, THREE.Group>>;
};

/**
 * 행성이 계속 공전 중이라 목적지가 움직임 → gsap 고정 트윈 대신
 * 매 프레임 살아있는 목적지를 다시 계산하며 보간하는 수동 카메라 애니메이션.
 * 도착 후에는 행성 이동량만큼 카메라를 같이 밀어 시점을 유지(delta-follow).
 */
const INTRO_DURATION = 5;

export default function CameraRig({ selectedId, groupsRef }: Props) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  const anim = useRef<{
    t: number;
    fromPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
  } | null>(null);
  const prevPlanetPos = useRef(new THREE.Vector3());

  // 진입 인트로: 탑뷰에서 시스템을 한 바퀴 돌며 오버뷰 위치로 하강
  const intro = useRef<{ t: number } | null>(null);
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    intro.current = reduced ? null : { t: 0 };
  }, []);

  useEffect(() => {
    if (!controls) return;
    // 마운트 직후(선택 없음)엔 인트로가 우선
    if (intro.current && !selectedId) return;
    intro.current = null;
    anim.current = {
      t: 0,
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
    };
  }, [selectedId, camera, controls]);

  useFrame((_, delta) => {
    if (!controls) return;

    if (intro.current) {
      intro.current.t = Math.min(
        1,
        intro.current.t + delta / INTRO_DURATION,
      );
      const e = easeInOutCubic(intro.current.t);
      const azimuth = Math.PI * 2 * (1 - e); // 한 바퀴 → 정면(z+)에서 종료
      const radius = THREE.MathUtils.lerp(4, OVERVIEW_POS.z, e);
      const height = THREE.MathUtils.lerp(85, OVERVIEW_POS.y, e);
      camera.position.set(
        radius * Math.sin(azimuth),
        height,
        radius * Math.cos(azimuth),
      );
      controls.target.set(0, 0, 0);
      controls.enabled = false;
      if (intro.current.t >= 1) {
        intro.current = null;
        controls.enabled = true;
      }
      controls.update();
      return;
    }

    // 살아있는 목적지 계산
    let desiredPos = OVERVIEW_POS;
    let desiredTarget = OVERVIEW_TARGET;
    const group = selectedId ? groupsRef.current?.get(selectedId) : undefined;
    if (selectedId && group) {
      const planet = getPlanet(selectedId)!;
      const p = group.position;
      const dist = Math.max(displayRadius(planet.radiusKm) * 5.5, 2.4);
      // 태양 쪽(궤도 안쪽)에서 바라봐야 행성의 낮면이 보임
      const dir =
        p.lengthSq() > 0
          ? p.clone().normalize()
          : new THREE.Vector3(1, 0, 0);
      desiredPos = p
        .clone()
        .sub(dir.multiplyScalar(dist))
        .add(new THREE.Vector3(0, dist * 0.35, 0));
      desiredTarget = p.clone();
    }

    if (anim.current) {
      anim.current.t = Math.min(1, anim.current.t + delta / FLY_DURATION);
      const k = easeInOutCubic(anim.current.t);
      camera.position.lerpVectors(anim.current.fromPos, desiredPos, k);
      controls.target.lerpVectors(anim.current.fromTarget, desiredTarget, k);
      controls.enabled = false;
      if (group) prevPlanetPos.current.copy(group.position);
      if (anim.current.t >= 1) {
        anim.current = null;
        controls.enabled = true;
      }
    } else if (selectedId && group) {
      const moved = group.position.clone().sub(prevPlanetPos.current);
      camera.position.add(moved);
      controls.target.copy(group.position);
      prevPlanetPos.current.copy(group.position);
    }

    controls.update();
  });

  return null;
}
