// CustomerServiceDB - Postgres version of CustomerService
const { Customer, ServiceVisit } = require('../models/customer');

class CustomerServiceDB {
  constructor(sqlClient) {
    this.sql = sqlClient;
    if (!this.sql) {
      console.warn('Database client not provided. CustomerServiceDB will not function properly.');
    }
  }

  // Get all customers
  async getAllCustomers() {
    try {
      // Get customers
      const customersResult = await this.sql`
        SELECT * FROM customers ORDER BY name
      `;
      
      // Map to Customer objects
      const customers = await Promise.all(customersResult.map(async (row) => {
        const customer = new Customer(
          row.id,
          row.name,
          row.phone_number,
          row.preferred_styles || [],
          [],
          row.notes
        );
        
        // Get service history for each customer
        const serviceVisits = await this.sql`
          SELECT * FROM service_visits 
          WHERE customer_id = ${row.id}
          ORDER BY visit_date DESC
        `;
        
        // Convert to ServiceVisit objects
        customer.serviceHistory = serviceVisits.map(visit => {
          return new ServiceVisit(
            new Date(visit.visit_date),
            visit.services_taken || [],
            visit.notes
          );
        });
        
        return customer;
      }));
      
      return customers;
    } catch (error) {
      console.error('Error getting all customers:', error);
      return [];
    }
  }

  // Get customer by ID
  async getCustomerById(id) {
    try {
      // Get customer
      const customerResult = await this.sql`
        SELECT * FROM customers WHERE id = ${id}
      `;
      
      if (customerResult.length === 0) {
        return null;
      }
      
      const row = customerResult[0];
      const customer = new Customer(
        row.id,
        row.name,
        row.phone_number,
        row.preferred_styles || [],
        [],
        row.notes
      );
      
      // Get service history
      const serviceVisits = await this.sql`
        SELECT * FROM service_visits 
        WHERE customer_id = ${id}
        ORDER BY visit_date DESC
      `;
      
      // Convert to ServiceVisit objects
      customer.serviceHistory = serviceVisits.map(visit => {
        return new ServiceVisit(
          new Date(visit.visit_date),
          visit.services_taken || [],
          visit.notes
        );
      });
      
      return customer;
    } catch (error) {
      console.error(`Error getting customer by ID ${id}:`, error);
      return null;
    }
  }

  // Get customer by phone number
  async getCustomerByPhone(phoneNumber) {
    try {
      // Get customer
      const customerResult = await this.sql`
        SELECT * FROM customers WHERE phone_number = ${phoneNumber}
      `;
      
      if (customerResult.length === 0) {
        return null;
      }
      
      return await this.getCustomerById(customerResult[0].id);
    } catch (error) {
      console.error(`Error getting customer by phone ${phoneNumber}:`, error);
      return null;
    }
  }

  // Search customers by name (partial match)
  async searchCustomersByName(name) {
    try {
      const searchTerm = `%${name}%`;
      const customersResult = await this.sql`
        SELECT * FROM customers 
        WHERE name ILIKE ${searchTerm}
        ORDER BY name
      `;
      
      // Map to Customer objects with service history
      const customers = await Promise.all(customersResult.map(row => this.getCustomerById(row.id)));
      return customers.filter(c => c !== null);
    } catch (error) {
      console.error(`Error searching customers by name ${name}:`, error);
      return [];
    }
  }

  // Add new customer
  async addCustomer(name, phoneNumber, preferredStyles = [], notes = '') {
    try {
      // Generate a unique ID
      const id = Date.now().toString();
      
      // Insert customer
      await this.sql`
        INSERT INTO customers (id, name, phone_number, preferred_styles, notes)
        VALUES (${id}, ${name}, ${phoneNumber}, ${preferredStyles}, ${notes})
      `;
      
      // Return the new customer
      return await this.getCustomerById(id);
    } catch (error) {
      console.error('Error adding customer:', error);
      return null;
    }
  }

  // Update customer information
  async updateCustomer(id, updatedInfo) {
    try {
      // Get current customer
      const customer = await this.getCustomerById(id);
      if (!customer) {
        return null;
      }
      
      // Update with new values or keep existing ones
      const name = updatedInfo.name || customer.name;
      const phoneNumber = updatedInfo.phoneNumber || customer.phoneNumber;
      const preferredStyles = updatedInfo.preferredStyles || customer.preferredStyles;
      const notes = updatedInfo.notes !== undefined ? updatedInfo.notes : customer.notes;
      
      // Update in database
      await this.sql`
        UPDATE customers
        SET name = ${name}, 
            phone_number = ${phoneNumber}, 
            preferred_styles = ${preferredStyles}, 
            notes = ${notes}
        WHERE id = ${id}
      `;
      
      // Return updated customer
      return await this.getCustomerById(id);
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error);
      return null;
    }
  }

  // Add service visit to customer
  async addServiceVisit(customerId, servicesTaken, notes = '') {
    try {
      // Check if customer exists
      const customer = await this.getCustomerById(customerId);
      if (!customer) {
        return null;
      }
      
      // Insert service visit
      const visitResult = await this.sql`
        INSERT INTO service_visits (customer_id, services_taken, notes)
        VALUES (${customerId}, ${servicesTaken}, ${notes})
        RETURNING *
      `;
      
      if (visitResult.length === 0) {
        return null;
      }
      
      // Return the new service visit
      const visit = visitResult[0];
      return new ServiceVisit(
        new Date(visit.visit_date),
        visit.services_taken || [],
        visit.notes
      );
    } catch (error) {
      console.error(`Error adding service visit for customer ${customerId}:`, error);
      return null;
    }
  }

  // Delete customer
  async deleteCustomer(id) {
    try {
      // Check if customer exists
      const customer = await this.getCustomerById(id);
      if (!customer) {
        return false;
      }
      
      // Delete customer (service visits will be deleted via CASCADE)
      await this.sql`
        DELETE FROM customers WHERE id = ${id}
      `;
      
      return true;
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error);
      return false;
    }
  }
}

module.exports = CustomerServiceDB;