# NatureMades

Full-stack e-commerce platform for handcrafted, nature-inspired products. Built with React, Vite, TypeScript, Tailwind CSS, Express, and MongoDB.

## Project Structure

```
nature-mades/
├── frontend/             # Vite + React + TypeScript + Tailwind frontend application
│   ├── src/              # Components, pages, hooks, services, styles
│   ├── public/           # Static assets, icons, logos
│   ├── index.html        # HTML entry point
│   ├── package.json      # Frontend dependencies & scripts
│   ├── vite.config.ts    # Vite configuration & backend proxy
│   └── tsconfig.json     # Frontend TypeScript configuration
│
├── backend/              # Node.js + Express + TypeScript + MongoDB API server
│   ├── src/              # Controllers, models, routes, middleware, db seed
│   ├── .env.example      # Environment variables template
│   ├── package.json      # Backend dependencies & scripts
│   └── tsconfig.json     # Backend TypeScript configuration
│
├── package.json          # Root scripts to orchestrate frontend & backend
└── README.md
```

## Getting Started

### 1. Install Dependencies

From the project root:
```bash
npm run install:all
```

Or install individually:
```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Environment Setup

Configure environment variables for the backend:
```bash
cd backend
cp .env.example .env
```
Ensure your `MONGODB_URI` and `JWT_SECRET` are configured in `backend/.env`.

### 3. Run Development Servers

Run both frontend and backend concurrently from the root:
```bash
npm run dev
```

Or run them individually:
- **Frontend only**: `npm run dev:frontend` (or `cd frontend && npm run dev`) -> runs on `http://localhost:5173`
- **Backend only**: `npm run dev:backend` (or `cd backend && npm run dev`) -> runs on `http://localhost:5000`

### 4. Build for Production

Build both frontend and backend:
```bash
npm run build
```

Or individually:
- `npm run build:frontend`
- `npm run build:backend`

### 5. Seed Database

To seed initial categories and products into MongoDB:
```bash
npm run seed
```
