const express = require('express');
const serverless = require('serverless-http');
const app = express();

// Import your existing routes and middleware
const initializeDatabase = require('../db');
const CustomerService = require('../services/customerService');
const CustomerServiceDB = require('../services/customerServiceDB');

let customerService;

// Middleware
app.use(express.json());

// Initialize database connection
(async () => {
  try {
    const sqlClient = await initializeDatabase();
    console.log('Connected to Netlify DB (Neon Postgres)');
    customerService = new CustomerServiceDB(sqlClient);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    console.log('Falling back to file-based storage');
    customerService = new CustomerService();
  }
})();

// GET all customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  } catch (error) {
    console.error('Error retrieving customers:', error);
    res.status(500).json({ message: 'Error retrieving customers' });
  }
});

// GET customer by ID
app.get('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error(`Error retrieving customer ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error retrieving customer' });
  }
});

// Search customers by name
app.get('/api/customers/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const customers = await customerService.searchCustomersByName(term);
    res.json(customers);
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
    
    // Check if customer with phone number already exists
    const existingCustomer = await customerService.getCustomerByPhone(phoneNumber);
    
    if (existingCustomer) {
      return res.status(409).json({ message: 'Customer with this phone number already exists' });
    }
    
    const newCustomer = await customerService.addCustomer(name, phoneNumber, preferredStyles, notes);
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ message: 'Error adding customer' });
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

// Export the serverless function
module.exports.handler = serverless(app);
