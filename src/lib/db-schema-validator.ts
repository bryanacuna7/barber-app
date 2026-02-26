/**
 * Database Schema Validator
 *
 * Enforces CLAUDE.md critical rule:
 * "NEVER assume columns of database without verifying against DATABASE_SCHEMA.md"
 *
 * Usage:
 * 1. Before creating migrations
 * 2. Before writing queries
 * 3. Before creating data adapters
 *
 * Created: Session 110 (Pre-Implementation Requirements)
 */

/**
 * Schema definition based on DATABASE_SCHEMA.md
 * Last verified: Session 91 (migrations 001-023)
 */
export const VERIFIED_SCHEMA = {
  businesses: {
    columns: [
      'id',
      'created_at',
      'updated_at',
      'owner_id',
      'name',
      'slug',
      'phone',
      'whatsapp',
      'address',
      'timezone',
      'operating_hours',
      'booking_buffer_minutes',
      'advance_booking_days',
      'is_active',
      'brand_primary_color',
      'brand_logo_url',
      'brand_favicon_url',
    ],
    missing: [], // Columns that DON'T exist
  },

  services: {
    columns: [
      'id',
      'business_id',
      'created_at',
      'updated_at',
      'name',
      'description',
      'category',
      'duration_minutes',
      'price',
      'display_order',
      'is_active',
    ],
    missing: [],
  },

  clients: {
    columns: [
      'id',
      'business_id',
      'created_at',
      'updated_at',
      'name',
      'phone',
      'email',
      'notes',
      'total_visits',
      'total_spent',
      'last_visit_at', // ✅ Exists
      'user_id',
    ],
    missing: [
      'last_activity_at', // ❌ Does NOT exist (use last_visit_at instead)
    ],
  },

  appointments: {
    columns: [
      'id',
      'business_id',
      'client_id',
      'service_id',
      'created_at',
      'updated_at',
      'scheduled_at',
      'duration_minutes',
      'price',
      'status',
      'confirmation_sent_at',
      'reminder_sent_at',
      'client_notes',
      'internal_notes',
      'barber_id',
    ],
    missing: [
      'deposit_paid', // ❌ Not implemented yet
      'deposit_verified_at', // ❌ Not implemented yet
      'deposit_amount', // ❌ Not implemented yet
    ],
  },

  barbers: {
    columns: [
      'id',
      'business_id',
      'created_at',
      'updated_at',
      'name',
      'email',
      'phone',
      'role',
      'is_active',
      'avatar_url',
      'user_id',
      'role_id',
    ],
    missing: [],
  },

  roles: {
    columns: ['id', 'name', 'description', 'created_at', 'updated_at'],
    missing: [],
  },

  permissions: {
    columns: ['id', 'name', 'description', 'resource', 'created_at'],
    missing: [],
  },

  role_permissions: {
    columns: ['role_id', 'permission_id', 'created_at'],
    missing: [],
  },

  subscription_plans: {
    columns: [
      'id',
      'created_at',
      'name',
      'display_name',
      'description',
      'price_usd_monthly',
      'price_colones_monthly',
      'max_barbers',
      'features',
      'is_active',
      'display_order',
    ],
    missing: [],
  },

  business_subscriptions: {
    columns: [
      'id',
      'business_id',
      'plan_id',
      'status',
      'start_date',
      'end_date',
      'trial_ends_at',
      'grace_period_ends_at',
      'created_at',
      'updated_at',
    ],
    missing: [],
  },
} as const

export type TableName = keyof typeof VERIFIED_SCHEMA

/**
 * Verify that a column exists in a table
 *
 * @throws Error if column doesn't exist
 */
export function verifyColumn(table: TableName, column: string): void {
  const schema = VERIFIED_SCHEMA[table]

  if (!schema) {
    throw new Error(`❌ Table '${table}' not found in VERIFIED_SCHEMA. Check DATABASE_SCHEMA.md`)
  }

  if ((schema.missing as readonly string[]).includes(column)) {
    throw new Error(
      `❌ Column '${column}' does NOT exist in table '${table}'. ` +
        `This is a future feature not yet implemented. ` +
        `See DATABASE_SCHEMA.md for current schema.`
    )
  }

  if (!(schema.columns as readonly string[]).includes(column)) {
    throw new Error(
      `❌ Column '${column}' not found in table '${table}'. ` +
        `Available columns: ${schema.columns.join(', ')}. ` +
        `Check DATABASE_SCHEMA.md for current schema.`
    )
  }
}

/**
 * Verify multiple columns at once
 *
 * @throws Error if any column doesn't exist
 */
export function verifyColumns(table: TableName, columns: string[]): void {
  columns.forEach((column) => verifyColumn(table, column))
}

/**
 * Safe column check (returns boolean instead of throwing)
 */
export function columnExists(table: TableName, column: string): boolean {
  try {
    verifyColumn(table, column)
    return true
  } catch {
    return false
  }
}

/**
 * Get all available columns for a table
 */
export function getAvailableColumns(table: TableName): string[] {
  return [...(VERIFIED_SCHEMA[table]?.columns || [])]
}

/**
 * Get columns that DON'T exist (future features)
 */
export function getMissingColumns(table: TableName): string[] {
  return [...(VERIFIED_SCHEMA[table]?.missing || [])]
}

/**
 * Validate a Supabase query before execution
 *
 * @example
 * ```ts
 * validateQuery('appointments', ['deposit_paid']) // ❌ Throws error
 * validateQuery('clients', ['last_visit_at']) // ✅ Passes
 * ```
 */
export function validateQuery(table: TableName, columns: string[]): void {
  verifyColumns(table, columns)
  console.log(`✅ Schema validation passed for ${table}: ${columns.join(', ')}`)
}

/**
 * Development helper: Log schema info
 */
export function logSchemaInfo(table: TableName): void {
  const schema = VERIFIED_SCHEMA[table]
  if (!schema) {
    console.error(`❌ Table '${table}' not found in schema`)
    return
  }

  console.group(`📋 Schema for table: ${table}`)
  console.log('✅ Available columns:', schema.columns)
  if (schema.missing.length > 0) {
    console.log('❌ Missing columns (future features):', schema.missing)
  }
  console.groupEnd()
}
