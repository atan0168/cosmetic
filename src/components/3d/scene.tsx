import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Float,
  Environment,
  Box,
  Cylinder,
  Torus,
  Instances,
  Instance,
  AdaptiveDpr,
  AdaptiveEvents,
  useDetectGPU,
} from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';

function QualityGate({ children }: { children?: React.ReactNode }) {
  const { tier, isMobile } = useDetectGPU();
  const low = isMobile || tier <= 2;
  return (
    <>
      <EffectComposer multisampling={0} resolutionScale={low ? 0.6 : 0.8}>
        <Bloom intensity={low ? 0.2 : 0.3} luminanceThreshold={0.95} mipmapBlur />
        {!low ? <ChromaticAberration offset={[0.0004, 0.0005]} /> : <></>}
      </EffectComposer>

      {/* fewer instances on low tier */}
      <BeautyParticles count={low ? 8 : 15} />
      <Glitter count={low ? 12 : 25} />
      {children}
    </>
  );
}
function BeautyParticles({ count = 15 }) {
  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
      ] as [number, number, number],
      scale: 0.03 + Math.random() * 0.02,
      hue: Math.random() * 0.1 + 0.8,
    }));
  }, [count]);

  return (
    <Instances limit={count} range={count}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial metalness={0.6} roughness={0.25} />
      {data.map((p, i) => (
        <Instance
          key={i}
          position={p.position}
          scale={p.scale}
          // emissive & color once (no new THREE.Color() each render)
          color={`hsl(${p.hue * 360} 80% 70%)`}
        />
      ))}
    </Instances>
  );
}
function Glitter({ count = 25 }) {
  const data = useMemo(
    () =>
      new Array(count).fill(0).map(() => ({
        position: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 8,
        ] as [number, number, number],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [
          number,
          number,
          number,
        ],
      })),
    [count],
  );

  return (
    <Instances limit={count} range={count}>
      <boxGeometry args={[0.02, 0.02, 0.02]} />
      <meshStandardMaterial
        color="#ffd700"
        emissive="#ffd700"
        emissiveIntensity={0.5}
        metalness={1}
        roughness={0}
      />
      {data.map((g, i) => (
        <Instance key={i} position={g.position} rotation={g.rotation} />
      ))}
    </Instances>
  );
}

// Realistic Lipstick Component
function RealisticLipstick({
  position,
  color = '#ff6b9d',
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5} position={position}>
      <group>
        {/* Lipstick Case - Bottom */}
        <Cylinder args={[0.15, 0.15, 1.2]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#2c2c2c"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1}
          />
        </Cylinder>

        {/* Lipstick Case - Top */}
        <Cylinder args={[0.15, 0.15, 0.8]} position={[0, 1, 0]}>
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={1.2}
          />
        </Cylinder>

        {/* Lipstick Bullet */}
        <group position={[0, 1.5, 0]}>
          <Cylinder args={[0.12, 0.12, 0.4]} position={[0, 0, 0]}>
            <meshStandardMaterial
              color={color}
              metalness={0.1}
              roughness={0.3}
              emissive={color}
              emissiveIntensity={0.1}
            />
          </Cylinder>
          <Cylinder args={[0.12, 0.08, 0.2]} position={[0, 0.3, 0]}>
            <meshStandardMaterial
              color={color}
              metalness={0.1}
              roughness={0.3}
              emissive={color}
              emissiveIntensity={0.1}
            />
          </Cylinder>
        </group>

        {/* Brand Ring */}
        <Torus args={[0.16, 0.02]} position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#gold" metalness={1} roughness={0} />
        </Torus>
      </group>
    </Float>
  );
}

// Realistic Perfume Bottle
function RealisticPerfume({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.7} position={position}>
      <group>
        {/* Main Bottle Body */}
        <Box args={[0.8, 1.4, 0.4]} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color="#e8f4fd"
            transparent
            opacity={0.85}
            transmission={0.9}
            thickness={0.1}
            roughness={0.05}
            metalness={0}
            ior={1.5}
            envMapIntensity={1}
          />
        </Box>

        {/* Perfume Liquid */}
        <Box args={[0.75, 1.1, 0.35]} position={[0, -0.15, 0]}>
          <meshStandardMaterial
            color="#ffd700"
            transparent
            opacity={0.8}
            metalness={0.1}
            roughness={0.2}
            emissive="#ffd700"
            emissiveIntensity={0.1}
          />
        </Box>

        {/* Bottle Neck */}
        <Cylinder args={[0.15, 0.15, 0.6]} position={[0, 1.0, 0]}>
          <meshPhysicalMaterial
            color="#e8f4fd"
            transparent
            opacity={0.9}
            transmission={0.8}
            thickness={0.05}
            roughness={0.05}
            metalness={0}
            ior={1.5}
          />
        </Cylinder>

        {/* Cap */}
        <Cylinder args={[0.18, 0.18, 0.4]} position={[0, 1.5, 0]}>
          <meshStandardMaterial
            color="#2c2c2c"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1.2}
          />
        </Cylinder>

        {/* Spray Nozzle */}
        <Cylinder args={[0.05, 0.05, 0.15]} position={[0, 1.75, 0]}>
          <meshStandardMaterial color="#silver" metalness={1} roughness={0} />
        </Cylinder>
      </group>
    </Float>
  );
}

// Realistic Compact Mirror
function RealisticCompact({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6} position={position}>
      <group rotation={[0.2, 0.3, 0]}>
        {/* Bottom Case */}
        <Cylinder args={[0.8, 0.8, 0.15]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#ff69b4"
            metalness={0.8}
            roughness={0.2}
            envMapIntensity={1}
          />
        </Cylinder>

        {/* Top Case */}
        <Cylinder args={[0.8, 0.8, 0.15]} position={[0, 0.3, 0]} rotation={[0.3, 0, 0]}>
          <meshStandardMaterial
            color="#ff69b4"
            metalness={0.8}
            roughness={0.2}
            envMapIntensity={1}
          />
        </Cylinder>

        {/* Mirror */}
        <Cylinder args={[0.7, 0.7, 0.02]} position={[0, 0.35, 0.1]} rotation={[0.3, 0, 0]}>
          <meshStandardMaterial color="#ffffff" metalness={1} roughness={0} envMapIntensity={2} />
        </Cylinder>

        {/* Powder */}
        <Cylinder args={[0.7, 0.7, 0.05]} position={[0, 0.05, 0]}>
          <meshStandardMaterial color="#fdbcb4" metalness={0.1} roughness={0.8} />
        </Cylinder>

        {/* Decorative Pattern */}
        <Torus args={[0.6, 0.05]} position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial color="#gold" metalness={1} roughness={0} />
        </Torus>
      </group>
    </Float>
  );
}

// Realistic Nail Polish
function RealisticNailPolish({
  position,
  color = '#ff1744',
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.8} position={position}>
      <group>
        {/* Bottle Body */}
        <Cylinder args={[0.25, 0.25, 1]} position={[0, 0, 0]}>
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.9}
            transmission={0.8}
            thickness={0.1}
            roughness={0.05}
            metalness={0}
            ior={1.5}
          />
        </Cylinder>

        {/* Nail Polish Liquid */}
        <Cylinder args={[0.22, 0.22, 0.7]} position={[0, -0.1, 0]}>
          <meshStandardMaterial
            color={color}
            metalness={0.2}
            roughness={0.1}
            emissive={color}
            emissiveIntensity={0.05}
          />
        </Cylinder>

        {/* Cap */}
        <Cylinder args={[0.28, 0.28, 0.6]} position={[0, 0.8, 0]}>
          <meshStandardMaterial color="#2c2c2c" metalness={0.9} roughness={0.1} />
        </Cylinder>

        {/* Brush Handle */}
        <Cylinder args={[0.03, 0.03, 0.4]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#2c2c2c" metalness={0.8} roughness={0.2} />
        </Cylinder>
      </group>
    </Float>
  );
}

// Realistic Mascara
function RealisticMascara({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.4} position={position}>
      <group>
        {/* Tube Body */}
        <Cylinder args={[0.2, 0.2, 1.5]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#000000" metalness={0.7} roughness={0.3} />
        </Cylinder>

        {/* Cap */}
        <Cylinder args={[0.22, 0.22, 0.8]} position={[0, 1.15, 0]}>
          <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.2} />
        </Cylinder>

        {/* Brand Label */}
        <Cylinder args={[0.21, 0.21, 0.3]} position={[0, 0.2, 0]}>
          <meshStandardMaterial color="#ff69b4" metalness={0.1} roughness={0.8} />
        </Cylinder>

        {/* Wand */}
        <Cylinder args={[0.02, 0.02, 0.6]} position={[0, 0.3, 0]}>
          <meshStandardMaterial color="#2c2c2c" metalness={0.9} roughness={0.1} />
        </Cylinder>

        {/* Brush */}
        <Cylinder args={[0.05, 0.03, 0.2]} position={[0, -0.1, 0]}>
          <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.9} />
        </Cylinder>
      </group>
    </Float>
  );
}

// Enhanced Cosmetic Products Component
function RealisticCosmeticProducts() {
  return (
    <group>
      {/* Multiple Realistic Products */}
      <RealisticLipstick position={[-3, 1, 0]} color="#ff6b9d" />
      <RealisticLipstick position={[-1, -2, 1]} color="#dc143c" />
      <RealisticPerfume position={[2, -0.5, 0]} />
      <RealisticCompact position={[0, -1.5, 1]} />
      <RealisticNailPolish position={[3, 1.5, -1]} color="#ff1744" />
      <RealisticNailPolish position={[-2, 0.5, -1]} color="#9c27b0" />
      <RealisticMascara position={[1, 2, 0]} />
      <RealisticMascara position={[-3, -1, -1]} />

      {/* Additional Lipsticks in different colors */}
      <RealisticLipstick position={[4, -1, 1]} color="#e91e63" />
      <RealisticLipstick position={[-4, 2, -1]} color="#ff5722" />

      <BeautyParticles count={15} />
      <Glitter count={25} />
      {/* Floating Beauty Particles */}
      {/* {Array.from({ length: 15 }).map((_, i) => ( */}
      {/*   <Float key={i} speed={2 + Math.random()} rotationIntensity={1} floatIntensity={2}> */}
      {/*     <Sphere */}
      {/*       args={[0.03 + Math.random() * 0.02]} */}
      {/*       position={[ */}
      {/*         (Math.random() - 0.5) * 10, */}
      {/*         (Math.random() - 0.5) * 8, */}
      {/*         (Math.random() - 0.5) * 6, */}
      {/*       ]} */}
      {/*     > */}
      {/*       <meshStandardMaterial */}
      {/*         color={new THREE.Color().setHSL(Math.random() * 0.1 + 0.8, 0.8, 0.7)} // Pink/Purple hues */}
      {/*         emissive={new THREE.Color().setHSL(Math.random() * 0.1 + 0.8, 0.6, 0.3)} */}
      {/*         metalness={0.8} */}
      {/*         roughness={0.2} */}
      {/*       /> */}
      {/*     </Sphere> */}
      {/*   </Float> */}
      {/* ))} */}

      {/* Glitter Particles */}
      {/* {Array.from({ length: 25 }).map((_, i) => ( */}
      {/*   <Float */}
      {/*     key={`glitter-${i}`} */}
      {/*     speed={3 + Math.random() * 2} */}
      {/*     rotationIntensity={2} */}
      {/*     floatIntensity={3} */}
      {/*   > */}
      {/*     <Box */}
      {/*       args={[0.02, 0.02, 0.02]} */}
      {/*       position={[ */}
      {/*         (Math.random() - 0.5) * 12, */}
      {/*         (Math.random() - 0.5) * 10, */}
      {/*         (Math.random() - 0.5) * 8, */}
      {/*       ]} */}
      {/*       rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]} */}
      {/*     > */}
      {/*       <meshStandardMaterial */}
      {/*         color="#ffd700" */}
      {/*         emissive="#ffd700" */}
      {/*         emissiveIntensity={0.5} */}
      {/*         metalness={1} */}
      {/*         roughness={0} */}
      {/*       /> */}
      {/*     </Box> */}
      {/*   </Float> */}
      {/* ))} */}
    </group>
  );
}

// Enhanced 3D Scene Component
export function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 75 }}
      dpr={[1, 1.8]}
      gl={{ powerPreference: 'high-performance' }}
    >
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      <ambientLight intensity={0.5} />
      <hemisphereLight intensity={0.4} />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <QualityGate>
          <RealisticCosmeticProducts />
        </QualityGate>
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.25} />
    </Canvas>
  );
}
