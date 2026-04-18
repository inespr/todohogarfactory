# Todo Hogar Factory — Web Corporativa

Sitio web de catálogo y contacto para **Todo Hogar Factory**, tienda especializada en electrodomésticos, sofás, colchones y artículos de hogar ubicada en Valverde del Camino, Huelva.

🌐 **Producción:** [todohogarfactory.es](https://todohogarfactory.es)

---

## Características

- **Catálogo dinámico** — productos organizados por categoría (electrodomésticos, sofás, descanso, hogar) con filtros y búsqueda
- **Ofertas destacadas** — sección automática ordenada por porcentaje de descuento
- **Formulario de contacto** — envío de email mediante Nodemailer desde API route de Next.js
- **SEO completo** — metadata dinámica, Open Graph, sitemap automático, robots.txt y datos estructurados (JSON-LD / Schema.org)
- **Analytics** — Google Analytics 4 cargado de forma diferida
- **Consentimiento de cookies** — banner y modal de configuración conforme a la normativa RGPD
- **Accesibilidad** — skip-link, roles ARIA, navegación por teclado
- **Botón flotante de WhatsApp** — contacto directo desde cualquier página
- **Responsive** — diseño mobile-first con Tailwind CSS

---

## Capturas de pantalla

| Página principal | Catálogo de productos |
|:---:|:---:|
| ![Home](public/screenshots/home.png) | ![Catálogo](public/screenshots/catalogo.png) |

| Detalle de producto | Ofertas |
|:---:|:---:|
| ![Detalle](public/screenshots/detalle.png) | ![Ofertas](public/screenshots/ofertas.png) |

> Las capturas se encuentran en `public/screenshots/`.

---

## Stack tecnológico

| Área | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Lenguaje | TypeScript 5 |
| UI | React 19, PrimeReact, PrimeFlex |
| Estilos | Tailwind CSS 4 |
| Base de datos | Firebase Firestore |
| Email | Nodemailer (API Route) |
| SEO | next-sitemap, metadata API de Next.js |
| Despliegue | Vercel |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── api/               # API Routes (contacto, etc.)
│   ├── buscar/            # Página de búsqueda global
│   ├── contacto/          # Formulario de contacto
│   ├── electrodomesticos/ # Catálogo y detalle de producto
│   ├── sofas/
│   ├── descanso/
│   ├── hogar/
│   ├── ofertas/           # Productos en oferta
│   ├── productos/
│   ├── sitemap.ts         # Sitemap dinámico
│   └── robots.ts
├── components/
│   ├── Navbar/            # Navegación con subcategorías dinámicas
│   ├── cookies/           # Banner y modal RGPD
│   └── ProductListCard    # Tarjeta de producto reutilizable
└── lib/
    ├── firebase.ts        # Inicialización de Firestore
    └── productExtras.ts   # Mapeo de campos y etiquetas de producto
```

---

## Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

> Requiere un archivo `.env.local` con las credenciales de Firebase y la configuración de email.

### Otros comandos

```bash
npm run build   # Build de producción
npm run start   # Iniciar en modo producción
npm run lint    # Linting con ESLint
```

---

## Decisiones técnicas destacadas

- **App Router de Next.js 15** — rutas y layouts anidados, Server Components donde es posible para mejor rendimiento
- **Firestore como backend** — catálogo en tiempo real sin necesidad de servidor propio
- **API Route para email** — el envío de correos ocurre en el servidor, sin exponer credenciales al cliente
- **Sitemap generado en build** — `next-sitemap` produce sitemap.xml automáticamente con todas las rutas
- **Datos estructurados** — JSON-LD con tipo `FurnitureStore` para mejorar la visibilidad en buscadores

---

## Licencia

Proyecto privado — © Todo Hogar Factory. Todos los derechos reservados.
