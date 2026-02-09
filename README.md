# 🚀 DevShowcase: Community Project Hub

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-Beta-FF69B4?style=for-the-badge&logo=next.js)](https://next-auth.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**DevShowcase** is a premium, full-stack community project showcase platform. It provides a centralized hub for developers to discover, share, and discuss innovative open-source projects.

---

## ✨ Key Features

- **🌐 Project Discovery**: Advanced search and filtering system. Users can explore projects by categories, sort by relevance, and find inspiration instantly.
- **📝 Seamless Submissions**: A streamlined multi-step project submission flow that allows developers to showcase their work with GitHub integration and live demos.
- **🛡️ Robust Admin Portal**: A dedicated dashboard for moderators to review, approve, or reject projects, ensuring high-quality community standards.
- **🔐 Enterprise-Grade Auth**: Secure authentication powered by **NextAuth.js v5**, supporting roles (Admin/User) and protected server-side actions.
- **💬 Community Engagement**: Integrated voting and commenting system (Architecture ready) to foster developer collaboration.
- **🌓 Dynamic UI/UX**: Modern, glassmorphic design system with full **Dark/Light mode** support and optimized mobile responsiveness.

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **State/Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & Infrastructure

- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)

---

## 🚦 Getting Started

### 1. Prerequisites

- Node.js (v20 or higher)
- PostgreSQL Database
- Bun or NPM

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/JaySavani/buildlog-HOE-Assignment.git

# Install dependencies
bun install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=""

# NextAuth (Auth.js)
# Generate a secret: openssl rand -base64 32
AUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Migration

```bash
# Push schema to database
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed
```

### 5. Run Development Server

```bash
bun dev
```

---

## 🔑 Demo Credentials

To test the platform's features, you can use the following pre-seeded account:

- **Admin Account**:
  - **Email**: `admin@gmail.com`
  - **Password**: `Admin123`
  - **Role**: Full access to the Admin Dashboard (approve/reject projects).

---

## 📂 Project Structure

```text
src/
├── app/              # Next.js App Router (Pages & API)
├── actions/          # Type-safe Server Actions (Auth, Projects)
├── components/       # Reusable UI & Layout Components
│   ├── admin/        # Admin-specific interfaces
│   ├── ui/           # Base Shadcn components
│   └── ...           # Feature-specific components
├── lib/              # Utility functions, DB clients, & Schemas
├── types/            # Global TypeScript definitions
└── prisma/           # Database schema & migrations
```

---

Built with ❤️ by [Jay Savani](https://jaysavani.site)
