/* eslint-disable react/no-unknown-property */
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import starsBg from '@/assets/stars-bg.jpg';

function FitToView({
  object,
  onComputed,
}: {
  object: THREE.Object3D;
  onComputed?: (center: THREE.Vector3, radius: number, homePos: THREE.Vector3) => void;
}) {
  const { camera, size } = useThree();
  const fit = useCallback(() => {
    const box = new THREE.Box3().setFromObject(object);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const center = sphere.center.clone();
    const radius = sphere.radius;
    // Distance to fully frame the bounding sphere
    const cam = camera as THREE.PerspectiveCamera;
    const fov = (cam.isPerspectiveCamera ? cam.fov : 50) * (Math.PI / 180);
    const dist = radius / Math.sin(fov / 2);
    const dir = new THREE.Vector3(0, 0, 1); // look from +Z
    const homePos = center.clone().add(dir.multiplyScalar(dist * 1.2));
    cam.position.copy(homePos);
    cam.near = Math.max(0.01, dist / 100);
    cam.far = dist * 100;
    cam.updateProjectionMatrix();
    onComputed?.(center, radius, homePos);
  }, [camera, object, onComputed]);

  useEffect(() => { fit(); }, [fit, size.width, size.height]);
  return null;
}

function Model({ url, onBounds }: { url: string; onBounds?: (center: THREE.Vector3, radius: number, homePos: THREE.Vector3) => void }) {
  const gltf = useGLTF(url);
  return (
    <>
      <primitive object={gltf.scene} />
      <FitToView object={gltf.scene} onComputed={onBounds} />
    </>
  );
}

type Site = { name: string; lat: number; lon: number; desc: string };

function latLonToVector3(lat: number, lon: number, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export default function MarsLocalGlobe({ url, sites }: { url: string; sites?: Site[] }) {
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [boundsCenter, setBoundsCenter] = useState<THREE.Vector3 | null>(null);
  const [boundsRadius, setBoundsRadius] = useState<number | null>(null);
  const [homePos, setHomePos] = useState<THREE.Vector3 | null>(null);
  const lastBoundsRef = useRef<{ radius: number; center: THREE.Vector3 } | null>(null);
  const animRef = useRef<number | null>(null);
  const onReset = () => {
    const ctrl = controlsRef.current;
    if (ctrl && homePos && boundsCenter) {
      ctrl.object.position.copy(homePos);
      ctrl.target.copy(boundsCenter);
      ctrl.update();
    } else {
      controlsRef.current?.reset();
    }
  };
  const onZoomIn = () => {
    const ctrl = controlsRef.current;
    if (ctrl) {
      ctrl.dollyIn(1.2);
      ctrl.update();
    }
  };
  // When bounds are computed or controls mount, align controls target and camera position to "home"


  // Simple tween helper for smooth camera moves
  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const animateTo = useCallback((toCam: THREE.Vector3, toTarget: THREE.Vector3, duration = 1400) => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const fromCam = ctrl.object.position.clone();
    const fromTarget = ctrl.target.clone();
    const start = performance.now();
    const step = () => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / duration);
      const k = easeInOutCubic(t);
      ctrl.object.position.set(
        fromCam.x + (toCam.x - fromCam.x) * k,
        fromCam.y + (toCam.y - fromCam.y) * k,
        fromCam.z + (toCam.z - fromCam.z) * k,
      );
      ctrl.target.set(
        fromTarget.x + (toTarget.x - fromTarget.x) * k,
        fromTarget.y + (toTarget.y - fromTarget.y) * k,
        fromTarget.z + (toTarget.z - fromTarget.z) * k,
      );
      ctrl.update();
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        animRef.current = null;
      }
    };
    animRef.current = requestAnimationFrame(step);
  }, []);
  const onZoomOut = () => {
    const ctrl = controlsRef.current;
    if (ctrl) {
      ctrl.dollyOut(1.08);
      ctrl.update();
    }
  };

  return (
    <div
      className="w-full h-[500px] rounded-xl overflow-hidden border border-white/10 relative"
      style={{
        backgroundImage: `url(${starsBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true }}
        style={{ background: 'transparent' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <group>
            <Model
              url={url}
              onBounds={useCallback((c: THREE.Vector3, r: number, home: THREE.Vector3) => {
                const last = lastBoundsRef.current;
                if (last && Math.abs(last.radius - r) < 1e-6 && last.center.distanceTo(c) < 1e-6) {
                  return;
                }
                lastBoundsRef.current = { radius: r, center: c.clone() };
                setBoundsCenter(c);
                setBoundsRadius(r);
                setHomePos(home);
              }, [])}
            />
            <Environment preset="night" />
            {/* Marcadores simples sobre un radio ~1 del globo */}
            {boundsRadius && boundsCenter && sites?.map((s, i) => {
              const p = latLonToVector3(s.lat, s.lon, boundsRadius * 0.58).add(boundsCenter as THREE.Vector3);
              const mSize = Math.max(0.006, boundsRadius * 0.006);
              return (
                <mesh key={i} position={p.toArray()}>
                  <sphereGeometry args={[mSize, 16, 16]} />
                  <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.6} />
                </mesh>
              );
            })}
          </group>
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableRotate
          enablePan
          enableZoom
          enableDamping
          dampingFactor={0.8}
          rotateSpeed={0.9}
          zoomSpeed={0.5}
          panSpeed={0.6}
          zoomToCursor
          screenSpacePanning
          autoRotate={autoRotate}
          autoRotateSpeed={0.1}
          // prevenir entrar "dentro" del globo en función del tamaño real del modelo
          minDistance={boundsRadius ? boundsRadius * 0.5 : 0.8}
          maxDistance={boundsRadius ? boundsRadius * 15 : 9}
        />
      </Canvas>

      {/* Controles simples al estilo Cesium */}
      <div className="absolute top-2 right-2 flex gap-2 text-xs">
        <button className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded" onClick={onReset}>Home</button>
        <button className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded" onClick={onZoomIn}>+</button>
        <button className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded" onClick={onZoomOut}>-</button>
        <button className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded" onClick={() => setAutoRotate(a => !a)}>
          {autoRotate ? 'Pausar' : 'Rotar'}
        </button>
      </div>
      {/* Lista de sitios para acercar sin entrar dentro */}
      {boundsRadius && sites && sites.length > 0 && (
        <div className="absolute left-2 top-2 bg-black/50 p-2 rounded max-h-[90%] overflow-auto text-xs space-y-1 w-64 pointer-events-auto">
          {sites.map((s, i) => {
            const center = boundsCenter as THREE.Vector3;
            const radius = boundsRadius as number;
            const surface = latLonToVector3(s.lat, s.lon, radius * 1.005).add(center);
            const camNear = latLonToVector3(s.lat, s.lon, radius * 1.8).add(center);
            return (
              <div key={i} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium truncate" title={s.name}>{s.name}</div>
                  <div className="text-white/60 truncate" title={s.desc}>{s.desc}</div>
                </div>
                <div className="flex-shrink-0 flex gap-1">
                  <button
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
                    title="Acercar"
                    onClick={() => animateTo(camNear, center)}
                  >
                    Acercar
                  </button>
                  <button
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded"
                    title="Recentrar en sitio"
                    onClick={() => animateTo(camNear, surface)}
                  >
                    Recentrar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Allow GLTF loader to cache
useGLTF.preload('/assets/marte.glb');
useGLTF.preload('/models/marte.glb');
