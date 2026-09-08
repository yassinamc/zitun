-- OliveFlow PostgreSQL schema (multi-tenant)
-- Note: CREATE EXTENSION pgcrypto may require a superuser once:
--   psql -U postgres -d oliveflow -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('PLATFORM_ADMIN', 'TENANT_OWNER', 'MANAGER', 'EMPLOYEE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE transport_type AS ENUM ('CUSTOMER', 'COMPANY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PAID', 'PARTIAL', 'CREDIT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE oil_movement_type AS ENUM ('PRODUCTION', 'WITHDRAWAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE cash_direction AS ENUM ('IN', 'OUT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  max_customers INT NOT NULL DEFAULT 50,
  max_operations INT NOT NULL DEFAULT 500,
  whatsapp_access BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(40),
  city VARCHAR(100),
  address TEXT,
  plan_id UUID REFERENCES subscription_plans(id),
  status subscription_status NOT NULL DEFAULT 'TRIAL',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  role user_role NOT NULL DEFAULT 'EMPLOYEE',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_transport_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.50,
  company_transport_rate NUMERIC(10, 2) NOT NULL DEFAULT 0.65,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  cin VARCHAR(40),
  phone VARCHAR(40),
  address TEXT,
  credit_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  oil_stock_liters NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);

CREATE TABLE IF NOT EXISTS receptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  reception_number VARCHAR(40) NOT NULL,
  gross_weight_kg NUMERIC(12, 2) NOT NULL,
  tare_weight_kg NUMERIC(12, 2) NOT NULL,
  net_weight_kg NUMERIC(12, 2) NOT NULL,
  transport_type transport_type NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(12, 2) NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'CREDIT',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, reception_number)
);

CREATE INDEX IF NOT EXISTS idx_receptions_tenant ON receptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_receptions_customer ON receptions(customer_id);

CREATE TABLE IF NOT EXISTS production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  reception_id UUID REFERENCES receptions(id),
  tank_label VARCHAR(100),
  oil_liters NUMERIC(12, 2) NOT NULL,
  olives_net_kg NUMERIC(12, 2) NOT NULL,
  yield_percent NUMERIC(8, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oil_stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  movement_type oil_movement_type NOT NULL,
  liters NUMERIC(12, 2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  direction cash_direction NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  label VARCHAR(255) NOT NULL,
  related_reception_id UUID REFERENCES receptions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS reception_seq START 1;
