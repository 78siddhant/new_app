// Salon Management App - Main JavaScript

// DOM Elements
const newCustomerBtn = document.getElementById('new-customer-btn');
const searchBtn = document.getElementById('search-btn');
const searchSection = document.getElementById('search-section');
const customerFormSection = document.getElementById('customer-form-section');
const customerProfileSection = document.getElementById('customer-profile-section');
const searchInput = document.getElementById('search-input');
const searchSubmitBtn = document.getElementById('search-submit-btn');
const searchResults = document.getElementById('search-results');
const customerForm = document.getElementById('customer-form');
const formTitle = document.getElementById('form-title');
const customerId = document.getElementById('customer-id');
const customerName = document.getElementById('customer-name');
const phoneNumber = document.getElementById('phone-number');
const notes = document.getElementById('notes');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const editCustomerBtn = document.getElementById('edit-customer-btn');
const addVisitBtn = document.getElementById('add-visit-btn');
const profileName = document.getElementById('profile-name');
const profilePhone = document.getElementById('profile-phone');
const profileStyles = document.getElementById('profile-styles');
const profileNotes = document.getElementById('profile-notes');
const visitList = document.getElementById('visit-list');

// State management
let customers = [];
let currentCustomer = null;
let isEditMode = false;
let isAddVisitMode = false;

// Initialize the app
function initApp() {
  loadCustomers();
  setupEventListeners();
  showSearchSection();
}

// Load customers from localStorage or API
function loadCustomers() {
  const storedCustomers = localStorage.getItem('salonCustomers');
  if (storedCustomers) {
    customers = JSON.parse(storedCustomers);
  }
}

// Save customers to localStorage
function saveCustomers() {
  localStorage.setItem('salonCustomers', JSON.stringify(customers));
}

// Setup event listeners
function setupEventListeners() {
  // Navigation buttons
  newCustomerBtn.addEventListener('click', () => showCustomerForm());
  searchBtn.addEventListener('click', () => showSearchSection());
  
  // Search functionality
  searchSubmitBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  
  // Form actions
  customerForm.addEventListener('submit', handleSaveCustomer);
  cancelBtn.addEventListener('click', handleCancel);
  
  // Profile actions
  editCustomerBtn.addEventListener('click', () => {
    isEditMode = true;
    showCustomerForm(currentCustomer);
  });
  
  addVisitBtn.addEventListener('click', () => {
    isAddVisitMode = true;
    showCustomerForm(currentCustomer, true);
  });
}

// Show search section
function showSearchSection() {
  searchSection.classList.remove('hidden');
  customerFormSection.classList.add('hidden');
  customerProfileSection.classList.add('hidden');
  searchInput.focus();
}

// Show customer form
function showCustomerForm(customer = null, addVisitOnly = false) {
  searchSection.classList.add('hidden');
  customerFormSection.classList.remove('hidden');
  customerProfileSection.classList.add('hidden');
  
  resetForm();
  
  if (customer) {
    // Edit mode or Add Visit mode
    customerId.value = customer.id;
    customerName.value = customer.name;
    phoneNumber.value = customer.phoneNumber;
    notes.value = customer.notes;
    
    // Set preferred styles checkboxes
    if (customer.preferredStyles) {
      customer.preferredStyles.forEach(style => {
        const checkbox = document.getElementById(`style-${style.toLowerCase().replace(' ', '-')}`);
        if (checkbox) checkbox.checked = true;
      });
    }
    
    if (addVisitOnly) {
      formTitle.textContent = `Add Visit for ${customer.name}`;
      // Disable customer info fields
      customerName.disabled = true;
      phoneNumber.disabled = true;
      document.querySelectorAll('#preferred-styles input').forEach(input => input.disabled = true);
      // Focus on services section
      document.getElementById('services-section').scrollIntoView({ behavior: 'smooth' });
    } else {
      formTitle.textContent = `Edit Customer: ${customer.name}`;
    }
  } else {
    // New customer mode
    formTitle.textContent = 'New Customer';
  }
  
  customerName.focus();
}

// Show customer profile
function showCustomerProfile(customer) {
  currentCustomer = customer;
  
  searchSection.classList.add('hidden');
  customerFormSection.classList.add('hidden');
  customerProfileSection.classList.remove('hidden');
  
  // Populate profile information
  profileName.textContent = customer.name;
  profilePhone.textContent = customer.phoneNumber;
  profileStyles.textContent = customer.preferredStyles ? customer.preferredStyles.join(', ') : 'None';
  profileNotes.textContent = customer.notes || 'No notes';
  
  // Populate visit history
  renderVisitHistory(customer);
}

// Render visit history
function renderVisitHistory(customer) {
  visitList.innerHTML = '';
  
  if (!customer.serviceHistory || customer.serviceHistory.length === 0) {
    visitList.innerHTML = '<p>No visit history available.</p>';
    return;
  }
  
  // Sort visits by date (newest first)
  const sortedVisits = [...customer.serviceHistory].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  
  sortedVisits.forEach(visit => {
    const visitDate = new Date(visit.date);
    const formattedDate = visitDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const visitElement = document.createElement('div');
    visitElement.className = 'visit-item';
    
    const dateElement = document.createElement('div');
    dateElement.className = 'visit-date';
    dateElement.textContent = formattedDate;
    
    const servicesElement = document.createElement('div');
    servicesElement.className = 'visit-services';
    
    if (visit.servicesTaken && visit.servicesTaken.length > 0) {
      visit.servicesTaken.forEach(service => {
        const serviceTag = document.createElement('span');
        serviceTag.className = 'service-tag';
        serviceTag.textContent = service;
        servicesElement.appendChild(serviceTag);
      });
    } else {
      servicesElement.textContent = 'No services recorded';
    }
    
    const notesElement = document.createElement('div');
    notesElement.className = 'visit-notes';
    notesElement.textContent = visit.notes || '';
    
    visitElement.appendChild(dateElement);
    visitElement.appendChild(servicesElement);
    if (visit.notes) visitElement.appendChild(notesElement);
    
    visitList.appendChild(visitElement);
  });
}

// Handle search
function handleSearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  if (!searchTerm) {
    searchResults.innerHTML = '<p>Enter a name or phone number to search.</p>';
    return;
  }
  
  const results = customers.filter(customer => {
    return (
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.phoneNumber.includes(searchTerm)
    );
  });
  
  renderSearchResults(results);
}

// Render search results
function renderSearchResults(results) {
  searchResults.innerHTML = '';
  
  if (results.length === 0) {
    searchResults.innerHTML = '<p>No customers found. Try a different search or add a new customer.</p>';
    return;
  }
  
  results.forEach(customer => {
    const customerElement = document.createElement('div');
    customerElement.className = 'customer-item';
    customerElement.innerHTML = `
      <h3>${customer.name}</h3>
      <p>${customer.phoneNumber}</p>
    `;
    
    customerElement.addEventListener('click', () => showCustomerProfile(customer));
    
    searchResults.appendChild(customerElement);
  });
}

// Handle save customer
function handleSaveCustomer(e) {
  e.preventDefault();
  
  // Get form values
  const name = customerName.value.trim();
  const phone = phoneNumber.value.trim();
  
  // Get preferred styles
  const preferredStyles = [];
  document.querySelectorAll('#preferred-styles input:checked').forEach(checkbox => {
    preferredStyles.push(checkbox.value);
  });
  
  // Get services taken (for current visit)
  const servicesTaken = [];
  document.querySelectorAll('#services-section input:checked').forEach(checkbox => {
    servicesTaken.push(checkbox.value);
  });
  
  const customerNotes = notes.value.trim();
  
  if (isAddVisitMode && currentCustomer) {
    // Add new visit to existing customer
    if (!currentCustomer.serviceHistory) {
      currentCustomer.serviceHistory = [];
    }
    
    currentCustomer.serviceHistory.push({
      date: new Date().toISOString(),
      servicesTaken,
      notes: customerNotes
    });
    
    // Update customer in the array
    const index = customers.findIndex(c => c.id === currentCustomer.id);
    if (index !== -1) {
      customers[index] = currentCustomer;
    }
    
    saveCustomers();
    showCustomerProfile(currentCustomer);
    
    isAddVisitMode = false;
  } else if (isEditMode && customerId.value) {
    // Update existing customer
    const id = customerId.value;
    const index = customers.findIndex(c => c.id === id);
    
    if (index !== -1) {
      customers[index] = {
        ...customers[index],
        name,
        phoneNumber: phone,
        preferredStyles,
        notes: customerNotes
      };
      
      saveCustomers();
      showCustomerProfile(customers[index]);
    }
    
    isEditMode = false;
  } else {
    // Create new customer
    const newCustomer = {
      id: Date.now().toString(),
      name,
      phoneNumber: phone,
      preferredStyles,
      notes: customerNotes,
      serviceHistory: []
    };
    
    // Add service visit if services were selected
    if (servicesTaken.length > 0) {
      newCustomer.serviceHistory.push({
        date: new Date().toISOString(),
        servicesTaken,
        notes: customerNotes
      });
    }
    
    customers.push(newCustomer);
    saveCustomers();
    showCustomerProfile(newCustomer);
  }
}

// Handle cancel button
function handleCancel() {
  if (currentCustomer) {
    showCustomerProfile(currentCustomer);
  } else {
    showSearchSection();
  }
  
  isEditMode = false;
  isAddVisitMode = false;
}

// Reset form
function resetForm() {
  customerForm.reset();
  customerId.value = '';
  customerName.disabled = false;
  phoneNumber.disabled = false;
  document.querySelectorAll('#preferred-styles input').forEach(input => input.disabled = false);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);