-- Full-text search setup for products table
-- Run this SQL script in your Neon database console after running migrations

-- Add a search vector column for full-text search
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create a GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(search_vector);

-- Update the search vector for existing data
UPDATE products SET search_vector = to_tsvector('english', name || ' ' || notif_no);

-- Create a function to automatically update search_vector on insert/update
CREATE OR REPLACE FUNCTION update_products_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = to_tsvector('english', NEW.name || ' ' || NEW.notif_no);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update search_vector on insert/update
DROP TRIGGER IF EXISTS products_search_vector_update ON products;
CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_products_search_vector();

-- Create additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_notif_no_gin ON products USING gin(to_tsvector('english', notif_no));

-- Create a function for search queries
CREATE OR REPLACE FUNCTION search_products(search_query text, result_limit integer DEFAULT 10)
RETURNS TABLE(
  id integer,
  notif_no varchar(255),
  name varchar(255),
  category varchar(255),
  status varchar(50),
  reason_for_cancellation text,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.notif_no,
    p.name,
    p.category,
    p.status,
    p.reason_for_cancellation,
    ts_rank(p.search_vector, plainto_tsquery('english', search_query)) as rank
  FROM products p
  WHERE p.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, p.name ASC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;