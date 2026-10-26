# Calculadora de Madurez TRL

Herramienta web interactiva para diagnosticar el **nivel de madurez tecnológica (TRL)** de proyectos de investigación y desarrollo. El usuario elige el tipo de tecnología, responde un cuestionario por dimensiones y obtiene un resultado con su nivel TRL, un radar por dimensión y recomendaciones.

Incluye un **panel de administración** (`/admin`) protegido con Clerk para revisar las evaluaciones registradas.

## Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vitejs.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) (gráficos) y [lucide-react](https://lucide.dev/) (íconos)
- [Clerk](https://clerk.com/) (autenticación del panel admin)
- Despliegue en [Vercel](https://vercel.com/); backend en Railway

## Requisitos

- Node.js 18 o superior
- npm

## Instalación

```bash
git clone https://github.com/luxr-mngr/trl-diagnostic-web.git
cd trl-diagnostic-web
npm install
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz (no se sube al repo):

```env
# Publishable key de Clerk (Clerk Dashboard → API Keys). Empieza con pk_test_ o pk_live_.
VITE_CLERK_PUBLISHABLE_KEY=

# URL del backend. Opcional: si se deja vacía se usa la URL de producción por defecto.
VITE_API_BASE_URL=
```

> Todo lo que empieza con `VITE_` queda expuesto en el JavaScript público. **Nunca** pongas aquí una secret key (`sk_...`).

## Scripts

| Comando           | Descripción                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build`   | Chequeo de tipos y build de producción en `dist/` |
| `npm run preview` | Sirve localmente el build de `dist/`             |

## Estructura

```
├── App.tsx                 # Flujo principal (pantallas del diagnóstico)
├── index.tsx               # Entrada; carga el panel admin en /admin de forma diferida
├── components/             # Pantallas y componentes de UI
│   └── admin/              # Panel de administración (Clerk)
├── hooks/useTRLManager.ts  # Estado y lógica del flujo de evaluación
├── services/trlApi.ts      # Cliente del backend
├── utils/                  # Textos de dimensiones, radar, caché de resultados
├── constants.ts            # Colores y tipos de tecnología
└── types.ts                # Tipos compartidos
```

Documentación adicional del contrato con el backend:

- [`REQUERIMIENTO_BACKEND.md`](REQUERIMIENTO_BACKEND.md)
- [`FRONTEND_INTEGRATION 18-09.md`](<FRONTEND_INTEGRATION 18-09.md>)

## Despliegue

El proyecto está preparado para Vercel (`vercel.json` reescribe todas las rutas a `index.html` para que funcione `/admin`).

1. Importa el repositorio en Vercel (framework: Vite).
2. Configura `VITE_CLERK_PUBLISHABLE_KEY` y, si aplica, `VITE_API_BASE_URL` en las variables de entorno del proyecto.
3. Build command: `npm run build` · Output directory: `dist`.
