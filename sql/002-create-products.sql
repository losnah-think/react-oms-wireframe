-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text,
  name text NOT NULL,
  selling_price numeric DEFAULT 0,
  stock integer DEFAULT 0,
  brand text,
  created_at timestamptz DEFAULT now()
);
