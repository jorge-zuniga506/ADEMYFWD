# Contexto del Proyecto: U-Forward

Este documento sirve como guía de contexto rápida para que cualquier Asistente de IA comprenda la arquitectura, el flujo de datos, la estructura de la base de datos y cómo instalar/ejecutar este proyecto.

---

## 1. Descripción General
**U-Forward** es una plataforma educativa clon de Udemy optimizada y personalizada para la comunidad U-Forward. Permite a estudiantes consumir cursos, a instructores crear contenido y administrar sus finanzas, y a administradores auditar cursos y validar identidades (anti-estafas) y credenciales.

### Stack Tecnológico
* **Framework:** Next.js 16 (App Router)
* **Lenguaje:** TypeScript
* **Estilos:** TailwindCSS v4
* **Base de Datos & Auth:** Supabase (PostgreSQL) + RLS (Row Level Security)
* **ORM (Opcional/Local):** Prisma (configurado para output a `app/generated/prisma`)
* **Animaciones:** Framer Motion
* **Modelos de IA:** Google Gemini, Kimi, OpenRouter (integrados en `lib/ai/`)

---

## 2. Instalación y Configuración Local

### Requisitos Previos
* Node.js v18 o superior instalado.
* Instalar dependencias del proyecto:
  ```bash
  npm install
  ```

### Variables de Entorno (`.env.local`)
Debes crear un archivo `.env.local` en la raíz con el siguiente formato:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
SUPABASE_PROJECT_REF=<tu-project-ref>
SUPABASE_MANAGEMENT_TOKEN=<tu-supabase-management-token>
DATABASE_URL=postgresql://postgres.<tu-project-ref>:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Claves de APIs de IA
OPENROUTER_API_KEY_1=<tu-key-1>
OPENROUTER_API_KEY_2=<tu-key-2>
KIMI_API_KEY=<tu-key-3>
GEMINI_API_KEY=<tu-key-4>
```

> [!WARNING]
> Nunca subas el archivo `.env.local` a Git. Las variables cargan automáticamente en los scripts gracias a la integración con la librería `dotenv`.

---

## 3. Base de Datos y Scripts de Migración

La base de datos se aloja en Supabase y las tablas, esquemas, políticas de seguridad RLS y datos iniciales de prueba están estructurados en la carpeta `/supabase/migrations/`.

### Tablas Principales (PostgreSQL)
* **`User`**: Almacena información del usuario. Contiene un enum `rol` (`'ESTUDIANTE'`, `'INSTRUCTOR'`, `'GRADUADO_FWD'`, `'ADMIN'`).
* **`FwdCredential`**: Solicitudes de verificación de título para graduados de U-Forward.
* **`Category`**: Categorías de cursos (Frontend, Backend, DevOps, Data Science, Mobile, etc.).
* **`Course`**: Carga de cursos, estado (`'BORRADOR'`, `'EN_REVISION'`, `'PUBLICADO'`), precio y exclusividad.
* **`Section` & `Lesson`**: Módulos y lecciones de cada curso, ordenados con enlaces a videos (por defecto links de YouTube para el MVP).
* **`Enrollment`**: Progreso e inscripciones de estudiantes en los cursos.
* **`CourseReview`**: Calificaciones de 1 a 5 estrellas dejadas por los alumnos.
* **`FwdJobPost`**: Ofertas de empleo moderadas en el ecosistema VIP.
* **`FwdCodeSnippet`**: Fragmentos de código compartidos en la comunidad VIP.

### Scripts Útiles (Ejecutar en consola)
Para inicializar la base de datos o aplicar cambios de esquema se utilizan scripts escritos en TypeScript:
* **Ejecutar migraciones básicas:** `npx tsx scripts/migrate.ts`
* **Migrar tablas de Q&A:** `npx tsx scripts/migrate-qa.ts`
* **Aplicar políticas RLS (Row Level Security):** `npx tsx scripts/migrate-rls.ts`
* **Cargar base de datos con datos de prueba (Seed):** `npm run seed` (ejecuta `npx tsx scripts/seed-data.ts`)

---

## 4. Estructura de Carpetas e Hitos de Desarrollo

```bash
├── .agents/                 # Prompts, guías e instrucciones para agentes de IA
├── app/                     # Rutas y lógica de Next.js (App Router)
│   ├── api/                 # Endpoints REST (inscripción, Webhooks, etc.)
│   ├── auth/                # Pantallas de Login, Registro y Onboarding
│   ├── certificado/         # Renderizado y descarga de certificados PDF
│   ├── comunidad/           # Foro VIP de la comunidad FWD
│   ├── courses/             # Páginas individuales de lecciones y reproductor
│   ├── cursos/              # Catálogo principal y filtros de cursos
│   ├── dashboard/           # Dashboards separados por Roles
│   │   ├── admin/           # Verificaciones KYC, Auditoría, Finanzas, Moderación
│   │   ├── instructor/      # Constructor de cursos, Métricas, Billetera/Payouts
│   │   └── student/         # Mis cursos, reproductor inmersivo, logros, certificados
│   ├── recursos/            # Recursos y links útiles
│   ├── ruta/                # Ruta de aprendizaje recomendada
│   └── sobre-nosotros/      # Información institucional
├── components/              # Componentes visuales UI (Sidebar, Player, Nav, UI genérica)
├── docs/                    # Documentos de especificación (credenciales, taxonomía, dashboards)
├── lib/                     # Acciones de servidor y clientes API
│   ├── actions/             # Lógica CRUD tipada conectada a base de datos
│   ├── ai/                  # Conectores a modelos de lenguaje (Gemini, Kimi, OpenRouter)
│   └── supabase/            # Configuración SSR (client, server, middleware)
├── scripts/                 # Migraciones y Seeding
├── supabase/                # Migraciones nativas y políticas RLS de Supabase
```

---

## 5. Arquitectura de Dashboards y Roles

1. **Estudiante (`ESTUDIANTE` / `GRADUADO_FWD`)**:
   * Accede a `/dashboard/student` para ver sus cursos en progreso y terminados.
   * Reproductor de clases inmersivo (Dark mode, temario lateral colapsable, recursos descargables).
   * Generación y descarga de certificados al completar el 100% de las lecciones.
   * Centro de preguntas y soporte comunitario (Q&A).

2. **Instructor (`INSTRUCTOR`)**:
   * Accede a `/dashboard/instructor` para construir cursos pegando URLs de YouTube.
   * Revisa métricas financieras del último mes y solicita retiros de balance (Payouts).
   * Modifica su marca personal y biografía pública.

3. **Administrador (`ADMIN`)**:
   * Accede a `/dashboard/admin` para auditar cursos pendientes de revisión.
   * Procesa solicitudes de Payouts de los instructores.
   * Valida títulos oficiales de graduados U-Forward (KYC) y gestiona usuarios en el sistema.
   * Modera el ecosistema VIP (ofertas de trabajo y foros de código).

---

## 6. Comandos Disponibles

* `npm run dev`: Inicia el servidor de desarrollo local en `http://localhost:3000`.
* `npm run build`: Compila la aplicación Next.js para producción.
* `npm run start`: Inicia el servidor compilado en producción.
* `npm run seed`: Llena la base de datos remota con datos iniciales (Cursos React, Node, Next.js, usuarios semilla e inscripciones).
* `npm run lint`: Ejecuta el validador de código ESLint.
