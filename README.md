# EduPlus - Plataforma de Gestión de Cursos

Una plataforma completa de cursos en línea construida con Next.js, React, Tailwind CSS y JSON Server.

## Características

### Sistema de Autenticación
- Login con email y contraseña
- Registro solo para participantes
- Tres roles: Administrador, Docente, Participante
- Redirección automática según rol

### Panel del Administrador
- **Dashboard**: Estadísticas generales de la plataforma
- **Usuarios**: CRUD completo de usuarios, gestión de roles
- **Cursos**: Visualización y gestión de todos los cursos
- **Configuración**: Edición de perfil

### Panel del Docente
- **Dashboard**: Visualización y creación de cursos propios
- **Participantes**: Lista de estudiantes inscritos en sus cursos
- **Configuración**: Edición de perfil

### Panel del Participante
- **Mis Cursos**: Cursos en progreso y completados
- **Cursos Disponibles**: Catálogo de cursos para inscribirse
- **Actividades**: Tareas asignadas con calificaciones
- **Configuración**: Edición de perfil

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar desarrollo (Next.js + JSON Server)
npm run dev

# Ejecutar solo el servidor JSON
npm run server
```

## Credenciales de Demostración

```
Admin:
- Email: admin@platform.com
- Contraseña: admin123

Docente:
- Email: juan@platform.com
- Contraseña: teacher123

Participante:
- Email: maria@platform.com
- Contraseña: student123
```

## Estructura del Proyecto

```
├── app/
│   ├── page.tsx                      # Página de login
│   ├── register/
│   │   └── page.tsx                  # Página de registro
│   ├── dashboard/
│   │   ├── admin/                    # Dashboard administrador
│   │   ├── teacher/                  # Dashboard docente
│   │   └── participant/              # Dashboard participante
│   └── layout.tsx
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx               # Barra lateral de navegación
│   │   └── header.tsx                # Encabezado
│   └── ui/                           # Componentes shadcn/ui
├── lib/
│   ├── api.ts                        # Cliente API
│   ├── auth-store.ts                 # Store de autenticación
│   └── utils.ts
├── db.json                           # Base de datos JSON Server
└── middleware.ts                     # Middleware de Next.js
```

## Tecnologías Utilizadas

- **Next.js 16**: Framework React con soporte para SSR
- **React 19.2**: Biblioteca UI
- **Tailwind CSS 4**: Utilidades CSS
- **Shadcn/UI**: Componentes UI reutilizables
- **Zustand**: Manejo de estado
- **JSON Server**: API simulada
- **Axios**: Cliente HTTP
- **Recharts**: Gráficas

## API Endpoints

La plataforma utiliza JSON Server en el puerto 3001:

- `GET /users` - Obtener todos los usuarios
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

- `GET /courses` - Obtener todos los cursos
- `POST /courses` - Crear curso
- `PUT /courses/:id` - Actualizar curso
- `DELETE /courses/:id` - Eliminar curso

- `GET /enrollments` - Obtener inscripciones
- `POST /enrollments` - Crear inscripción

- `GET /activities` - Obtener actividades
- `POST /activities` - Crear actividad

- `GET /submissions` - Obtener entregas
- `POST /submissions` - Crear entrega

## Características Futuras

- [ ] Integración con base de datos real (PostgreSQL)
- [ ] Autenticación con JWT y refresh tokens
- [ ] Subida de archivos
- [ ] Sistema de notificaciones
- [ ] Chat en tiempo real
- [ ] Calificaciones automáticas
- [ ] Certificados digitales
- [ ] Reportes avanzados
