// Salon Management App - Server
const express = require('express');
const path = require('path');
const { initializeDatabase } = require('./db');
const CustomerService = require('./services/customerService');
const CustomerServiceDB = require('./services/customerServiceDB');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Customer Service - will be set after database initialization
let customerService;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database and customer service
(async () => {
  try {
    // Try to initialize database connection
    const sqlClient = await initializeDatabase();
    
    if (sqlClient) {
      // If database connection is successful, use DB version of CustomerService
      console.log('Using database-backed CustomerService');
      customerService = new CustomerServiceDB(sqlClient);
    } else {
      // If database connection fails, fall back to file-based CustomerService
      console.log('Database connection failed. Using file-based CustomerService');
      customerService = new CustomerService();
    }
  } catch (error) {
    console.error('Error initializing services:', error);
    // Fall back to file-based CustomerService
    customerService = new CustomerService();
  }
})();

// API Routes

// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({ message: 'Error retrieving customers' });
  }
});

// Get customer by ID
app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error(`Error getting customer ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error retrieving customer' });
  }
});

// Search customers by name or phone
app.get('/api/customers/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const results = await customerService.searchCustomersByName(term);
    res.json(results);
  } catch (error) {
    console.error(`Error searching customers with term ${req.params.term}:`, error);
    res.status(500).json({ message: 'Error searching customers' });
  }
});

// Add new customer
app.post('/api/customers', async (req, res) => {
  try {
    const { name, phoneNumber, preferredStyles, notes } = req.body;
    
    if (!name || !phoneNumber) {
      return res.status(400).json({ message: 'Name and phone number are required' });
    }
    
    const newCustomer = await customerService.addCustomer(name, phoneNumber, preferredStyles, notes);
    
    if (!newCustomer) {
      return res.status(500).json({ message: 'Error creating customer' });
    }
    
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ message: 'Error creating customer' });
  }
});

// Update customer
app.put('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInfo = req.body;
    
    const customer = await customerService.updateCustomer(id, updatedInfo);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error(`Error updating customer ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error updating customer' });
  }
});

// Add service visit to customer
app.post('/api/customers/:id/visits', async (req, res) => {
  try {
    const { id } = req.params;
    const { servicesTaken, notes } = req.body;
    
    if (!servicesTaken || !Array.isArray(servicesTaken)) {
      return res.status(400).json({ message: 'Services taken must be an array' });
    }
    
    const visit = await customerService.addServiceVisit(id, servicesTaken, notes);
    
    if (!visit) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(201).json(visit);
  } catch (error) {
    console.error(`Error adding service visit for customer ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error adding service visit' });
  }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await customerService.deleteCustomer(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error(`Error deleting customer ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error deleting customer' });
  }
});

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});