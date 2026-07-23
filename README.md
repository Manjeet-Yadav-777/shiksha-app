# Shiksha App - Frontend Repository

Welcome to the **Shiksha App**, the frontend client for the Shiksha School Management System.

## 🏛 Architecture Overview

This application is a Single Page Application (SPA) built using modern React ecosystems. It is designed to consume the `shiksha-apis` backend and provide intuitive dashboards for Super Admins, School Admins, Teachers, Students, and Parents.

### Core Technologies

- **React 19 & Vite**: Utilizing the latest React features with lightning-fast Vite builds.
- **Mantine UI**: A fully-featured React component library used for a consistent, accessible, and highly aesthetic design system.
- **State Management & Data Fetching**:
  - **Redux**: Used for global UI state management (like auth state, themes).
  - **SWR (stale-while-revalidate)**: Used for remote data fetching, caching, and synchronization with the backend API.
- **React Router**: For client-side routing, protected routes, and navigation.

---

## 📂 Project Structure

```text
src/
├── components/    # Domain-specific components (e.g., Auth, Attendance, Fees, Students)
├── helpers/       # Utility functions, validation schemas (Yup), and date formatters
├── hooks/         # Custom React hooks (e.g., authentication, protected route guards)
├── libs/          # Reusable, core UI building blocks
│   ├── basic/     # Custom UI abstractions (Layouts, Dialogs, Tables, Cards)
│   ├── form/      # Reusable form inputs (Input, DateInputField, SelectInputField)
│   ├── XHR/       # Axios API client setup and download helpers
│   └── ...
├── pages/         # Route-level components mapped directly to URLs (Organized by role)
│   ├── admin/     # School Admin views
│   ├── super-admin/ # Platform Super Admin views (Tenants, Subscriptions)
│   ├── teacher/   # Teacher portal views
│   ├── student/   # Student portal views
│   └── parent/    # Parent portal views
├── routes.tsx     # Centralized routing configuration
├── App.tsx        # Root AppShell and Context Providers
└── main.tsx       # Application entry point
```

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js (v18+)
- Ensure the `shiksha-apis` backend is running locally (usually on port `5001`).

### 1. Installation

Clone the repository and install the frontend dependencies:

```bash
cd shiksha-app
npm install
```

### 2. Environment Variables

Create a `.env` file in the root of `shiksha-app`. This is required so the frontend knows where to make API requests.

```env
VITE_API_URL="http://localhost:5001/api/v1"
```

_(Ensure the port and route prefix match your local backend configuration)._

### 3. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`. Vite provides instant Hot Module Replacement (HMR) for a smooth developer experience.

---

## 📜 Available Scripts

- `npm run dev` - Starts the Vite development server.
- `npm run build` - Compiles TypeScript (`tsc -b`) and bundles the application (`vite build`) into the `dist/` directory for production deployment.
- `npm run preview` - Boots up a local static web server that serves the files from `dist/` to preview the production build locally.
- `npm run lint` - Runs ESLint to check for code quality and standard violations.
- `npm run format` - Runs Prettier to automatically format your code.

---

## 🛠 Code Quality & Git Hooks

We use **Husky**, **lint-staged**, and **Prettier** to enforce code quality automatically.

- Your code will automatically format on `git commit`.
- Commit messages must be 12-100 characters long and should follow conventional commit standards (e.g., `fix: updated navbar responsive layout`).
