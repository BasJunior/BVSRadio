# Database Migration Guide

## Overview
This document describes how to set up and manage database migrations for the BVSRadio platform.

## Initial Setup

### 1. Create the Database
```bash
# Using psql
createdb bvsradio

# Or via SQL
psql -U postgres
CREATE DATABASE bvsradio;
```

### 2. Run Initial Migration
```bash
cd backend
psql -d bvsradio -f migrations/001_initial_schema.sql
```

## Migration Files

Migrations are located in `backend/migrations/` and follow the naming convention:
```
XXX_description.sql
```

Where `XXX` is a three-digit sequential number.

### Current Migrations

#### 001_initial_schema.sql
Creates all base tables:
- users, user_profiles
- products, shopping_carts, cart_items
- orders, order_items
- radio_stations, tracks, playlists
- messages, activities
- user_follows, listening_history

## Creating New Migrations

1. Create a new file with the next sequential number:
   ```bash
   touch backend/migrations/002_add_new_feature.sql
   ```

2. Write your migration SQL:
   ```sql
   -- Migration: Description
   -- Version: 002
   
   ALTER TABLE users ADD COLUMN preferences JSONB;
   CREATE INDEX idx_users_preferences ON users USING GIN (preferences);
   ```

3. Test the migration:
   ```bash
   psql -d bvsradio_test -f backend/migrations/002_add_new_feature.sql
   ```

4. Document the migration in this file

## Rolling Back Migrations

For each migration, consider creating a corresponding rollback file:
```bash
backend/migrations/002_add_new_feature_rollback.sql
```

Example rollback:
```sql
-- Rollback: Add new feature
-- Version: 002

DROP INDEX IF EXISTS idx_users_preferences;
ALTER TABLE users DROP COLUMN IF EXISTS preferences;
```

## Best Practices

1. **Always backup** before running migrations in production
2. **Test migrations** on a copy of production data
3. **Make migrations reversible** when possible
4. **Keep migrations small** and focused on one change
5. **Document** what each migration does
6. **Use transactions** to ensure all-or-nothing execution

## Migration Template

```sql
-- Migration: [Description]
-- Version: [XXX]
-- Date: [YYYY-MM-DD]
-- Author: [Name]

BEGIN;

-- Your migration code here

COMMIT;
```

## Checking Migration Status

To see which migrations have been applied, you can create a migrations table:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);
```

Then track each migration:
```sql
INSERT INTO schema_migrations (version, description) 
VALUES (1, 'Initial schema setup');
```

## Common Migration Tasks

### Adding a Column
```sql
ALTER TABLE table_name 
ADD COLUMN column_name TYPE DEFAULT value;
```

### Adding an Index
```sql
CREATE INDEX idx_table_column 
ON table_name(column_name);
```

### Creating a New Table
```sql
CREATE TABLE IF NOT EXISTS new_table (
    id SERIAL PRIMARY KEY,
    -- columns
);
```

### Modifying a Column
```sql
ALTER TABLE table_name 
ALTER COLUMN column_name TYPE new_type;
```

## Production Deployment

1. Schedule maintenance window if needed
2. Backup database:
   ```bash
   pg_dump bvsradio > backup_$(date +%Y%m%d).sql
   ```
3. Run migration:
   ```bash
   psql -d bvsradio -f migrations/XXX_migration.sql
   ```
4. Verify changes:
   ```bash
   psql -d bvsradio -c "\d table_name"
   ```
5. Monitor application logs

## Troubleshooting

### Migration Failed
1. Check PostgreSQL logs
2. Review error message
3. Rollback if necessary
4. Fix migration script
5. Retry

### Data Inconsistency
1. Stop application
2. Restore from backup
3. Fix migration
4. Retry migration

## Future Improvements

- Automated migration runner script
- Migration versioning system
- Automated rollback capabilities
- Migration testing framework
