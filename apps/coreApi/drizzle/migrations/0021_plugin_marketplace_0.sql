-- Plugin marketplace registry and version tables
CREATE TABLE IF NOT EXISTS plugin_registry (
  id VARCHAR(128) PRIMARY KEY,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  author_name VARCHAR(100),
  author_email VARCHAR(255),
  latest_version VARCHAR(20) NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plugin_registry_display_name_idx
  ON plugin_registry (display_name);

CREATE INDEX IF NOT EXISTS plugin_registry_public_idx
  ON plugin_registry (is_public);

CREATE TABLE IF NOT EXISTS plugin_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id VARCHAR(128) NOT NULL REFERENCES plugin_registry(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  manifest JSONB NOT NULL,
  bundle_url VARCHAR(500) NOT NULL,
  server_package VARCHAR(500) NOT NULL,
  min_platform_version VARCHAR(20),
  changelog TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT plugin_versions_plugin_version_uniq UNIQUE (plugin_id, version)
);

CREATE INDEX IF NOT EXISTS plugin_versions_plugin_published_idx
  ON plugin_versions (plugin_id, published_at);

ALTER TABLE tenant_plugins ADD COLUMN IF NOT EXISTS installed_version VARCHAR(20);
ALTER TABLE tenant_plugins ADD COLUMN IF NOT EXISTS auto_update BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE tenant_plugins ADD COLUMN IF NOT EXISTS installed_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE plugin_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_registry FORCE ROW LEVEL SECURITY;
ALTER TABLE plugin_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_versions FORCE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'plugin_registry'
      AND policyname = 'plugin_registry_public_read'
  ) THEN
    CREATE POLICY plugin_registry_public_read
      ON plugin_registry
      FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'plugin_versions'
      AND policyname = 'plugin_versions_public_read'
  ) THEN
    CREATE POLICY plugin_versions_public_read
      ON plugin_versions
      FOR SELECT
      USING (true);
  END IF;
END
$$;
