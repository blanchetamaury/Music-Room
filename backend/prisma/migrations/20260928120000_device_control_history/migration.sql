-- Audit section 6: real delegated playback commands.

-- `previous` needs a way back, so the device playback state keeps the tracks it already
-- played. Empty default keeps the column non-breaking for existing rows.
ALTER TABLE "device_playback_states" ADD COLUMN "history" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
