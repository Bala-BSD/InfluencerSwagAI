# Content SwaG - AI Content Studio

## Overview

Content SwaG is an AI-powered content creation IDE designed for influencers and content creators. It provides a comprehensive workflow for generating production-ready social media content, including strategic content ideas, video scripts, hashtag strategies, and trend insights.

**Current Phase (Phase 2 - Completed)**: Multi-project management system with PostgreSQL persistence, project creation wizard, sidebar navigation, and project-scoped content generation. Users can create and manage multiple product projects, each with isolated content packages.

**Phase 1 (Completed)**: Single-project content generation with multi-step wizard for product definition, campaign objectives, and content style selection. Full AI-powered content package generation with ideas, scripts, hashtags, and trends.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type safety and component-based architecture
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod for form validation and schema validation

**UI Framework:**
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design system
- Design approach follows Linear + Notion hybrid productivity design principles
- Inter font family for consistent typography
- Custom CSS variables for theming (light/dark mode support)

**Component Structure:**
- Multi-step wizard interface for content generation workflow (4 steps)
- Modular component library including content idea cards, script displays, hashtag strategies, and trend insights
- Reusable UI components from Shadcn/ui (buttons, cards, forms, dialogs, tabs, etc.)
- Path aliases configured for clean imports (`@/`, `@shared/`, `@assets/`)

**State Management:**
- React Query for API data fetching, caching, and synchronization
- Local component state for form data and UI interactions
- No global state management library (Redux, Zustand) - relying on React Query and component state

### Backend Architecture

**Technology Stack:**
- Express.js server with TypeScript
- Node.js runtime environment
- ESM module system (type: "module" in package.json)
- Custom middleware for request logging and JSON parsing

**API Design:**
- RESTful API endpoints under `/api` prefix
- **Project Management:**
  - POST `/api/projects` - Create new project
  - GET `/api/projects` - List all projects
  - GET `/api/projects/:id` - Get single project
  - PATCH `/api/projects/:id` - Update project metadata
  - DELETE `/api/projects/:id` - Delete project (cascade deletes content)
- **Content Generation:**
  - POST `/api/content/generate` - Generate complete content package (requires `projectId`)
  - GET `/api/content/package?projectId=...` - Retrieve project-scoped content package
  - POST `/api/content/script` - Generate script for specific idea (requires `projectId`)
  - POST `/api/content/hashtags` - Generate hashtag strategy for idea (requires `projectId`)

**AI Integration:**
- OpenRouter-compatible API through Replit's AI Integrations service
- Default model: `meta-llama/llama-3.3-70b-instruct`
- Retry logic with exponential backoff (p-retry library) for rate limit handling
- Concurrent request limiting (p-limit) to prevent API quota violations
- Temperature setting: 0.8 for creative content generation
- Max tokens: 8192 for comprehensive responses

**Prompt Engineering Strategy:**
- "Everything as Prompt Engineering" approach - all functionality implemented through structured prompts
- Specialized prompt templates for:
  - Content idea generation (30+ ideas across funnel stages)
  - Trend insights (without external API dependencies)
  - Script generation with scene breakdowns
  - Hashtag strategy creation
- Combinatorial creativity formulas embedded in prompts
- JSON output formatting enforced through prompt instructions

### Data Storage Solutions

**Current Implementation:**
- PostgreSQL database via DatabaseStorage class (replaced MemStorage in Phase 2)
- Neon serverless database with WebSocket connection pooling
- Project-scoped content isolation with cascade deletions
- Full persistence across server restarts

**Database Schema (Drizzle ORM):**
- PostgreSQL dialect configured via Drizzle Kit
- Schema defined in `shared/schema.ts` using Drizzle's pgTable
- **Core Tables:**
  - `content_projects`: Product info, targeting, campaign params, timestamps
  - `content_packages`: Ideas and trend insights (one per project)
  - `scripts`: Video scripts for specific content ideas
  - `hashtag_strategies`: Hashtag strategies for specific ideas
  - `user_preferences`: Favorited ideas and user ratings (future use)
  - `content_variants`: A/B test variants of content ideas (future use)
  - `competitor_analyses`: Reverse-engineered competitor insights (future use)
  - `calendar_entries`: Scheduled content with publish dates (future use)
- **Relationships:**
  - All dependent tables reference `content_projects.id` with CASCADE delete
  - Project isolation enforced via `projectId` foreign keys
- Neon Database serverless driver configured
- Migration via `npm run db:push` (no manual SQL migrations)

**Data Models:**
- Zod schemas for runtime validation
- Drizzle-Zod integration for type-safe database operations
- Shared schema between frontend and backend via `@shared` alias
- TypeScript types derived from Zod schemas

**Storage Layer:**
- `IStorage` interface defines all CRUD operations
- `DatabaseStorage` implementation in `server/db-storage.ts`
- Project-scoped methods: `getContentPackage(projectId)`, `saveContentPackage(projectId, data)`
- Cascade delete via `deleteProject(id)` removes all related content

### Authentication and Authorization

**Current State:**
- No authentication system implemented
- No user management or session handling
- Application operates in single-user mode
- Cookie-based session infrastructure present (connect-pg-simple) but unused

**Future Considerations:**
- Session store configured for PostgreSQL (connect-pg-simple package included)
- Infrastructure ready for user authentication implementation

## External Dependencies

### Third-Party Services

**AI Service:**
- Replit AI Integrations (OpenRouter-compatible endpoint)
- Environment variables: `AI_INTEGRATIONS_OPENROUTER_BASE_URL`, `AI_INTEGRATIONS_OPENROUTER_API_KEY`
- No direct OpenRouter account required - handled by Replit platform

**Database:**
- Neon Database (serverless PostgreSQL)
- Environment variable: `DATABASE_URL`
- Connection via `@neondatabase/serverless` driver
- Database must be provisioned before application starts

### Key NPM Packages

**Frontend:**
- `@tanstack/react-query` - Server state management
- `@radix-ui/*` - Headless UI component primitives (20+ packages)
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `tailwindcss` - Utility-first CSS framework
- `wouter` - Lightweight routing
- `date-fns` - Date utility functions
- `embla-carousel-react` - Carousel component

**Backend:**
- `express` - Web server framework
- `drizzle-orm` - TypeScript ORM
- `drizzle-kit` - Database migration tool
- `openai` - OpenAI/OpenRouter SDK
- `p-retry` - Retry logic with backoff
- `p-limit` - Concurrency control

**Development:**
- `vite` - Build tool and dev server
- `tsx` - TypeScript execution for development
- `esbuild` - Production bundling
- Replit-specific plugins (cartographer, dev-banner, runtime-error-modal)

### Build and Deployment

**Development:**
- `npm run dev` - Starts development server with tsx
- Hot module replacement via Vite
- TypeScript checking: `npm run check`

**Production:**
- `npm run build` - Builds client with Vite, bundles server with esbuild
- `npm run start` - Runs production server from dist directory
- Client output: `dist/public`
- Server output: `dist/index.js`

**Database:**
- `npm run db:push` - Push schema changes to database via Drizzle Kit