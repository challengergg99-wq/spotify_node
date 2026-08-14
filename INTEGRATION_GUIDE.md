# Integración PostgreSQL - Guía de Uso

## ✅ Archivos creados/actualizados:

1. **lib/auth.ts** - Funciones de seguridad
   - `hashPassword()` - Encriptar contraseñas con bcryptjs
   - `verifyPassword()` - Verificar contraseña contra hash
   - `validateEmail()` - Validar formato de email
   - `validatePasswordStrength()` - Validar fortaleza de contraseña

2. **lib/db.ts** - Funciones de base de datos
   - `registerUser()` - Registrar nuevo usuario
   - `getUserByEmail()` - Buscar usuario por email
   - `getUserById()` - Buscar usuario por ID
   - `getUserPasswordHash()` - Obtener hash para verificación
   - `updateUser()` - Actualizar datos del usuario
   - `deleteUser()` - Eliminar usuario

3. **app/api/register/route.ts** - API mejorada
   - Integración completa con BD
   - Validaciones robustas
   - Encriptación de contraseñas
   - Manejo de errores específicos

## 🔧 Configuración requerida:

### 1. Variables de entorno (.env.local)
```
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/spotify
NODE_ENV=development
```

### 2. Tabla en PostgreSQL
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_correo ON users(correo);
```

### 3. Instalar dependencias
```bash
npm install bcryptjs pg
npm install -D @types/bcryptjs
```

## 🧪 Testear el registro:

1. **Inicia el servidor**
   ```bash
   npm run dev
   ```

2. **Ve a** `http://localhost:3000/profile`

3. **Completa el formulario:**
   - Nombre: Juan
   - Apellido: Pérez
   - Correo: juan@ejemplo.com
   - Contraseña: Juan123@!
   - Repetir contraseña: Juan123@!

4. **Haz clic en "Registrarse"**

5. **Verifica en PostgreSQL:**
   ```sql
   SELECT * FROM users;
   ```

## 🔐 Validaciones implementadas:

- ✅ Email válido (formato correcto)
- ✅ Email único (no duplicados)
- ✅ Contraseña mínimo 8 caracteres
- ✅ Contraseña con mayúsculas
- ✅ Contraseña con números
- ✅ Contraseña con caracteres especiales
- ✅ Coincidencia de contraseñas
- ✅ Campos no vacíos

## 📝 Errores manejados:

- Campos incompletos (400)
- Email inválido (400)
- Email duplicado (409)
- Contraseña débil (400)
- Errores de base de datos (500)

## 🚀 Próximos pasos:

1. Crear página de login (`/api/login`, `/login`)
2. Implementar JWT para sesiones
3. Crear página de perfil del usuario
4. Agregar logout
5. Proteger rutas con autenticación
