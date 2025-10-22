# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    # Atisbe Academy — Frontend

    Sitio web en React + TypeScript + Vite con Tailwind CSS, diseñado para ser minimalista, elegante y totalmente responsivo. Marca aplicada con paleta: morado (#791EBA), rosa (#C89AB2), fondo marfil (#FFFEF1), amarillo (#FFF810), ámbar (#FDBB0F), más verde y negro.

    ## Rutas principales

    - / — Inicio (Hero + CTA “¿QUIERES SABER TU NIVEL TOTALMENTE GRATIS?”, carrusel de cursos, testimonios, blog, pago QR)
    - /quienes-somos — Historia, origen del nombre y método ATIKA
    - /cursos — Lista de cursos (24/7, cupos limitados)
    - /testimonios — Opiniones reales y videos
    - /blog — Publicaciones sugeridas
    - /contacto — Formulario con campos requeridos y botón “QUIERO COMENZAR”
    - /pago — Sección de pago por QR
    - /zona-estudiantes — Login (usuario/contraseña) y panel placeholder (progreso, horarios, mascota MCER)
    - /tienda — Cursos pregrabados, materiales, talleres, club
    - /influencers — Landing pages para campañas

    ## Desarrollo local

    ```powershell
    npm install
    npm run dev
    ```

    ## Build

    ```powershell
    npm run build
    npm run preview
    ```

    ## Variables de entorno

    Duplica `.env.example` como `.env` y ajusta:

    ```
    VITE_API_BASE_URL=https://tu-dominio-o-endpoint.com/api
    ```

    ## Integración futura con Hostinger (API/BD)

    Opción A (rápida): Backend en PHP con endpoints en `/public/api` dentro del hosting y consumo desde `VITE_API_BASE_URL`.
    Opción B (recomendada): Backend separado (Node/Laravel) desplegado en Hostinger o Vercel/Render, y el frontend apunta a ese dominio/API.

    Puntos a preparar:
    - Endpoint POST `/contact` para el formulario de contacto (ver `src/services/api.ts`).
    - Autenticación para zona de estudiantes (JWT/Sesiones). 
    - Endpoints para progreso, horarios/agendamiento y recursos de tienda.

    ## Despliegue en Hostinger

    1. Ejecuta el build: `npm run build`.
    2. Sube la carpeta `dist/` al hosting como contenido del sitio (hPanel > Administrador de archivos > dominio > public_html).
    3. Habilita HTTPS con el SSL gratuito de Hostinger.
    4. Si usas rutas de React Router, añade un fallback de SPA: crea un `.htaccess` en `public_html` con:

    ```
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
    ```

    ### Despliegue vía Git (con build automático)

    Esta repo incluye un workflow de GitHub Actions que compila y publica `dist/` en la rama `hostinger-build`.

    Pasos:
    1. Sube tu código a GitHub (rama `main`).
    2. Revisa en la pestaña Actions que el workflow “Build for Hostinger” corra y cree la rama `hostinger-build`.
    3. En Hostinger (hPanel > Avanzado > Git):
      - Conectar repositorio: pega la URL de tu repo.
      - Rama: `hostinger-build`.
      - Directorio de implementación: `public_html` (o el que uses para el sitio).
      - Auto deploy on push: activado.
      - Si el repo es privado, usa Deploy Key/SSH o un token personal.
    4. Haz un push a `main`; el workflow publicará en `hostinger-build` y Hostinger hará pull automático a `public_html`.

    Notas:
    - El backend PHP vive bajo `public/api` y se copia tal cual al `dist/` durante el build.
    - Si prefieres no usar Actions, también puedes construir localmente (`npm run build`) y subir `dist/` manualmente o mantener una rama separada con los archivos compilados.

  Seguridad de configuración (sin exponer secretos en Git)
  - No subas credenciales en el repo. En `public_html/api/`, crea un `config.local.php` con:
    ```php
    <?php
    define('DB_NAME', 'TU_DB');
    define('DB_USER', 'TU_USER');
    define('DB_PASS', 'TU_PASS');
    define('MAIL_TO', 'info@atisbeacademy.com');
    // Opcional SMTP
    // define('SMTP_HOST', 'smtp.tudominio.com');
    // define('SMTP_USER', 'no-reply@tudominio.com');
    // define('SMTP_PASS', '********');
    // define('SMTP_FROM', 'no-reply@tudominio.com');
    ```
  - Ese archivo no está en Git y no se sobreescribe al hacer pull si no lo versionas; el `config.php` del repo lo incluye automáticamente si existe.
    ### Backend PHP en Hostinger (Contacto)

    - Sube la carpeta `dist/` completa y asegúrate de que `dist/api/` contiene:
      - `api/config.php` (edita DB_NAME/DB_USER/DB_PASS y MAIL_TO opcional)
      - `api/_bootstrap.php`
      - `api/contact.php`
    - La API atenderá `POST https://tu-dominio.com/api/contact.php` con JSON del formulario.
    - Crea la base de datos y usuario en hPanel y otorga permisos. El schema se crea automáticamente al primer POST, o puedes ejecutar `server/sql/001_create_contacts.sql` desde phpMyAdmin.

    ### Autenticación básica (PHP sesiones)

    - Endpoints añadidos:
      - `POST /api/auth/login.php` (campos: `username`, `password`) — crea sesión
      - `POST /api/auth/logout.php` — destruye sesión
      - `GET /api/auth/me.php` — devuelve usuario en sesión o `null`
    - `GET /api/student/progreso.php` — requiere sesión; devuelve asistencia, notas, nivel MCER y observaciones.

    ### Horarios y agendamiento

    - Endpoints:
      - `GET /api/schedule/slots.php` — requiere sesión; devuelve slots sugeridos próximos 14 días.
      - `GET /api/schedule/my.php` — requiere sesión; lista reservas del usuario.
      - `POST /api/schedule/reserve.php` — requiere sesión; crea reserva. Body: `{ datetime, tipo, modalidad, notas? }` (datetime en ISO 8601).
      - `POST /api/schedule/cancel.php` — requiere sesión; cancela por `id`.
    - Tabla: `schedule_reservations` (ver `server/sql/003_create_schedule.sql`).
    - UI: en “Zona de estudiantes” sección Horarios/Agendar puedes seleccionar un slot, tipo, modalidad y reservar; además ver y cancelar tus reservas.
    - Tabla `users` (ver `server/sql/002_create_users.sql`). Al primer login, si la tabla está vacía se crea un usuario demo: `demo` / `demo123`.
    - En el frontend, la “Zona de estudiantes” usa estos endpoints (ver `src/pages/ZonaEstudiantes.tsx`).

    ### Envío de correos (SMTP opcional)

    - Configura en `api/config.php` las constantes `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, etc.
    - Si existe `vendor/autoload.php` (PHPMailer instalado vía Composer), se usará SMTP; si no, hace fallback a `mail()`.
    - Recomendado: instalar PHPMailer en Hostinger (hPanel o SSH):
      - `composer require phpmailer/phpmailer`

    ## Identidad visual aplicada

    - Tipografía: títulos con serif (Merriweather), texto con sans (Inter).
    - Colores de marca (Tailwind en `tailwind.config.js` bajo `theme.extend.colors.brand`).
    - Estilo minimalista y elegante con sombras suaves y énfasis en morado/amarillos.

    ## Notas

    - Botón flotante de WhatsApp en todas las páginas (`WhatsAppButton`).
    - En el footer hay un placeholder para un “Asistente IA (Chat)”.
    - Carrusel de cursos con Swiper (reemplazar imágenes/íconos cuando estén disponibles).

    ## Estructura relevante

    - `src/components/` Navbar, Footer, WhatsAppButton, Hero, CoursesCarousel
    - `src/pages/` Home, QuienesSomos, Cursos, Testimonios, Blog, Contacto, Pago, ZonaEstudiantes, Tienda, Influencers
    - `src/services/api.ts` cliente Axios con `VITE_API_BASE_URL`

    ## Próximos pasos sugeridos

    - Conectar formulario de contacto a un endpoint real en Hostinger.
    - Implementar Login real y protección de rutas para Zona de estudiantes.
    - Añadir assets de marca (logo, mascota) y optimizar imágenes.
    - Completar tienda con pagos reales (pasarela o QR dinámico).

  ## Conectar la base de datos en Hostinger

  1) Crea tu BD y usuario en hPanel > Bases de datos MySQL. Anota host (normalmente `localhost`), puerto (3306), nombre de BD y usuario (suelen tener prefijo).
  2) En el servidor, copia `public/api/config.local.php.example` a `public_html/api/config.local.php` y rellena:

  ```php
  <?php
  define('DB_HOST', 'localhost');
  define('DB_PORT', 3306);
  define('DB_NAME', 'uXXXXXX_atisbe');
  define('DB_USER', 'uXXXXXX_user');
  define('DB_PASS', '********');
  define('MAIL_TO', 'info@tudominio.com');
  ```

  3) Verifica conectividad abriendo en el navegador: `https://tu-dominio.com/api/health.php`. Debe responder `{ "ok": true, "db": "connected", ... }`.
  4) Las tablas se crean automáticamente al primer uso (o desde `server/sql/*.sql` en phpMyAdmin). Al crear la tabla `users` por primera vez se autogenera el usuario demo: `demo` / `demo123`.
