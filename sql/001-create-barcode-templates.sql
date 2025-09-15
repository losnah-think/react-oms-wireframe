-- Create barcode_templates table
CREATE TABLE IF NOT EXISTS public.barcode_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value text NOT NULL,
  created_at timestamptz DEFAULT now()
);
