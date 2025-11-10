# Mudanzingo Dashboard SPA

Dashboard SPA construido con React + Vite + TypeScript. Incluye TailwindCSS, React Router, TanStack Query, Amplify Auth (Hosted UI con Authorization Code Flow + PKCE), tema claro/oscuro, componentes UI simples y manejo de productos.

## Características
- Autenticación Cognito Hosted UI (AWS Amplify Auth)
- Layout con sidebar y topbar
- Tema claro/oscuro persistente en `localStorage`
- React Router y rutas protegidas
- TanStack Query para datos y caché
- Formulario con React Hook Form + Zod
- Toasts para feedback (sonner)
- Cliente API que agrega Bearer Token automáticamente

## Estructura
```
apps/web/
  index.html
  package.json
  tsconfig.json
  tailwind.config.ts
  postcss.config.js
  src/
    main.tsx
    router.tsx
    amplify.ts
    index.css
    auth/
      useAuth.ts
      ProtectedRoute.tsx
    layout/
      AppLayout.tsx
    api/
      client.ts
      products.ts
    pages/
      login.tsx
      callback.tsx
      dashboard.tsx
      products.tsx
    components/
      ui/
        Button.tsx
        Input.tsx
        Modal.tsx
        Table.tsx
```

## Variables de entorno
Ver `.env.example` (copiar a `.env` dentro de `apps/web/`).

## Scripts
Dentro de `apps/web`:
- `npm run dev` inicia el servidor de desarrollo.
- `npm run build` construye la aplicación.
- `npm run preview` sirve la build.
- `npm run typecheck` revisa tipos.

## Inicio rápido
```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
```
Abrir `http://localhost:5173`.

## Notas
- Sustituye los valores de `.env` con los de tu User Pool y dominio Hosted UI.
- El módulo de productos usa datos simulados; reemplaza por tus endpoints reales.
- Si ajustas rutas de callback/redirect, actualiza Cognito y variables.

## Próximos pasos sugeridos
- Integrar API real y manejo de refresco de tokens.
- Añadir pruebas unitarias y e2e.
- Mejorar accesibilidad de los componentes y estados de foco.
