# groove.

Aplicación web de música inspirada en los servicios de streaming. Permite crear una cuenta, iniciar sesión, buscar canciones y playlists, organizar canciones en playlists propias y reproducir audio desde un reproductor persistente.

El proyecto está construido con Next.js App Router, React, TypeScript y PostgreSQL. Es una aplicación de aprendizaje y algunas secciones todavía usan datos de ejemplo; esas diferencias se detallan más abajo.

## Funcionalidades

- Registro con validación de datos y contraseñas protegidas con `bcryptjs`.
- Inicio y cierre de sesión mediante un JWT guardado en una cookie `httpOnly`.
- Rutas de la aplicación protegidas por middleware.
- Búsqueda de canciones por título, artista o álbum, y de playlists por nombre.
- Creación de playlists por usuario y asociación de canciones con ellas.
- Reproductor de audio con reproducción, pausa, avance, retroceso, cola y control de progreso.
- Diseño adaptable con navegación, perfil, búsqueda y vistas de playlist.
- Archivos de audio y portadas servidos desde `public/`.

### Datos reales y datos de ejemplo

Las rutas de búsqueda, canciones, playlists y autenticación trabajan con PostgreSQL. La página de inicio (`/`) todavía obtiene parte de sus canciones y playlists desde `lib/mock-data.ts`; la búsqueda de `/search` consulta `/api/search` y la base de datos. Por eso, los datos de muestra de la portada no se sincronizan automáticamente con el catálogo de PostgreSQL.

## Tecnologías

- Next.js 16 y React 19
- TypeScript
- PostgreSQL, mediante el paquete `pg`
- Tailwind CSS 4
- `bcryptjs` para hashes de contraseña
- `jose` para firmar y verificar sesiones JWT

## Requisitos

- Node.js 20.9 o posterior
- npm
- Una instancia de PostgreSQL local o accesible por red

## Puesta en marcha

1. Instala las dependencias:

	 ```bash
	 npm install
	 ```

2. Crea una base de datos PostgreSQL, por ejemplo `groove`.

3. Crea un archivo `.env.local` en la raíz del proyecto:

	 ```env
	 DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/groove
	 JWT_SECRET=reemplaza-esto-por-un-secreto-largo-y-aleatorio
	 ```

	`DATABASE_URL` debe apuntar a la base de datos que acabas de crear. `JWT_SECRET` se usa para firmar las sesiones. El acceso de administrador se determina con la columna `users.is_admin` en PostgreSQL; no se configura mediante una lista de correos. No subas secretos al repositorio ni reutilices los ejemplos en producción.

4. Crea las tablas y los índices con el SQL de la sección siguiente.

5. Inicia el servidor de desarrollo:

	 ```bash
	 npm run dev
	 ```

6. Abre [http://localhost:3000](http://localhost:3000), crea una cuenta en `/register` e inicia sesión.

## Esquema de PostgreSQL

El proyecto no incluye actualmente migraciones ni un archivo SQL de inicialización. Este esquema cubre las columnas usadas por las consultas de la aplicación y modela la relación muchos-a-muchos entre playlists y canciones:

```sql
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	nombre VARCHAR(100) NOT NULL,
	apellido VARCHAR(100) NOT NULL,
	correo VARCHAR(255) NOT NULL UNIQUE,
	password_hash VARCHAR(255) NOT NULL,
	 is_admin BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE songs (
	id SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	artist VARCHAR(255) NOT NULL,
	album VARCHAR(255) NOT NULL,
	duration INTEGER NOT NULL CHECK (duration >= 0),
	src TEXT NOT NULL,
	cover TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE playlists (
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	name VARCHAR(255) NOT NULL,
	description TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE playlist_songs (
	playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
	song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
	position INTEGER NOT NULL DEFAULT 0,
	added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	PRIMARY KEY (playlist_id, song_id)
);

CREATE INDEX idx_playlists_user_created
	ON playlists(user_id, created_at DESC);

CREATE INDEX idx_playlist_songs_order
	ON playlist_songs(playlist_id, position, added_at);
```

La clave primaria compuesta de `playlist_songs` evita que una misma canción se agregue dos veces a una playlist. Las claves foráneas mantienen la integridad referencial y eliminan las playlists o asociaciones dependientes cuando se borra su usuario o canción.

### Carga de canciones

Las canciones deben existir en la tabla `songs` y sus rutas `src` y `cover` deben apuntar a archivos disponibles en `public/`, por ejemplo `/music/1/01.mp3` o `/covers/portada.jpg`. No hay todavía un script de seed incluido: puedes cargar los registros con SQL o crear uno como mejora futura.

## Búsqueda y rendimiento

La interfaz de `/search` espera 300 ms desde la última tecla antes de llamar al servidor (debounce). Así se evitan peticiones innecesarias mientras se escribe. La API busca coincidencias parciales con `ILIKE`, usa parámetros SQL (`$1`, `$2`) en lugar de concatenar la consulta del usuario y limita la respuesta a 25 canciones y 10 playlists.

El debounce reduce solicitudes desde el navegador, pero no acelera por sí solo la consulta de PostgreSQL. Las búsquedas con el patrón `%texto%` normalmente no aprovechan índices B-tree. Para un catálogo más grande, se puede habilitar la extensión `pg_trgm` y añadir índices trigram; conviene medir primero con `EXPLAIN (ANALYZE, BUFFERS)`:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_songs_title_trgm ON songs USING GIN (title gin_trgm_ops);
CREATE INDEX idx_songs_artist_trgm ON songs USING GIN (artist gin_trgm_ops);
CREATE INDEX idx_songs_album_trgm ON songs USING GIN (album gin_trgm_ops);
CREATE INDEX idx_playlists_name_trgm ON playlists USING GIN (name gin_trgm_ops);
```

Estos índices son una recomendación para escalar, no forman parte automáticamente del esquema básico anterior. Los índices adicionales ocupan espacio y aumentan el costo de escritura, así que deben justificarse con mediciones y el volumen real de datos.

## Estructura principal

```text
app/
	api/                 Rutas de autenticación, canciones, búsqueda y playlists
	login/               Inicio de sesión
	register/            Registro de usuario
	search/              Búsqueda conectada a PostgreSQL
	playlist/[id]/       Detalle de una playlist del usuario
	profile/             Perfil y cierre de sesión
components/            Navegación, filas de canciones y reproductor
lib/
	auth.ts              Firma y verificación de sesiones JWT
	db.ts                Pool compartido de conexiones PostgreSQL
	get-session.ts       Lectura de la sesión actual
	mock-data.ts         Datos de muestra usados en la portada
	player-context.tsx   Estado global del reproductor y la cola
public/
	covers/              Portadas
	music/               Archivos de audio
```

## API disponible

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/register` | Valida y registra una cuenta; almacena el hash de la contraseña. |
| `POST` | `/api/login` | Comprueba las credenciales y crea la cookie de sesión. |
| `POST` | `/api/logout` | Elimina la cookie de sesión. |
| `GET` | `/api/me` | Devuelve el usuario de la sesión actual o `null`. |
| `GET` | `/api/songs` | Devuelve el catálogo de canciones. |
| `GET` | `/api/search?q=...` | Busca canciones y playlists del usuario autenticado. |
| `GET` | `/api/playlists` | Lista las playlists del usuario autenticado. |
| `POST` | `/api/playlists` | Crea una playlist para el usuario autenticado. |
| `PATCH` / `DELETE` | `/api/playlists/:id` | Edita o elimina una playlist propia. |
| `POST` | `/api/playlists/:id/songs` | Agrega una canción a una playlist propia. |
| `DELETE` | `/api/playlists/:id/songs` | Quita una canción de una playlist propia. |
| `PATCH` | `/api/playlists/:id/songs` | Guarda el orden de las canciones de una playlist propia. |
| `GET` | `/api/admin/users` | Lista usuarios y sus roles (solo administradores). |
| `PATCH` / `DELETE` | `/api/admin/users/:id` | Cambia el rol o elimina un usuario (solo administradores). |
| `GET` | `/api/admin/playlists` | Lista playlists de todos los usuarios (solo administradores). |
| `DELETE` | `/api/admin/playlists/:id` | Elimina una playlist (solo administradores). |
| `POST` | `/api/admin/songs` | Agrega una canción al catálogo (solo administradores). |
| `PUT` / `DELETE` | `/api/admin/songs/:id` | Edita o elimina una canción del catálogo (solo administradores). |

El panel está disponible en `/admin` y sus secciones de resumen, canciones, usuarios y playlists consultan PostgreSQL. El rol se comprueba desde la base de datos tanto al renderizar páginas administrativas como en cada API protegida, de modo que los cambios de `is_admin` se aplican sin esperar a que expire una sesión. El borrado de una canción también elimina sus asociaciones con playlists por la regla de clave foránea `ON DELETE CASCADE`.

## Scripts

| Comando | Acción |
| --- | --- |
| `npm run dev` | Inicia Next.js en modo desarrollo. |
| `npm run build` | Genera la compilación de producción. |
| `npm run start` | Sirve la compilación de producción. |
| `npm run lint` | Ejecuta ESLint. |

## Aprendizajes del proyecto

- **Modelado relacional con PostgreSQL:** diseñar entidades separadas para usuarios, canciones y playlists, y resolver la relación muchos-a-muchos con una tabla de unión (`playlist_songs`). Las claves primarias, foráneas, restricciones únicas y reglas de borrado ayudan a mantener los datos coherentes.
- **Consultas seguras y conexiones:** usar consultas parametrizadas para evitar interpolar entradas del usuario en SQL y reutilizar un `Pool` de `pg` en lugar de abrir conexiones por cada petición.
- **Índices con propósito:** identificar qué columnas se consultan con frecuencia y elegir índices según el patrón de acceso. Un índice B-tree funciona bien para igualdad y ordenamiento, pero no resuelve normalmente un `ILIKE '%texto%'`; para eso se puede evaluar `pg_trgm` y comprobar el plan de consulta.
- **Búsqueda eficiente desde la interfaz:** aplicar debounce para limitar solicitudes durante la escritura y topes de resultados para acotar el trabajo y el tamaño de las respuestas.
- **Autenticación web:** guardar contraseñas como hashes, firmar JWT y transportarlo en una cookie `httpOnly`, además de comprobar la propiedad de las playlists antes de modificarlas.
- **Separación de responsabilidades:** mantener las páginas y componentes de interfaz separados de las rutas API, el acceso a datos y el estado compartido del reproductor.

## Mejoras futuras

- Crear migraciones versionadas y un seed reproducible para preparar la base y cargar el catálogo inicial.
- Unificar la portada con los datos de PostgreSQL y definir claramente qué contenido es personalizado y cuál es público.
- Añadir controles y pruebas para errores de red, consultas lentas, expiración de sesión y permisos; revisar también la protección CSRF de operaciones autenticadas.
- Incorporar pruebas automatizadas para autenticación, permisos, consultas y flujos principales de usuario.
- Agregar validación de configuración al arrancar, registro estructurado y métricas para diagnosticar rendimiento.
- Desplegar la aplicación y PostgreSQL con secretos seguros, copias de respaldo y almacenamiento de audio adecuado para producción.
