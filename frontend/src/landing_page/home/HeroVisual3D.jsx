import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'

const INDIGO = '#4F46E5'
const TEAL = '#14B8A6'
const INDIGO_LIGHT = '#818CF8'

const NODE_POSITIONS = [
  [2.2, 0.8, 0.6],
  [-1.8, 1.2, 0.9],
  [1.4, -1.1, 1.5],
  [-2.0, -0.6, -0.8],
  [0.5, 2.0, -1.2],
  [-0.9, -1.8, -1.4],
  [2.1, 0.3, -1.6],
  [-1.2, 1.6, -1.8],
]

const CONNECTIONS = [
  [0, 1], [0, 2], [0, 4], [1, 4], [1, 7],
  [2, 3], [2, 6], [3, 5], [4, 7], [5, 6], [6, 7],
]

function ConnectionLines() {
  const points = useMemo(() => {
    const allPoints = []
    CONNECTIONS.forEach(([a, b]) => {
      const start = new THREE.Vector3(...NODE_POSITIONS[a])
      const end = new THREE.Vector3(...NODE_POSITIONS[b])
      allPoints.push(start, end)
    })
    NODE_POSITIONS.forEach((pos) => {
      allPoints.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(...pos))
    })
    return allPoints
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [points])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={INDIGO_LIGHT} transparent opacity={0.35} />
    </lineSegments>
  )
}

function PulseRing() {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    const scale = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.06
    ref.current.scale.setScalar(scale)
    ref.current.rotation.z = state.clock.elapsedTime * 0.2
  })

  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.6, 0.03, 16, 80]} />
      <meshStandardMaterial
        color={TEAL}
        emissive={TEAL}
        emissiveIntensity={0.4}
        transparent
        opacity={0.7}
      />
    </mesh>
  )
}

function CentralHub() {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.3
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.15
  })

  return (
    <group ref={ref}>
      <Sphere args={[0.55, 32, 32]}>
        <MeshDistortMaterial
          color={INDIGO}
          emissive={INDIGO}
          emissiveIntensity={0.25}
          distort={0.25}
          speed={2}
          roughness={0.2}
          metalness={0.6}
        />
      </Sphere>
      <mesh position={[0, 0.9, 0]}>
        <coneGeometry args={[0.22, 0.55, 4]} />
        <meshStandardMaterial
          color={TEAL}
          emissive={TEAL}
          emissiveIntensity={0.35}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}

function NetworkNode({ position, index }) {
  const ref = useRef()
  const color = index % 2 === 0 ? INDIGO : TEAL
  const size = 0.14 + (index % 3) * 0.04

  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.12
  })

  return (
    <Float speed={1.5 + index * 0.2} rotationIntensity={0.3} floatIntensity={0.4}>
      <mesh ref={ref} position={position}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.4}
          roughness={0.35}
        />
      </mesh>
    </Float>
  )
}

function OrbitParticles() {
  const ref = useRef()
  const count = 40

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const radius = 3.2 + (i % 3) * 0.3
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.sin(i * 0.7) * 0.8
      positions[i * 3 + 2] = Math.sin(angle) * radius
    }
    return positions
  }, [])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.08
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={TEAL}
        size={0.06}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}

function NetworkScene() {
  const groupRef = useRef()

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.35
  })

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.4} color={TEAL} />
      <pointLight position={[0, 2, 0]} intensity={0.8} color={INDIGO} />

      <CentralHub />
      <PulseRing />
      <ConnectionLines />
      <OrbitParticles />

      {NODE_POSITIONS.map((pos, i) => (
        <NetworkNode key={i} position={pos} index={i} />
      ))}
    </group>
  )
}

function HeroVisual3D() {
  return (
    <div className="hero-3d-canvas" aria-hidden="true">
      <Suspense fallback={<div className="hero-3d-loader" />}>
        <Canvas
          camera={{ position: [0, 0.5, 6.5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <NetworkScene />
        </Canvas>
      </Suspense>
    </div>
  )
}

export default HeroVisual3D
