-- ============================================
-- COPIE-COLLE CE SCRIPT DANS SUPABASE
-- (SQL Editor > New Query > Coller > Run)
-- ============================================

-- Table des actifs crypto
CREATE TABLE IF NOT EXISTS assets (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  objective TEXT DEFAULT '',
  color TEXT DEFAULT '#00d2ff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des investissements mensuels
CREATE TABLE IF NOT EXISTS investments (
  id BIGSERIAL PRIMARY KEY,
  asset_id BIGINT REFERENCES assets(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 0 AND month <= 11),
  year INTEGER NOT NULL,
  investment DECIMAL(12,2) DEFAULT 0,
  buy_price DECIMAL(18,8) DEFAULT 0,
  quantity DECIMAL(18,8) DEFAULT 0,
  stop_loss DECIMAL(18,8) DEFAULT 0,
  take_profit DECIMAL(18,8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_investments_year ON investments(year);
CREATE INDEX IF NOT EXISTS idx_investments_asset ON investments(asset_id);

-- Row Level Security (accès ouvert pour usage personnel)
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on assets" ON assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on investments" ON investments FOR ALL USING (true) WITH CHECK (true);
