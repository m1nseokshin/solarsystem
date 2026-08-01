"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vPositionW = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 표면 림: 지평선 부근의 밝은 대기 띠 (얇고 선명)
const rimFragment = /* glsl */ `
  uniform vec3 sunDirection;
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float facingMix;
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vec3 normal = normalize(vNormalW);
    vec3 viewDir = normalize(cameraPosition - vPositionW);

    float rim = pow(1.0 - abs(dot(viewDir, normal)), 2.4);
    float sunFacing = mix(
      1.0,
      clamp(dot(normal, sunDirection) * 1.4 + 0.65, 0.15, 1.1),
      facingMix
    );
    vec3 glow = glowColor * rim * sunFacing * intensity * 0.5;

    gl_FragColor = vec4(glow, min(rim * sunFacing * intensity * 0.5, 1.0));
  }
`;

// 외곽 헤일로(BackSide 큰 구): 행성 가장자리에서 가장 밝고
// 바깥으로 갈수록 부드럽게 사라지는 넓은 그레디언트
const haloFragment = /* glsl */ `
  uniform vec3 sunDirection;
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float facingMix;
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vec3 normal = normalize(vNormalW);
    vec3 viewDir = normalize(cameraPosition - vPositionW);

    // BackSide: 행성 실루엣 안쪽일수록 |dot|이 커짐 → 안쪽 밝고 바깥으로
    // 갈수록 부드럽게 풀리는 프로파일
    float density = pow(abs(dot(viewDir, normal)), 1.5);
    float sunFacing = mix(
      1.0,
      clamp(dot(normal, sunDirection) * 1.2 + 0.7, 0.2, 1.1),
      facingMix
    );
    vec3 glow = glowColor * density * sunFacing * intensity;

    gl_FragColor = vec4(glow, min(density * sunFacing * intensity, 1.0));
  }
`;

type Props = {
  radius: number;
  color: string;
  /** 0~1.5 권장, 기본 0.9 (은은함) */
  intensity?: number;
  /** 헤일로가 행성 반지름의 몇 배까지 퍼질지, 기본 1.15 */
  spread?: number;
  /** 태양 방향 명암 반영 정도 (0 = 균일 발광, 태양 자체용), 기본 1 */
  facing?: number;
};

/**
 * 행성 대기 발광: 표면의 밝은 림 + 바깥으로 넓게 퍼지는 헤일로 그레디언트.
 * 태양이 원점에 있다고 가정하고 매 프레임 월드 위치로부터 태양 방향을 갱신.
 */
export default function AtmosphereGlow({
  radius,
  color,
  intensity = 0.9,
  spread = 1.25,
  facing = 1,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);

  const sunDirection = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  const rimUniforms = useMemo(
    () => ({
      sunDirection: { value: sunDirection },
      glowColor: { value: new THREE.Color(color) },
      intensity: { value: intensity },
      facingMix: { value: facing },
    }),
    [sunDirection, color, intensity, facing],
  );

  const haloUniforms = useMemo(
    () => ({
      sunDirection: { value: sunDirection },
      glowColor: { value: new THREE.Color(color) },
      intensity: { value: intensity },
      facingMix: { value: facing },
    }),
    [sunDirection, color, intensity, facing],
  );

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    group.getWorldPosition(worldPos);
    if (worldPos.lengthSq() > 0.0001) {
      sunDirection.copy(worldPos).negate().normalize();
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius * 1.02, 64, 64]} />
        <shaderMaterial
          vertexShader={vertex}
          fragmentShader={rimFragment}
          uniforms={rimUniforms}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * spread, 64, 64]} />
        <shaderMaterial
          vertexShader={vertex}
          fragmentShader={haloFragment}
          uniforms={haloUniforms}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
