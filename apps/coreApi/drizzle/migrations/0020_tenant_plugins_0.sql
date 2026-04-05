-- Tenant plugin enablement table
-- tenants.id is stored as UUID text in the current schema, so tenant_id matches that type.
CREATE TABLE IF NOT EXISTS tenant_plugins (
  tenant_id VARCHAR(128) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plugin_name VARCHAR(64) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT tenant_plugins_pk PRIMARY KEY (tenant_id, plugin_name)
);

CREATE INDEX IF NOT EXISTS tenant_plugins_enabled_idx
  ON tenant_plugins (tenant_id, enabled);

CREATE INDEX IF NOT EXISTS tenant_plugins_plugin_name_idx
  ON tenant_plugins (plugin_name);

ALTER TABLE tenant_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_plugins FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tenant_plugins'
      AND policyname = 'tenant_plugins_tenant_isolation'
  ) THEN
    CREATE POLICY tenant_plugins_tenant_isolation
      ON tenant_plugins
      USING (tenant_id::text = COALESCE(current_setting('app.current_tenant', true), ''))
      WITH CHECK (tenant_id::text = COALESCE(current_setting('app.current_tenant', true), ''));
  END IF;
END
$$;
