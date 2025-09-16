-- Add external_sku column to products to store original marketplace SKU
ALTER TABLE IF EXISTS products
ADD COLUMN IF NOT EXISTS external_sku text;

-- optional index for faster lookups by external_sku
CREATE INDEX IF NOT EXISTS idx_products_external_sku ON products (external_sku);
