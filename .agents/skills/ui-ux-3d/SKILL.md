---
name: ui-ux-3d
description: "Capacitar al desarrollador para transformar interfaces planas (2D) en experiencias interactivas e inmersivas de alto rendimiento. Fusiona principios de UX, diseño UI estricto y renderizado 3D en el navegador. Stack: Figma, Spline, React Three Fiber, Framer Motion, Next.js."
metadata:
  author: custom
  version: "1.0.0"
---

# UI/UX Profesional y Experiencias Tridimensionales (3D) Web

## Regla de Oro: Cero Emojis

Esta especialización prohíbe terminantemente el uso de emojis en las interfaces. El diseño profesional y de alto valor (Premium) se comunica exclusivamente a través de:

- **Iconografía vectorial diseñada a medida (SVG).**
- **Jerarquía tipográfica sólida y legible.**
- **Uso estratégico del espacio negativo y la paleta de colores.**

El uso de emojis abarata la percepción del producto, resta credibilidad corporativa y rompe la consistencia del diseño a través de los diferentes sistemas operativos.

## Stack Tecnológico

| Capa | Herramienta |
|---|---|
| Diseño UI/UX | Figma (Auto Layout, Componentes avanzados, Iconografía vectorial) |
| Modelado 3D Web | Spline, Blender |
| Frontend | React / Next.js |
| Librerías 3D | React Three Fiber (R3F), Three.js, @react-three/drei, @react-three/postprocessing |
| Animaciones | Framer Motion, GSAP |
| Iconos | Phosphor Icons, Lucide, SVG personalizados |

---

## Módulo 1: Fundamentos de UX y Arquitectura de la Información

### Leyes de UX aplicadas
- **Ley de Fitts:** Los elementos interactivos (CTAs, enlaces) deben ser grandes y estar cerca del área de interacción del usuario.
- **Ley de Hick:** Reducir el número de opciones visibles para acelerar la toma de decisiones.
- **Efecto de posición serial:** Colocar la información más importante al principio y al final de las listas.
- **Ley de la proximidad:** Agrupar elementos relacionados visualmente.

### Wireframing
1. **Baja fidelidad:** Bocetos rápidos de la disposición de la página (sin color ni tipografía).
2. **Alta fidelidad:** Maquetas detalladas con la paleta de colores, tipografía y espaciado exactos.

### Accesibilidad (a11y)
- **Contraste:** Relación de contraste de al menos 4.5:1 para texto normal y 3:1 para texto grande (WCAG AA).
- **Navegación por teclado:** Todos los elementos interactivos deben ser accesibles mediante Tab/Enter.
- **Semántica:** Usar etiquetas HTML semánticas (`<nav>`, `<main>`, `<section>`, `<article>`).
- **Atributos ARIA** cuando la semántica HTML no sea suficiente.

---

## Módulo 2: UI Profesional y Microinteracciones

### Sistema de Diseño
- **Paleta:** 1 color primario, 1-2 secundarios, escala de neutros (50-950) y colores semánticos (success, warning, error, info).
- **Tipografía fluida:** Usar `clamp()` para escalar tipografía responsivamente: `font-size: clamp(1rem, 2.5vw, 1.5rem)`.
- **Espaciado 8px grid:** Todas las distancias deben ser múltiplos de 8 (8, 16, 24, 32, 48, 64, 96, 128).

### Iconografía
- **Nunca usar emojis.** Reemplazar con:
  - **Phosphor Icons** (`@phosphor-icons/react`) — familia completa de 1200+ iconos.
  - **Lucide** (`lucide-react`) — iconos consistentes de código abierto.
  - **SVG personalizados** para iconos únicos de marca.

### Microinteracciones
```tsx
// Botón con microinteracción usando Framer Motion
import { motion } from "framer-motion";

export function Button({ children }: { children: React.ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
    >
      {children}
    </motion.button>
  );
}
```

### Efectos Modernos
- **Glassmorphism:** `backdrop-filter: blur(12px); background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);`
- **Transparencias estratificadas:** Superponer capas con diferentes opacidades para crear profundidad.
- **Sombras:** Usar `box-shadow` con múltiples capas para sombras realistas.

---

## Módulo 3: Introducción al 3D Web

### Conceptos Base
- **Escena:** El mundo 3D que contiene todos los objetos.
- **Cámara:** El punto de vista del usuario (perspectiva u ortográfica).
- **Luces:** Ambiental, direccional, puntual, spotlight.
- **Malla (Mesh):** Combinación de geometría + material.
- **Material:** Define la apariencia (color, textura, reflectividad).

### Spline Design
1. Crear modelo 3D en [Spline](https://spline.design).
2. Exportar como código React o URL de embed.
3. Optimizar reduciendo el número de polígonos y comprimiendo texturas.

### Optimización de Modelos
- **Texturas:** Usar formatos WebP o AVIF. Comprimir con TinyPNG o Squoosh.
- **Polígonos:** Mantener por debajo de 50k polígonos para modelos de héroe.
- **Draco compression** para modelos GLTF/GLB.
- **Lazy loading:** Cargar modelos 3D solo cuando sean visibles.

---

## Módulo 4: Integración Técnica con Código

### React Three Fiber — Setup Básico
```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float } from "@react-three/drei";

export function Scene3D() {
  return (
    <div className="h-[500px] w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.4} />
          </mesh>
        </Float>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
```

### Cargar modelos GLTF/GLB
```tsx
import { useGLTF } from "@react-three/drei";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} />;
}
```

### Interactividad 3D
```tsx
function InteractiveModel() {
  const meshRef = useRef<Mesh>(null);
  const { pointer } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onClick={() => console.log("clicked")}
      onPointerEnter={() => document.body.style.cursor = "pointer"}
      onPointerLeave={() => document.body.style.cursor = "auto"}
    >
      <torusKnotGeometry args={[1, 0.3, 128, 16]} />
      <meshPhysicalMaterial color="#8b5cf6" metalness={0.6} roughness={0.2} />
    </mesh>
  );
}
```

### Scroll-telling 3D
```tsx
import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

function ScrollControlledModel() {
  const meshRef = useRef<Mesh>(null);
  const scroll = useScroll();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = scroll.offset * Math.PI * 2;
      meshRef.current.position.y = scroll.offset * 2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial color="#6366f1" metalness={0.5} roughness={0.3} />
    </mesh>
  );
}
```

---

## Proyecto Final: Landing Page Corporativa 3D

Para aprobar esta Skill, desarrollar una Landing Page corporativa para un producto de hardware o tecnología (auriculares, servidor empresarial, vehículo eléctrico).

### Requisitos Técnicos

1. **Hero Section Inmersivo:** Modelo 3D del producto flotando centrado, que el usuario pueda rotar de forma natural.
2. **UI Estricta y Limpia:** Diseño minimalista, tipografía elegante, iconos SVG exclusivamente. Sin emojis ni elementos informales.
3. **Scroll Animado:** Al bajar por las especificaciones, el modelo 3D cambia de perspectiva o se expande para mostrar componentes internos.
4. **Rendimiento:** Lighthouse scores > 90 en Performance y Accessibility.
5. **Responsive:** Funciona en desktop y mobile (el 3D se degrada gracefulmente en móviles).

### Estructura sugerida
```
app/
  page.tsx              # Landing page principal
  globals.css           # Tailwind + custom design tokens
components/
  HeroSection.tsx       # Canvas 3D + título + CTA
  ProductScene.tsx      # Modelo 3D con OrbitControls y Float
  Specifications.tsx    # Sección de scroll-telling 3D
  Features.tsx          # Grid de características con iconos SVG
  CtaSection.tsx        # CTA final
  Navbar.tsx            # Navegación transparente
  Footer.tsx            # Footer corporativo
lib/
  constants.ts          # Colores, tipografía, espaciado
  models/               # Modelos GLTF/GLB optimizados
```

### Checklist de Calidad
- [ ] No hay emojis en ningún componente.
- [ ] Todos los iconos son SVG (Phosphor, Lucide o personalizados).
- [ ] Relación de contraste WCAG AA mínima.
- [ ] Navegación completa por teclado.
- [ ] Modelo 3D < 500KB (comprimido).
- [ ] Animaciones a 60fps en desktop.
- [ ] Glassmorphism usado con moderación (máximo 2 elementos).
- [ ] Typografía fluida con `clamp()`.
