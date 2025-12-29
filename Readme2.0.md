# Guía de Migración y Despliegue 2.0

Este documento detalla el proceso para transformar tu proyecto local basado en `db.json` en una aplicación profesional con base de datos en la nube y despliegue en servidor.

## 1. Elección de Tecnologías

Para que el proyecto funcione de forma idéntica pero profesional, utilizaremos:

- **Base de Datos:** Supabase (PostgreSQL).
- **Frontend y Hosting:** Vercel.
- **Almacenamiento (Storage):** Supabase Storage (para materiales y tareas).

## 2. Paso a Paso: Creación del Backend

1.  **Crear cuenta en Supabase:** Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2.  **Configurar la Base de Datos (SQL):** En el "SQL Editor" de Supabase, ejecuta el siguiente script inicial para replicar tu `db.json`:

```sql
-- Tabla de Usuarios (Docentes y Participantes)
create table users (
  id uuid references auth.users not null primary key,
  full_name text,
  role text check (role in ('teacher', 'participant')),
  first_login boolean default true
);

-- Tabla de Cursos
create table courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  teacher_id uuid references users(id),
  video_url text,
  students_count int default 0,
  image_url text
);

-- Tabla de Inscripciones y Progreso
create table enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id),
  course_id uuid references courses(id),
  progress int default 0,
  watched_videos text[] default '{}',
  unique(user_id, course_id)
);
```

## 3. Conexión del Proyecto

1.  **Variables de Entorno:** Crea un archivo `.env.local` en tu proyecto con las credenciales de Supabase:
    ```
    NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_llave_anonima
    ```
2.  **Instalar el Cliente:** Ejecuta `npm install @supabase/supabase-js @supabase/ssr`.
3.  **Refactorizar `lib/api.ts`:** Debes cambiar las funciones `fetch` que apuntan al JSON por llamadas a `supabase.from('tabla').select('*')`.

## 4. Subir al Servidor (Vercel)

1.  **Subir código a GitHub:** Crea un repositorio privado y sube todo tu código actual.
2.  **Importar en Vercel:** Ve a [vercel.com](https://vercel.com), conecta tu GitHub e importa el repositorio.
3.  **Configurar Variables:** En el panel de Vercel, añade las mismas variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4.  **Deploy:** Haz clic en "Deploy". Tu sitio estará en vivo con una URL profesional.

## 5. Ventajas del Cambio

- **Seguridad:** Los datos no están en un archivo editable, sino protegidos por reglas de seguridad (RLS).
- **Escalabilidad:** Podrás tener miles de usuarios sin que el archivo JSON colapse.
- **Persistencia:** Los cambios son reales y permanentes para todos los usuarios en cualquier dispositivo.
