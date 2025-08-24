// Customer model schema for salon management app

class Customer {
  constructor(id, name, phoneNumber, preferredStyles = [], serviceHistory = [], notes = '') {
    this.id = id;
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.preferredStyles = preferredStyles; // Array of preferred styles (haircuts, beard trims, colors, etc.)
    this.serviceHistory = serviceHistory; // Array of service objects with date and services taken
    this.notes = notes; // Additional notes about customer preferences, feedback, etc.
  }

  // Add a new service visit to customer history
  addServiceVisit(serviceVisit) {
    this.serviceHistory.push(serviceVisit);
  }

  // Update customer preferred styles
  updatePreferredStyles(styles) {
    this.preferredStyles = styles;
  }

  // Update customer notes
  updateNotes(notes) {
    this.notes = notes;
  }

  // Get customer's last visit details
  getLastVisit() {
    if (this.serviceHistory.length === 0) {
      return null;
    }
    return this.serviceHistory[this.serviceHistory.length - 1];
  }
}

// Service Visit model to track each customer visit
class ServiceVisit {
  constructor(date, servicesTaken = [], notes = '') {
    this.date = date;
    this.servicesTaken = servicesTaken; // Array of services taken during this visit
    this.notes = notes; // Notes specific to this visit
  }
}

module.exports = { Customer, ServiceVisit };