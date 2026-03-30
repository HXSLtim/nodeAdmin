-- IM message edit/delete/read-receipt support
-- Adds: edited_at, deleted_at columns to messages; new message_reads table

-- 1. Add edited_at and deleted_at to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Create message_reads for tracking last-read per user per conversation
CREATE TABLE IF NOT EXISTS message_reads (
  tenant_id   VARCHAR(64)  NOT NULL,
  conversation_id VARCHAR(128) NOT NULL,
  user_id     VARCHAR(128) NOT NULL,
  last_read_sequence_id BIGINT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tenant_id, conversation_id, user_id)
);

-- 3. Index for quick unread count queries
CREATE INDEX IF NOT EXISTS message_reads_tenant_user_idx
  ON message_reads (tenant_id, user_id, updated_at);
