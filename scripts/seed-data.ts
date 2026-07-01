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
  return { status: res.status, body: text.substring(0, 2000) };
}

async function seed() {
  // 1. Categories
  console.log("Creando categorias...");
  await run(`
    INSERT INTO "Category" (id, nombre) VALUES
      ('cat-frontend', 'Frontend'),
      ('cat-backend', 'Backend'),
      ('cat-devops', 'DevOps'),
      ('cat-data', 'Data Science'),
      ('cat-mobile', 'Mobile')
    ON CONFLICT (id) DO NOTHING;
  `);

  // 2. Ensure User records exist (creates from auth.users if missing)
  console.log("Sincronizando usuarios desde auth.users...");
  await run(`
    INSERT INTO "User" (id, nombre, email, passwordHash, rol)
    SELECT id, COALESCE(raw_user_meta_data->>'nombre', email), email, '', 'ESTUDIANTE'
    FROM auth.users
    WHERE email IN ('admin@fwd.academy', 'instructor@fwd.academy', 'estudiante@fwd.academy')
    ON CONFLICT (id) DO NOTHING;

    UPDATE "User" SET rol = 'ADMIN', "onboardingDone" = true WHERE email = 'admin@fwd.academy';
    UPDATE "User" SET rol = 'INSTRUCTOR', "onboardingDone" = true WHERE email = 'instructor@fwd.academy';
    UPDATE "User" SET rol = 'ESTUDIANTE', "onboardingDone" = true WHERE email = 'estudiante@fwd.academy';
  `);

  // 3. Courses (3 publicados, 1 borrador, 1 en revision)
  console.log("Creando cursos...");
  await run(`
    INSERT INTO "Course" (id, titulo, descripcion, precio, instructorId, categoryId, estado, duracionHoras, esExclusivoFwd)
    SELECT 'course-react', 'React desde cero', 'Aprende React con TypeScript, hooks, contexto y buenas practicas. Incluye proyectos reales.', 29.99, id, 'cat-frontend', 'PUBLICADO', 12, false
    FROM "User" WHERE email = 'instructor@fwd.academy'
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, instructorId, categoryId, estado, duracionHoras, esExclusivoFwd)
    SELECT 'course-node', 'Node.js Avanzado', 'APIs REST, autenticacion JWT, WebSockets y base de datos con Node.js.', 39.99, id, 'cat-backend', 'PUBLICADO', 18, true
    FROM "User" WHERE email = 'instructor@fwd.academy'
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, instructorId, categoryId, estado, duracionHoras, esExclusivoFwd)
    SELECT 'course-next', 'Fullstack con Next.js', 'App router, server components, autenticacion, base de datos y deploy.', 49.99, id, 'cat-frontend', 'PUBLICADO', 15, false
    FROM "User" WHERE email = 'instructor@fwd.academy'
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, instructorId, categoryId, estado, duracionHoras, esExclusivoFwd)
    SELECT 'course-docker', 'Docker y Kubernetes', 'Contenedores, orquestacion, CI/CD y microservicios.', 44.99, id, 'cat-devops', 'EN_REVISION', 10, false
    FROM "User" WHERE email = 'instructor@fwd.academy'
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Course" (id, titulo, descripcion, precio, instructorId, categoryId, estado, duracionHoras, esExclusivoFwd)
    SELECT 'course-python', 'Python para Data Science', 'Pandas, NumPy, Matplotlib, scikit-learn para analisis de datos.', 34.99, id, 'cat-data', 'BORRADOR', 0, false
    FROM "User" WHERE email = 'instructor@fwd.academy'
    ON CONFLICT (id) DO NOTHING;
  `);

  // 4. Sections & Lessons for each course
  console.log("Creando secciones y lecciones...");

  // React course
  await run(`
    INSERT INTO "Section" (id, courseId, titulo, orden) VALUES
      ('sec-react-1', 'course-react', 'Fundamentos', 1),
      ('sec-react-2', 'course-react', 'Componentes Avanzados', 2),
      ('sec-react-3', 'course-react', 'Proyecto Final', 3)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Lesson" (sectionId, titulo, videoUrl, orden, esGratis) VALUES
      ('sec-react-1', 'Que es React?', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, true),
      ('sec-react-1', 'JSX y elementos', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, true),
      ('sec-react-1', 'Estado y ciclo de vida', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 3, false),
      ('sec-react-2', 'useEffect en profundidad', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, false),
      ('sec-react-2', 'Context API', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, false),
      ('sec-react-3', 'Creacion del proyecto', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, false);
  `);

  // Node course
  await run(`
    INSERT INTO "Section" (id, courseId, titulo, orden) VALUES
      ('sec-node-1', 'course-node', 'Introduccion a Node', 1),
      ('sec-node-2', 'course-node', 'APIs REST', 2)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Lesson" (sectionId, titulo, videoUrl, orden, esGratis) VALUES
      ('sec-node-1', 'Arquitectura de Node', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, true),
      ('sec-node-1', 'Modulos y npm', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, false),
      ('sec-node-2', 'Express.js', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, false),
      ('sec-node-2', 'Autenticacion JWT', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, false);
  `);

  // Next.js course
  await run(`
    INSERT INTO "Section" (id, courseId, titulo, orden) VALUES
      ('sec-next-1', 'course-next', 'Introduccion a Next.js', 1),
      ('sec-next-2', 'course-next', 'App Router', 2)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Lesson" (sectionId, titulo, videoUrl, orden, esGratis) VALUES
      ('sec-next-1', 'Que es Next.js?', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, true),
      ('sec-next-1', 'Ruteo y layouts', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, false),
      ('sec-next-2', 'Server Components', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, false),
      ('sec-next-2', 'Server Actions', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, false);
  `);

  // Docker course (EN_REVISION)
  await run(`
    INSERT INTO "Section" (id, courseId, titulo, orden) VALUES
      ('sec-docker-1', 'course-docker', 'Fundamentos Docker', 1)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO "Lesson" (sectionId, titulo, videoUrl, orden, esGratis) VALUES
      ('sec-docker-1', 'Que es Docker?', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 1, true),
      ('sec-docker-1', 'Docker Compose', 'https://www.youtube.com/watch?v=dGcsHMXbSOA', 2, false);
  `);

  // 5. Enrollments - student enrolled in React (30% progress) and Node
  console.log("Creando inscripciones...");
  await run(`
    INSERT INTO "Enrollment" (courseId, userId, progreso, completado)
    SELECT 'course-react', id, 30, false FROM "User" WHERE email = 'estudiante@fwd.academy'
    ON CONFLICT (userId, courseId) DO NOTHING;

    INSERT INTO "Enrollment" (courseId, userId, progreso, completado)
    SELECT 'course-node', id, 100, true FROM "User" WHERE email = 'estudiante@fwd.academy'
    ON CONFLICT (userId, courseId) DO NOTHING;
  `);

  // 6. Reviews
  console.log("Creando reviews...");
  await run(`
    INSERT INTO "CourseReview" (userId, courseId, estrellas, comentario)
    SELECT id, 'course-react', 5, 'Excelente curso, muy practico y bien explicado.' FROM "User" WHERE email = 'estudiante@fwd.academy'
    ON CONFLICT (userId, courseId) DO NOTHING;

    INSERT INTO "CourseReview" (userId, courseId, estrellas, comentario)
    SELECT id, 'course-node', 4, 'Buen contenido, le faltan mas ejercicios.' FROM "User" WHERE email = 'estudiante@fwd.academy'
    ON CONFLICT (userId, courseId) DO NOTHING;
  `);

  // 7. FWD Credential request (for verification center testing)
  console.log("Creando solicitud de credencial...");
  await run(`
    INSERT INTO "FwdCredential" (userId, documentoUrl, estado)
    SELECT id, 'https://example.com/certificado.pdf', 'PENDIENTE' FROM "User" WHERE email = 'estudiante@fwd.academy'
    ON CONFLICT DO NOTHING;
  `);

  // 8. Job posts (for VIP ecosistema testing)
  console.log("Creando vacantes...");
  await run(`
    INSERT INTO "FwdJobPost" (empresa, tituloPuesto, descripcion, salario, estado)
    VALUES
      ('TechCorp', 'Senior Frontend Developer', 'Buscamos un desarrollador React con 5+ anos de experiencia para unirte a nuestro equipo de producto.', '$80,000 - $100,000', 'PENDIENTE'),
      ('DataSoft', 'Fullstack Engineer', 'Desarrollador fullstack con Node.js y React para construir APIs y dashboards.', '$90,000 - $110,000', 'APROBADA'),
      ('CloudBase', 'DevOps Engineer', 'Experiencia en Docker, Kubernetes, CI/CD y AWS.', '$85,000 - $105,000', 'RECHAZADA')
    ON CONFLICT DO NOTHING;
  `);

  // 9. Code snippets (for VIP ecosistema)
  console.log("Creando fragmentos de codigo...");
  await run(`
    INSERT INTO "FwdCodeSnippet" (userId, titulo, codigoTexto)
    SELECT id, 'Custom React Hook: useLocalStorage', '
    export function useLocalStorage<T>(key: string, initial: T) {
      const [value, setValue] = useState<T>(() => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initial;
      });
      useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);
      return [value, setValue] as const;
    }' FROM "User" WHERE email = 'estudiante@fwd.academy'
    ON CONFLICT DO NOTHING;

    INSERT INTO "FwdCodeSnippet" (userId, titulo, codigoTexto)
    SELECT id, 'Express middleware: auth', '
    function auth(req: Request, res: Response, next: NextFunction) {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "No token" });
      try {
        req.user = jwt.verify(token, process.env.JWT_SECRET!);
        next();
      } catch { res.status(401).json({ error: "Invalid token" }); }
    }' FROM "User" WHERE email = 'instructor@fwd.academy'
    ON CONFLICT DO NOTHING;
  `);

  console.log("Seed completado con exito!");
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
