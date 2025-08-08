# Technology Stack

## Core Technologies
- **Database**: Neon (Serverless PostgreSQL from Vercel)
- **ORM**: Drizzle ORM (Type-safe SQL toolkit)
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Frontend Framework**: React/Next.js (recommended for shadcn/ui)
- **Styling**: Tailwind CSS (required for shadcn/ui)
- **TypeScript**: Strongly recommended for type safety

## Database Operations
Use Drizzle ORM with Neon database:

### Drizzle Setup Commands
```bash
# Install Drizzle dependencies
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Initialize Drizzle configuration
# Create drizzle.config.ts in project root

# Generate migrations
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Push schema changes directly (development)
npx drizzle-kit push

# Open Drizzle Studio (database browser)
npx drizzle-kit studio
```

## UI Development
Use shadcn/ui for all UI components:

### shadcn/ui Commands
```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form

# Add multiple components
npx shadcn-ui@latest add button card form input
```

## Common Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

## Database Schema Management
```bash
# Create new migration
npx drizzle-kit generate --name <migration_name>

# Apply pending migrations
npx drizzle-kit migrate

# Reset database (development only)
# Drop and recreate all tables
npx drizzle-kit drop

# Introspect existing database
npx drizzle-kit introspect
```

## Configuration Files
- `package.json` - Dependencies and scripts
- `drizzle.config.ts` - Drizzle ORM configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration
- `.env.local` - Environment variables (Neon database URL, etc.)
- `src/lib/db/schema.ts` - Database schema definitions
- `src/lib/db/index.ts` - Database connection and client setup
## 
Neon Database Setup

### Environment Variables
```bash
# .env.local
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require"
```

### Drizzle Configuration Example
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Database Connection Setup
```typescript
// src/lib/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Schema Definition Example
```typescript
// src/lib/db/schema.ts
import { pgTable, serial, text, timestamp, index } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  notificationNumber: text('notification_number'),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  nameIdx: index('name_idx').on(table.name),
  notificationIdx: index('notification_idx').on(table.notificationNumber),
}));
```

## Migration Workflow
1. Define schema changes in `src/lib/db/schema.ts`
2. Generate migration: `npx drizzle-kit generate`
3. Review generated SQL in `drizzle/` directory
4. Apply migration: `npx drizzle-kit migrate`
5. Commit both schema and migration files

## Development vs Production
- **Development**: Use `npx drizzle-kit push` for rapid prototyping
- **Production**: Always use migrations (`generate` → `migrate`)
- **Local Testing**: Use Neon's branching feature for isolated testing

## Neon-Specific Features
- **Branching**: Create database branches for feature development
- **Autoscaling**: Automatic scaling based on usage
- **Connection Pooling**: Built-in connection pooling
- **Read Replicas**: Available for performance optimization