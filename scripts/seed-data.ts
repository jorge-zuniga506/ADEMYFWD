import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "gjyvstwxmawxmkuejwax";
const SUPABASE_MANAGEMENT_TOKEN = process.env.SUPABASE_MANAGEMENT_TOKEN;

if (!SUPABASE_MANAGEMENT_TOKEN) {
  throw new Error("SUPABASE_MANAGEMENT_TOKEN no está definido en .env.local");
}

async function run(sql: string) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_MANAGEMENT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP Error ${res.status}: ${text}`);
  }
  try {
    const data = JSON.parse(text);
    if (data.error) {
      throw new Error(`PostgreSQL Error: ${data.error.message || JSON.stringify(data.error)}`);
    }
    if (Array.isArray(data) && data.some(d => d.error)) {
      const err = data.find(d => d.error);
      throw new Error(`PostgreSQL Error: ${err.error.message || JSON.stringify(err.error)}`);
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.startsWith("PostgreSQL Error")) throw e;
  }
  return { status: res.status, body: text };
}

async function seed() {
  // Limpiar tablas para evitar errores de integridad referencial
  console.log("Limpiando datos existentes...");
  await run(`
    DELETE FROM "CourseReview";
    DELETE FROM "Enrollment";
    DELETE FROM "Lesson";
    DELETE FROM "Section";
    DELETE FROM "FwdCredential";
    DELETE FROM "FwdCodeSnippet";
    DELETE FROM "Course";
    DELETE FROM "Category";
  `);

  // 1. Categories (Las 10 categorías oficiales solicitadas con UUIDs válidos)
  console.log("Creando categorias...");
  await run(`
    INSERT INTO "Category" (id, nombre) VALUES
      ('a1e0ee0c-83b3-4f51-b0e7-8be5f2f46e01', 'Frontend'),
      ('b2e0ee0c-83b3-4f51-b0e7-8be5f2f46e02', 'Backend'),
      ('c3e0ee0c-83b3-4f51-b0e7-8be5f2f46e03', 'DevOps'),
      ('d4e0ee0c-83b3-4f51-b0e7-8be5f2f46e04', 'Mobile'),
      ('e5e0ee0c-83b3-4f51-b0e7-8be5f2f46e05', 'Data Science'),
      ('f6e0ee0c-83b3-4f51-b0e7-8be5f2f46e06', 'UI/UX Design'),
      ('a7e0ee0c-83b3-4f51-b0e7-8be5f2f46e07', 'Cloud Computing'),
      ('b8e0ee0c-83b3-4f51-b0e7-8be5f2f46e08', 'Blockchain'),
      ('c9e0ee0c-83b3-4f51-b0e7-8be5f2f46e09', 'Ciberseguridad'),
      ('dae0ee0c-83b3-4f51-b0e7-8be5f2f46e10', 'Inteligencia Artificial')
    ON CONFLICT (id) DO NOTHING;
  `);

  // 2. Ensure User records exist (creates from auth.users if missing)
  console.log("Sincronizando usuarios desde auth.users...");
  await run(`
    INSERT INTO "User" (id, nombre, email, "passwordHash", rol)
    SELECT id, COALESCE(raw_user_meta_data->>'nombre', email), email, '', 'ESTUDIANTE'::"Role"
    FROM auth.users
    WHERE email IN ('admin@u-forward.academy', 'instructor@u-forward.academy', 'estudiante@u-forward.academy', 'santiago@u-forward.academy')
    ON CONFLICT (id) DO NOTHING;

    UPDATE "User" SET rol = 'ADMIN'::"Role", "onboardingDone" = true WHERE email = 'admin@u-forward.academy';
    UPDATE "User" SET rol = 'INSTRUCTOR'::"Role", "onboardingDone" = true WHERE email = 'instructor@u-forward.academy';
    UPDATE "User" SET rol = 'ESTUDIANTE'::"Role", "onboardingDone" = true WHERE email = 'estudiante@u-forward.academy';
    UPDATE "User" SET rol = 'INSTRUCTOR'::"Role", "onboardingDone" = true WHERE email = 'santiago@u-forward.academy';
  `);

  // 3. Courses (Sembramos cursos reales de Udemy bajo cada categoría con UUIDs válidos)
  console.log("Creando cursos...");
  await run(`
    -- CATEGORÍA 1: Frontend
    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e11', 'React: De cero a experto (hooks y MERN)', 'Aprende React con hooks, context, reducers y despliegues. Incluye proyectos reales y el stack completo MERN.', 9.99, id, 'a1e0ee0c-83b3-4f51-b0e7-8be5f2f46e01', 'PUBLICADO', 28.5, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e13', 'Fullstack con Next.js: App Router, Server Components y Actions', 'Domina Next.js 16+, optimización de renders, autenticación, base de datos integrada y despliegues en Vercel.', 12.99, id, 'a1e0ee0c-83b3-4f51-b0e7-8be5f2f46e01', 'PUBLICADO', 15.0, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e17', 'Diseño Web Profesional con HTML5, CSS3 y JavaScript', 'Crea sitios web modernos, responsivos y con animaciones espectaculares sin usar frameworks.', 9.99, id, 'a1e0ee0c-83b3-4f51-b0e7-8be5f2f46e01', 'PUBLICADO', 18.0, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    -- CATEGORÍA 2: Backend
    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e12', 'Node.js: De cero a experto', 'APIs REST, autenticacion JWT, WebSockets, base de datos Postgres y MongoDB con Node.', 9.99, id, 'b2e0ee0c-83b3-4f51-b0e7-8be5f2f46e02', 'PUBLICADO', 24.5, true
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e16', 'NestJS: Desarrollo de backend modular, APIs y microservicios', 'Aprende TypeScript avanzado enfocado en backend escalable con inyección de dependencias y microservicios.', 9.99, id, 'b2e0ee0c-83b3-4f51-b0e7-8be5f2f46e02', 'PUBLICADO', 18.0, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    -- CATEGORÍA 3: DevOps
    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e14', 'Docker y Kubernetes: Contenedores y Orquestación para Desarrolladores', 'Aprende a empaquetar aplicaciones en contenedores Docker y orquestar clústeres empresariales con Kubernetes.', 9.99, id, 'c3e0ee0c-83b3-4f51-b0e7-8be5f2f46e03', 'PUBLICADO', 10.0, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e18', 'CI/CD y Automatización: GitHub Actions, Jenkins y GitLab', 'Diseña tuberías de integración y entrega continuas automáticas y seguras para desarrollo ágil.', 9.99, id, 'c3e0ee0c-83b3-4f51-b0e7-8be5f2f46e03', 'EN_REVISION', 12.5, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    -- CATEGORÍA 4: Mobile
    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e19', 'Flutter: Tu guía completa de desarrollo de Apps para iOS y Android', 'Construye aplicaciones nativas de alto rendimiento con Dart y el framework multiplataforma Flutter.', 9.99, id, 'd4e0ee0c-83b3-4f51-b0e7-8be5f2f46e04', 'PUBLICADO', 32.0, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e20', 'React Native: Crea aplicaciones nativas reales con TypeScript', 'Reutiliza tus conocimientos de React para crear interfaces nativas móviles fluidas y modernas.', 9.99, id, 'd4e0ee0c-83b3-4f51-b0e7-8be5f2f46e04', 'PUBLICADO', 20.0, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    -- CATEGORÍA 5: Data Science
    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e21', 'Python para Data Science y Machine Learning A-Z', 'Domina NumPy, Pandas, Matplotlib, Seaborn y algoritmos de Machine Learning con Scikit-Learn.', 9.99, id, 'e5e0ee0c-83b3-4f51-b0e7-8be5f2f46e05', 'PUBLICADO', 25.0, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e22', 'Deep Learning de A a Z: Redes Neuronales en Python y TensorFlow', 'Comprende el funcionamiento de Redes Neuronales Artificiales, Convolucionales y Recurrentes desde cero.', 9.99, id, 'e5e0ee0c-83b3-4f51-b0e7-8be5f2f46e05', 'BORRADOR', 18.5, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    -- CATEGORÍA 6: UI/UX Design
    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e23', 'Diseño de interfaces (UI) y Experiencia de usuario (UX) con Figma', 'Aprende a diseñar interfaces web y móviles profesionales. Principios de UX, prototipos dinámicos y portafolio.', 9.99, id, 'f6e0ee0c-83b3-4f51-b0e7-8be5f2f46e06', 'PUBLICADO', 18.5, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e24', 'Adobe XD: Diseño de Interfaces y UX Dinámico', 'Crea maquetas e interfaces dinámicas y pon a prueba tus prototipos con la herramienta líder de Adobe.', 9.99, id, 'f6e0ee0c-83b3-4f51-b0e7-8be5f2f46e06', 'PUBLICADO', 10.0, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    -- CATEGORÍA 7: Cloud Computing
    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e25', 'AWS Certified Cloud Practitioner - Preparación Completa', 'Domina la infraestructura global de Amazon Web Services (AWS) y aprueba la certificación CLF-C02.', 9.99, id, 'a7e0ee0c-83b3-4f51-b0e7-8be5f2f46e07', 'PUBLICADO', 15.5, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e26', 'Microsoft Azure: Curso Completo de Administración (AZ-104)', 'Aprende a administrar recursos en la nube de Microsoft: redes, almacenamiento, VMs y seguridad.', 9.99, id, 'a7e0ee0c-83b3-4f51-b0e7-8be5f2f46e07', 'PUBLICADO', 20.0, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    -- CATEGORÍA 8: Blockchain
    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e27', 'Blockchain y Smart Contracts: Solidity de Cero a Experto', 'Aprende tecnología Blockchain, crea criptomonedas y programa contratos inteligentes con Solidity en Ethereum.', 9.99, id, 'b8e0ee0c-83b3-4f51-b0e7-8be5f2f46e08', 'PUBLICADO', 12.0, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e28', 'Web3 y DApps: Desarrollo de Aplicaciones Descentralizadas', 'Integra React con contratos inteligentes utilizando ethers.js y Web3Modal para conectar billeteras.', 9.99, id, 'b8e0ee0c-83b3-4f51-b0e7-8be5f2f46e08', 'PUBLICADO', 14.5, false
    FROM "User" WHERE email = 'instructor@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    -- CATEGORÍA 9: Ciberseguridad
    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e29', 'Curso completo de Hacking Ético y Ciberseguridad', 'Aprende Hacking Ético, Penetration Testing, Kali Linux y mitigación de vulnerabilidades de forma práctica.', 9.99, id, 'c9e0ee0c-83b3-4f51-b0e7-8be5f2f46e09', 'PUBLICADO', 24.5, false
    FROM "User" WHERE email = 'santiago@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e30', 'Seguridad Web y Auditoría de Vulnerabilidades OWASP Top 10', 'Aprende a auditar y blindar tus aplicaciones web contra las 10 vulnerabilidades más críticas según OWASP.', 9.99, id, 'c9e0ee0c-83b3-4f51-b0e7-8be5f2f46e09', 'PUBLICADO', 8.5, false
    FROM "User" WHERE email = 'santiago@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    -- CATEGORÍA 10: Inteligencia Artificial
    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e31', 'Curso Completo de Claude Code: Crea Aplicaciones con IA', 'Domina Claude Code a nivel profesional y crea aplicaciones reales y seguras con Agentes de IA, MCP, Hooks y Skills.', 9.99, id, 'dae0ee0c-83b3-4f51-b0e7-8be5f2f46e10', 'PUBLICADO', 15.0, false
    FROM "User" WHERE email = 'santiago@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e32', 'Máster Claude Code 2026: Agentes IA, MCP, Skills y Comandos', 'El entrenamiento definitivo sobre Model Context Protocol (MCP) y desarrollo agéntico autónomo.', 9.99, id, 'dae0ee0c-83b3-4f51-b0e7-8be5f2f46e10', 'PUBLICADO', 13.0, false
    FROM "User" WHERE email = 'santiago@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e33', 'n8n + MCP: Automatización y agentes de IA inteligentes', 'Conecta flujos de trabajo sin código con agentes de IA autónomos a través del Model Context Protocol.', 9.99, id, 'dae0ee0c-83b3-4f51-b0e7-8be5f2f46e10', 'PUBLICADO', 18.0, false
    FROM "User" WHERE email = 'santiago@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e34', 'Curso Completo de IA Generativa: ChatGPT, Midjourney y más!', 'Aprende Inteligencia Artificial Generativa: LLMs, ChatGPT, GPTs, Prompt Engineering, Midjourney y más.', 9.99, id, 'dae0ee0c-83b3-4f51-b0e7-8be5f2f46e10', 'PUBLICADO', 22.5, false
    FROM "User" WHERE email = 'santiago@u-forward.academy' ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, "instructorId", "categoryId", estado, "duracionHoras", "esExclusivoFwd")
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e35', 'Curso de IA Completo 2026: Inteligencia Artificial - 0 a 100', 'Un viaje completo que cubre desde fundamentos matemáticos hasta implementaciones de redes neuronales y agentes.', 9.99, id, 'dae0ee0c-83b3-4f51-b0e7-8be5f2f46e10', 'PUBLICADO', 40.5, false
    FROM "User" WHERE email = 'santiago@u-forward.academy' ON CONFLICT (id) DO NOTHING;
  `);

  // 4. Sections & Lessons for each course (usando UUIDs de cursos válidos)
  console.log("Creando secciones y lecciones...");

  // React course (e1c0ffee-83b3-4f51-b0e7-8be5f2f46e11)
  await run(`
    INSERT INTO "Section" (id, "courseId", titulo, orden) VALUES
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e51', 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e11', 'Fundamentos', 1),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e52', 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e11', 'Componentes Avanzados', 2),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e53', 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e11', 'Proyecto Final', 3)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Lesson" ("sectionId", titulo, "videoUrl", orden, "esGratis") VALUES
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e51', 'Que es React?', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, true),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e51', 'JSX y elementos', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, true),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e51', 'Estado y ciclo de vida', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 3, false),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e52', 'useEffect en profundidad', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, false),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e52', 'Context API', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, false),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e53', 'Creacion del proyecto', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, false);
  `);

  // Node course (e1c0ffee-83b3-4f51-b0e7-8be5f2f46e12)
  await run(`
    INSERT INTO "Section" (id, "courseId", titulo, orden) VALUES
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e54', 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e12', 'Introduccion a Node', 1),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e55', 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e12', 'APIs REST', 2)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Lesson" ("sectionId", titulo, "videoUrl", orden, "esGratis") VALUES
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e54', 'Arquitectura de Node', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, true),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e54', 'Modulos y npm', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, false),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e55', 'Express.js', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, false),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e55', 'Autenticacion JWT', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, false);
  `);

  // Next.js course (e1c0ffee-83b3-4f51-b0e7-8be5f2f46e13)
  await run(`
    INSERT INTO "Section" (id, "courseId", titulo, orden) VALUES
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e56', 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e13', 'Introduccion a Next.js', 1),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e57', 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e13', 'App Router', 2)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Lesson" ("sectionId", titulo, "videoUrl", orden, "esGratis") VALUES
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e56', 'Que es Next.js?', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, true),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e56', 'Ruteo y layouts', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, false),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e57', 'Server Components', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, false),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e57', 'Server Actions', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, false);
  `);

  // Docker course (e1c0ffee-83b3-4f51-b0e7-8be5f2f46e14)
  await run(`
    INSERT INTO "Section" (id, "courseId", titulo, orden) VALUES
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e58', 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e14', 'Fundamentos Docker', 1)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Lesson" ("sectionId", titulo, "videoUrl", orden, "esGratis") VALUES
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e58', 'Que es Docker?', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, true),
      ('a1d1d1a1-83b3-4f51-b0e7-8be5f2f46e58', 'Docker Compose', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, false);
  `);

  // 5. Enrollments - student enrolled in React (e1c0ffee-83b3-4f51-b0e7-8be5f2f46e11) and Node
  console.log("Creando inscripciones...");
  await run(`
    INSERT INTO "Enrollment" ("courseId", "userId", progreso, completado)
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e11', id, 30, false FROM "User" WHERE email = 'estudiante@u-forward.academy'
    ON CONFLICT ("userId", "courseId") DO NOTHING;

    INSERT INTO "Enrollment" ("courseId", "userId", progreso, completado)
    SELECT 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e12', id, 100, true FROM "User" WHERE email = 'estudiante@u-forward.academy'
    ON CONFLICT ("userId", "courseId") DO NOTHING;
  `);

  // 6. Reviews
  console.log("Creando reviews...");
  await run(`
    INSERT INTO "CourseReview" ("userId", "courseId", estrellas, comentario)
    SELECT id, 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e11', 5, 'Excelente curso, muy practico y bien explicado.' FROM "User" WHERE email = 'estudiante@u-forward.academy';

    INSERT INTO "CourseReview" ("userId", "courseId", estrellas, comentario)
    SELECT id, 'e1c0ffee-83b3-4f51-b0e7-8be5f2f46e12', 4, 'Buen contenido, le faltan mas ejercicios.' FROM "User" WHERE email = 'estudiante@u-forward.academy';
  `);

  // 7. FWD Credential request (for verification center testing)
  console.log("Creando solicitud de credencial...");
  await run(`
    INSERT INTO "FwdCredential" ("userId", "documentoUrl", estado)
    SELECT id, 'https://example.com/certificado.pdf', 'PENDIENTE'::"VerificationStatus" FROM "User" WHERE email = 'estudiante@u-forward.academy';
  `);

  // 8. Job posts (for VIP ecosistema testing)
  console.log("Creando vacantes...");
  await run(`
    INSERT INTO "FwdJobPost" (empresa, "tituloPuesto", descripcion, salario, estado)
    VALUES
      ('TechCorp', 'Senior Frontend Developer', 'Buscamos un desarrollador React con 5+ anos de experiencia para unirte a nuestro equipo de producto.', '$80,000 - $100,000', 'PENDIENTE'::"VerificationStatus"),
      ('DataSoft', 'Fullstack Engineer', 'Desarrollador fullstack con Node.js y React para construir APIs y dashboards.', '$90,000 - $110,000', 'APROBADA'::"VerificationStatus"),
      ('CloudBase', 'DevOps Engineer', 'Experiencia en Docker, Kubernetes, CI/CD y AWS.', '$85,000 - $105,000', 'RECHAZADA'::"VerificationStatus");
  `);

  // 9. Code snippets (for VIP ecosistema)
  console.log("Creando fragmentos de codigo...");
  await run(`
    INSERT INTO "FwdCodeSnippet" ("userId", titulo, "codigoTexto")
    SELECT id, 'Custom React Hook: useLocalStorage', '
    export function useLocalStorage<T>(key: string, initial: T) {
      const [value, setValue] = useState<T>(() => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initial;
      });
      useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);
      return [value, setValue] as const;
    }' FROM "User" WHERE email = 'estudiante@u-forward.academy';

    INSERT INTO "FwdCodeSnippet" ("userId", titulo, "codigoTexto")
    SELECT id, 'Express middleware: auth', '
    function auth(req: Request, res: Response, next: NextFunction) {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "No token" });
      try {
        req.user = jwt.verify(token, process.env.JWT_SECRET!);
        next();
      } catch { res.status(401).json({ error: "Invalid token" }); }
    }' FROM "User" WHERE email = 'instructor@u-forward.academy';
  `);

  console.log("Seed completado con exito!");
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
