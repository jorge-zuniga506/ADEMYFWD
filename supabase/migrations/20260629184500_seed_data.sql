-- Seed: Categories
INSERT INTO "Category" (id, nombre) VALUES
  (gen_random_uuid(), 'Frontend'),
  (gen_random_uuid(), 'Backend'),
  (gen_random_uuid(), 'DevOps'),
  (gen_random_uuid(), 'Mobile'),
  (gen_random_uuid(), 'Data Science'),
  (gen_random_uuid(), 'UI/UX Design'),
  (gen_random_uuid(), 'Cloud Computing'),
  (gen_random_uuid(), 'Blockchain'),
  (gen_random_uuid(), 'Ciberseguridad'),
  (gen_random_uuid(), 'Inteligencia Artificial')
ON CONFLICT (nombre) DO NOTHING;

-- Seed: Job Posts (solo referencia pública)
INSERT INTO "FwdJobPost" (id, empresa, "tituloPuesto", descripcion, salario) VALUES
  (gen_random_uuid(), 'TechCorp', 'Frontend Developer Sr.', 'Buscamos un desarrollador frontend con experiencia en React y TypeScript para unirse a nuestro equipo.', '$80,000 - $120,000'),
  (gen_random_uuid(), 'DataFlow', 'Backend Engineer', 'Desarrollador backend con experiencia en Node.js, PostgreSQL y APIs RESTful.', '$90,000 - $130,000'),
  (gen_random_uuid(), 'CloudBase', 'DevOps Engineer', 'Ingeniero DevOps con conocimiento en AWS, Docker, Kubernetes y CI/CD.', '$100,000 - $140,000'),
  (gen_random_uuid(), 'InnovaTech', 'Full Stack Developer', 'Desarrollador full stack con experiencia en React y Node.js para proyecto innovador.', '$75,000 - $110,000'),
  (gen_random_uuid(), 'SecureNet', 'Cybersecurity Analyst', 'Analista de ciberseguridad con experiencia en pentesting y seguridad en la nube.', '$95,000 - $135,000')
ON CONFLICT DO NOTHING;
