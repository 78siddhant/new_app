// Database connection setup for Netlify DB (Neon Postgres)
const { neon } = require('@netlify/neon');
const fs = require('fs');
const path = require('path');

// Initialize database connection
const initializeDatabase = async () => {
  try {
    // Check if DATABASE_URL environment variable exists (provided by Netlify)
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL environment variable not found. Database functionality will be limited.');
      return null;
    }

    // Create SQL client using Neon serverless driver
    const sql = neon(process.env.DATABASE_URL);
    
    // Load and execute schema.sql to create tables if they don't exist
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema SQL to create tables
    await sql(schemaSQL);
    
    console.log('Database initialized successfully');
    return sql;
  } catch (error) {
    console.error('Error initializing database:', error);
    return null;
  }
};

module.exports = { initializeDatabase };