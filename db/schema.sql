-- Salon Management App Database Schema

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  preferred_styles TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create service_visits table with foreign key to customers
CREATE TABLE IF NOT EXISTS service_visits (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(50) NOT NULL,
  visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  services_taken TEXT[],
  notes TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Create index on customer phone number for quick lookups
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number);

-- Create index on customer name for search functionality
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);