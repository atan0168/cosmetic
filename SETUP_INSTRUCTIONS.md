# Database Setup Instructions

## Quick Setup (Recommended)

1. **Set up your Neon Database**
   - Go to [Neon Console](https://console.neon.tech/)
   - Create a new project or use an existing one
   - Copy your connection string from the dashboard
   - Update the `DATABASE_URL` in `.env.local` with your actual connection string

2. **Run the complete setup**
   ```bash
   npm run db:setup
   ```
   
   This single command will:
   - Apply all database migrations
   - Set up full-text search indexes and triggers
   - Load CSV data from the `data/` directory

## Manual Setup (Advanced)

If you prefer to run each step manually:

1. **Apply Database Migrations**
   ```bash
   npm run db:migrate
   ```

2. **Load CSV Data**
   ```bash
   npm run db:load
   ```

3. **Set up Full-Text Search** (run the SQL in `scripts/setup_fulltext_search.sql`)

## Available Scripts

- `npm run db:generate` - Generate new migrations from schema changes
- `npm run db:migrate` - Apply pending migrations
- `npm run db:push` - Push schema changes directly (development only)
- `npm run db:studio` - Open Drizzle Studio to browse your data
- `npm run db:load` - Load CSV data into the database
- `npm run db:setup` - Complete database setup (migrations + full-text search + data loading)

## Troubleshooting

- Make sure your `DATABASE_URL` is correctly set in `.env.local`
- Ensure the CSV files exist in the `data/` directory:
  - `data/cosmetic_notifications.csv`
  - `data/cosmetic_notifications_cancelled.csv`
- Check the console output for any error messages during setup