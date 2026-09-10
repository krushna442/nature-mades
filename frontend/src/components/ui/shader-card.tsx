'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { cn } from '../../lib/utils';

export interface ShaderCardProps {
  children?: React.ReactNode;
  className?: string;
  width?: number | string;
  height?: number | string;
  borderRadius?: string;
  speed?: number;
  color?: string;
  positionY?: number;
  scale?: number;
  effectRadius?: number;
  effectBoost?: number;
  edgeMin?: number;
  edgeMax?: number;
  falloffPower?: number;
  noiseScale?: number;
  widthFactor?: number;
  waveAmount?: number;
  branchIntensity?: number;
  verticalExtent?: number;
  horizontalExtent?: number;
  blur?: number;
  opacity?: number;
  autoPlay?: boolean;
  fragmentShader?: string;
}

const DEFAULT_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const DEFAULT_FRAGMENT_SHADER = "uniform float iTime;\n      uniform vec3 iResolution;\n      uniform vec3 uColor;\n      uniform float uPositionY;\n      uniform float uScale;\n      uniform float uEffectRadius;\n      uniform float uEffectBoost;\n      uniform float uEdgeMin;\n      uniform float uEdgeMax;\n      uniform float uFalloffPower;\n      uniform float uNoiseScale;\n      uniform float uWidthFactor;\n      uniform float uWaveAmount;\n      uniform float uBranchIntensity;\n      uniform float uVerticalExtent;\n      uniform float uHorizontalExtent;\n\n      vec3 random3(vec3 c) {\n        float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));\n        vec3 r;\n        r.z = fract(512.0*j);\n        j *= .125;\n        r.x = fract(512.0*j);\n        j *= .125;\n        r.y = fract(512.0*j);\n        return r-0.5;\n      }\n\n      const float F3 =  0.3333333;\n      const float G3 =  0.1666667;\n\n      float simplex3d(vec3 p) {\n        vec3 s = floor(p + dot(p, vec3(F3)));\n        vec3 x = p - s + dot(s, vec3(G3));\n\n        vec3 e = step(vec3(0.0), x - x.yzx);\n        vec3 i1 = e*(1.0 - e.zxy);\n        vec3 i2 = 1.0 - e.zxy*(1.0 - e);\n\n        vec3 x1 = x - i1 + G3;\n        vec3 x2 = x - i2 + 2.0*G3;\n        vec3 x3 = x - 1.0 + 3.0*G3;\n\n        vec4 w, d;\n\n        w.x = dot(x, x);\n        w.y = dot(x1, x1);\n        w.z = dot(x2, x2);\n        w.w = dot(x3, x3);\n\n        w = max(0.6 - w, 0.0);\n\n        d.x = dot(random3(s), x);\n        d.y = dot(random3(s + i1), x1);\n        d.z = dot(random3(s + i2), x2);\n        d.w = dot(random3(s + 1.0), x3);\n\n        w *= w;\n        w *= w;\n        d *= w;\n\n        return dot(d, vec4(52.0));\n      }\n\n      const mat3 rot1 = mat3(-0.37, 0.36, 0.85,-0.14,-0.93, 0.34,0.92, 0.01,0.4);\n      const mat3 rot2 = mat3(-0.55,-0.39, 0.74, 0.33,-0.91,-0.24,0.77, 0.12,0.63);\n      const mat3 rot3 = mat3(-0.71, 0.52,-0.47,-0.08,-0.72,-0.68,-0.7,-0.45,0.56);\n\n      float simplex3d_fractal(vec3 m) {\n        return   0.5333333*simplex3d(m*rot1)\n          +0.2666667*simplex3d(2.0*m*rot2)\n          +0.1333333*simplex3d(4.0*m*rot3)\n          +0.0666667*simplex3d(8.0*m);\n      }\n\n      #define NIGHTSPEEDBONUS 1.25\n      #define SHAPE 0\n      #define BREATHWILDNESS 1\n      #define PI 3.14159265359\n\n      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {\n        float time = 28.22+NIGHTSPEEDBONUS*iTime;\n        float bignessScale = 1.0/uNoiseScale;\n\n        vec2 uv = (fragCoord.xy / iResolution.xy) * 2.0 - 1.0;\n        float aspect = iResolution.x / iResolution.y;\n        uv.x *= aspect;\n\n        float effectiveScale = max(uScale, 0.5);\n        uv = uv / effectiveScale;\n\n        float yOffset = mix(-0.3, 0.8, uPositionY);\n        uv.y -= yOffset;\n\n        uv.y *= uVerticalExtent;\n        uv.x *= uHorizontalExtent;\n\n        vec2 p = (uv / aspect + 1.0) * 0.5 * iResolution.y / iResolution.y;\n        p.x *= aspect;\n\n        vec2 positionFromCenter = uv;\n        positionFromCenter/=uEffectRadius;\n        positionFromCenter.x /= uWidthFactor;\n        float positionFromBottom = 0.5*(positionFromCenter.y+1.0);\n\n        vec2 waveOffset = vec2(0.);\n        waveOffset.x += positionFromBottom*sin(4.0*positionFromCenter.y-4.0*time);\n        waveOffset.x += 0.1*positionFromBottom*sin(4.0*positionFromCenter.x-1.561*time);\n\n        waveOffset.x += uBranchIntensity * 0.15 * sin(8.0*positionFromCenter.y + time * 2.0);\n        waveOffset.x += uBranchIntensity * 0.1 * sin(12.0*positionFromCenter.y - time * 1.5);\n        waveOffset.y += uBranchIntensity * 0.08 * sin(6.0*positionFromCenter.x + time * 1.8);\n\n        positionFromCenter += uWaveAmount*waveOffset;\n\n        float outerMask = length(positionFromCenter);\n        if(SHAPE == 0) {\n          positionFromCenter.x += positionFromCenter.x / (1.0-(positionFromCenter.y));\n        }\n        else if(SHAPE == 1) {\n          positionFromCenter.x += positionFromCenter.x * positionFromBottom;\n        }\n        else if(SHAPE == 2) {\n          positionFromCenter.x += sign(positionFromCenter.x) * positionFromBottom;\n        }\n\n        float effectMask = clamp(1.0-length(positionFromCenter), 0.0, 1.0);\n        effectMask = 1.0-pow(1.0-effectMask, uFalloffPower);\n\n        vec3 p3 = bignessScale*0.25*vec3(p.x, p.y, 0.0) + vec3(0.0, -time*0.1, time*0.025);\n        float noise = simplex3d(p3*32.0);\n\n        noise += 0.3 * simplex3d(p3*64.0 + vec3(time*0.05, time*0.03, 0.0));\n        noise += 0.15 * simplex3d(p3*128.0 - vec3(time*0.08, 0.0, time*0.04));\n\n        noise = 0.5 + 0.5*noise;\n\n        vec3 finalColor;\n        float finalAlpha = 0.0;\n\n        float value = effectMask*noise;\n        value += uEffectBoost*effectMask;\n\n        if(BREATHWILDNESS == 1) {\n          float edge = mix(uEdgeMin, uEdgeMax, pow(0.5*(positionFromCenter.y+1.0), 1.2) );\n          float edgedValue = clamp(value-edge, 0.0 , 1.0);\n          float steppedValue = smoothstep(edge,edge+0.1, value);\n          float highlight = 1.0-edgedValue;\n          float repeatedValue = highlight;\n\n          p3 = bignessScale*0.1*vec3(p.x, p.y, 0.0) + vec3(0.0, -time*0.01, time*0.025);\n          noise = simplex3d(p3*32.0);\n          noise = 0.5 + 0.5*noise;\n          repeatedValue = mix(repeatedValue, noise, 0.65);\n\n          repeatedValue = 0.5*sin(6.0*PI*(1.0-pow(1.0-repeatedValue,1.8)) - 0.5*PI)+0.5;\n          float steppedLines = smoothstep(0.95, 1.0, pow(repeatedValue, 8.0));\n          steppedLines = mix(steppedLines, 0.0, 0.8-noise);\n          highlight = max(steppedLines, highlight);\n\n          highlight = pow(highlight, 2.0);\n\n          vec3 effectHighlightColor = mix(uColor * 0.8, uColor * 1.5, p.y);\n\n          float whiteFlash =  sin(time*3.0);\n          whiteFlash = pow(whiteFlash, 4.0);\n          effectHighlightColor += vec3(0.3,0.2,0.2) * whiteFlash;\n\n          vec3 effectBodyColor = mix(uColor * 0.7, uColor * 1.0, p.y);\n\n          finalColor = effectHighlightColor*(steppedValue*highlight);\n          finalColor += effectBodyColor*steppedValue;\n\n          float brightness = dot(finalColor, vec3(0.299, 0.587, 0.114));\n          float alphaBoost = smoothstep(0.0, 0.3, brightness);\n          finalAlpha = steppedValue * mix(0.4, 0.95, alphaBoost);\n        }\n\n        fragColor = vec4(finalColor, finalAlpha);\n      }\n\n      void main() {\n        vec4 color = vec4(0.0);\n        mainImage(color, gl_FragCoord.xy);\n        gl_FragColor = color;\n      }";

export function ShaderCard({
  children,
  className,
  width = 400,
  height = 500,
  borderRadius = '12px',
  speed = 1,
  color = '#FF9FFC',
  positionY = 0.1,
  scale = 3,
  effectRadius = 0.9,
  effectBoost = 0.5,
  edgeMin = 0,
  edgeMax = 0.5,
  falloffPower = 2,
  noiseScale = 1.5,
  widthFactor = 0.5,
  waveAmount = 0.5,
  branchIntensity = 0.5,
  verticalExtent = 1.5,
  horizontalExtent = 1.5,
  blur = 0,
  opacity = 1,
  autoPlay = true,
  fragmentShader = DEFAULT_FRAGMENT_SHADER,
}: ShaderCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;

    const threeColor = new THREE.Color(color);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3() },
      uColor: { value: new THREE.Vector3(threeColor.r, threeColor.g, threeColor.b) },
      uPositionY: { value: positionY },
      uScale: { value: scale },
      uEffectRadius: { value: effectRadius },
      uEffectBoost: { value: effectBoost },
      uEdgeMin: { value: edgeMin },
      uEdgeMax: { value: edgeMax },
      uFalloffPower: { value: falloffPower },
      uNoiseScale: { value: noiseScale },
      uWidthFactor: { value: widthFactor },
      uWaveAmount: { value: waveAmount },
      uBranchIntensity: { value: branchIntensity },
      uVerticalExtent: { value: verticalExtent },
      uHorizontalExtent: { value: horizontalExtent },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: DEFAULT_VERTEX_SHADER,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(rect.width, 1);
      const h = Math.max(rect.height, 1);
      renderer.setSize(w, h, false);
      uniforms.iResolution.value.set(w, h, 1);
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(container);
    }

    const animate = () => {
      if (autoPlay) {
        uniforms.iTime.value = clockRef.current.getElapsedTime() * speed;
      }
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [
    fragmentShader,
    speed,
    color,
    positionY,
    scale,
    effectRadius,
    effectBoost,
    edgeMin,
    edgeMax,
    falloffPower,
    noiseScale,
    widthFactor,
    waveAmount,
    branchIntensity,
    verticalExtent,
    horizontalExtent,
    autoPlay,
  ]);

  const styleWidth = typeof width === 'number' ? `${width}px` : width;
  const styleHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden flex flex-col justify-center items-center',
        className
      )}
      style={{
        width: styleWidth,
        height: styleHeight,
        borderRadius,
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
          opacity,
        }}
      />
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export default ShaderCard;
