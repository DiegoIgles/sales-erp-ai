# 🧠 Sales ERP with AI Chatbot – by Diego Iglesias

## 🚀 Descripción

Este proyecto es un ERP minimalista con inteligencia artificial, diseñado para gestionar productos, pedidos y la configuración empresarial, mientras ofrece a los clientes una experiencia conversacional inteligente mediante el Vercel AI SDK.

Desarrollado en solo un fin de semana como reto técnico, este sistema demuestra habilidades de integración full-stack y AI.

---

## 🧩 Tech Stack

- **Frontend:** Next.js 15, TailwindCSS, TypeScript, shadcn/ui
- **Backend:** Next.js API Routes (App Router)
- **Base de datos:** Supabase (PostgreSQL) + Prisma ORM
- **IA:** Vercel AI SDK (`@ai-sdk/openai`)
- **Validación:** Zod
- **Despliegue:** Vercel

---

## 📦 Características Principales

### ✅ Panel Administrativo (`/admin`)
- CRUD de productos con imágenes, stock y categorías
- Gestión de pedidos con cambio de estado
- Configuración del asistente de IA (nombre, mensaje, personalidad)
- Dashboard con resumen del negocio

### 🤖 Chat IA (`/chat`)
- Buscar productos por nombre o categoría
- Mostrar detalles completos de productos
- Ver historial de pedidos por correo
- Crear pedidos (verificando stock y actualizando inventario)
- Personalidad dinámica basada en la configuración empresarial

### 🛡️ Seguridad
- Validación estricta con `zod`
- Prevención de prompt injection
- No permite crear productos desde el chat
- Control de stock y manejo de errores como productos inexistentes

---

## 🛠️ Instalación y Ejecución Local

1. Clona el repositorio:

```bash
git clone https://github.com/tuusuario/sales-erp-ai.git
cd sales-erp-ai
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` en la raíz con el siguiente contenido:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://znwnefxkeygqqfgbfssa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Prisma
DATABASE_URL="postgresql://postgres:_axcvbnm12345678AXCVBNM@db.znwnefxkeygqqfgbfssa.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:_axcvbnm12345678AXCVBNM@db.znwnefxkeygqqfgbfssa.supabase.co:5432/postgres"

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
```

4. Aplica las migraciones de Prisma:

```bash
npx prisma generate
npx prisma migrate deploy
```

5. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

6. Abre en tu navegador:

```
http://localhost:3000
```
