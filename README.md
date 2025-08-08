# Product Safety Insights

A Next.js application that provides cosmetic product safety information, helping users check product safety status and discover safer alternatives.

## Technology Stack

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM (Type-safe SQL toolkit)
- **Styling**: Tailwind CSS

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── api/               # API routes
│   │   └── products/      # Product-related API endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── search/           # Search-related components
│   ├── product/          # Product-related components
│   └── layout/           # Layout components
├── lib/                  # Utility functions and configurations
│   ├── utils.ts          # shadcn/ui utilities
│   ├── db/               # Database configuration
│   │   ├── index.ts      # Drizzle client setup
│   │   ├── schema.ts     # Database schema definitions
│   │   └── queries.ts    # Database queries
│   └── providers.tsx     # React Query provider
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
    └── product.ts        # Product-related types
```

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.local` and add your Neon database URL:

   ```bash
   DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** to view the application.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features (Planned)

- Product safety search by name or notification number
- Color-coded risk indicators (Safe/Unsafe/Unknown)
- Cancellation reason display for unsafe products
- Safer product alternatives suggestions
- Responsive design with accessibility support

## Development Status

This project is currently in development. The foundation has been set up with:

- ✅ Next.js 15 with TypeScript and App Router
- ✅ Tailwind CSS and shadcn/ui components
- ✅ React Query for state management
- ✅ Neon database with Drizzle ORM configuration
- ✅ Basic project structure and API routes

Next steps involve implementing the core functionality according to the project specifications.

## Database Setup

The project includes data loading scripts in the `scripts/` directory.

To set up the database:

1. Create a Neon database and get your connection string
2. Update the scripts to use Drizzle ORM
3. Run the migration scripts to create the schema
4. Load the CSV data using the updated scripts

## Additional Scripts

- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Apply migrations to database
- `npm run db:studio` - Open Drizzle Studio for database browsing

