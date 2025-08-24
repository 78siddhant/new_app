// Customer Service for handling customer data operations
const fs = require('fs');
const path = require('path');
const { Customer, ServiceVisit } = require('../models/customer');

class CustomerService {
  constructor(dataFilePath = path.join(__dirname, '../data/customers.json')) {
    this.dataFilePath = dataFilePath;
    this.customers = [];
    this.loadCustomers();
  }

  // Load customers from JSON file
  loadCustomers() {
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Create empty file if it doesn't exist
      if (!fs.existsSync(this.dataFilePath)) {
        fs.writeFileSync(this.dataFilePath, JSON.stringify([]));
        this.customers = [];
        return;
      }

      const data = fs.readFileSync(this.dataFilePath, 'utf8');
      const customersData = JSON.parse(data);
      
      // Convert plain objects to Customer instances
      this.customers = customersData.map(customerData => {
        const customer = new Customer(
          customerData.id,
          customerData.name,
          customerData.phoneNumber,
          customerData.preferredStyles,
          [],  // Initialize empty service history
          customerData.notes
        );
        
        // Convert service history objects to ServiceVisit instances
        if (customerData.serviceHistory && Array.isArray(customerData.serviceHistory)) {
          customer.serviceHistory = customerData.serviceHistory.map(visitData => {
            return new ServiceVisit(
              new Date(visitData.date),
              visitData.servicesTaken,
              visitData.notes
            );
          });
        }
        
        return customer;
      });
    } catch (error) {
      console.error('Error loading customers:', error);
      this.customers = [];
    }
  }

  // Save customers to JSON file
  saveCustomers() {
    try {
      const dataDir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.customers, null, 2));
    } catch (error) {
      console.error('Error saving customers:', error);
    }
  }

  // Get all customers
  getAllCustomers() {
    return this.customers;
  }

  // Get customer by ID
  getCustomerById(id) {
    return this.customers.find(customer => customer.id === id) || null;
  }

  // Get customer by phone number
  getCustomerByPhone(phoneNumber) {
    return this.customers.find(customer => customer.phoneNumber === phoneNumber) || null;
  }

  // Search customers by name (partial match)
  searchCustomersByName(name) {
    const searchTerm = name.toLowerCase();
    return this.customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm)
    );
  }

  // Add new customer
  addCustomer(name, phoneNumber, preferredStyles = [], notes = '') {
    // Generate a unique ID
    const id = Date.now().toString();
    
    const newCustomer = new Customer(
      id,
      name,
      phoneNumber,
      preferredStyles,
      [],
      notes
    );
    
    this.customers.push(newCustomer);
    this.saveCustomers();
    
    return newCustomer;
  }

  // Update customer information
  updateCustomer(id, updatedInfo) {
    const customerIndex = this.customers.findIndex(customer => customer.id === id);
    
    if (customerIndex === -1) {
      return null;
    }
    
    const customer = this.customers[customerIndex];
    
    // Update customer properties
    if (updatedInfo.name) customer.name = updatedInfo.name;
    if (updatedInfo.phoneNumber) customer.phoneNumber = updatedInfo.phoneNumber;
    if (updatedInfo.preferredStyles) customer.preferredStyles = updatedInfo.preferredStyles;
    if (updatedInfo.notes) customer.notes = updatedInfo.notes;
    
    this.saveCustomers();
    
    return customer;
  }

  // Add service visit to customer
  addServiceVisit(customerId, servicesTaken, notes = '') {
    const customer = this.getCustomerById(customerId);
    
    if (!customer) {
      return null;
    }
    
    const visit = new ServiceVisit(new Date(), servicesTaken, notes);
    customer.addServiceVisit(visit);
    
    this.saveCustomers();
    
    return visit;
  }

  // Delete customer
  deleteCustomer(id) {
    const initialLength = this.customers.length;
    this.customers = this.customers.filter(customer => customer.id !== id);
    
    if (this.customers.length !== initialLength) {
      this.saveCustomers();
      return true;
    }
    
    return false;
  }
}

module.exports = CustomerService;