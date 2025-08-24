# Salon Management App

A simple salon management application to record and organize customer details, track visit history, and provide a personalized experience for returning customers.

## Features

- Record customer information (name, phone number, preferred styles)
- Track services taken during each visit
- Store additional notes about customer preferences and feedback
- Search for customers by name or phone number
- View customer profiles with visit history
- Add new visits for returning customers

## Data Structure

The application stores the following information for each customer:

- **Customer Name**: Full name of the customer
- **Phone Number**: Contact number for the customer
- **Preferred Styles**: Types of services the customer typically prefers (haircuts, beard trims, colors, etc.)
- **Services Taken**: Services received during each visit
- **Additional Notes**: Any extra details about the customer's preferences or feedback

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
4. Open your browser and navigate to `http://localhost:3000`

## Netlify Deployment with Database

To deploy this application with Netlify DB:

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Create a new site in Netlify connected to your repository
3. In the Netlify dashboard, go to "Add-ons" and add Netlify DB (Neon)
4. The `DATABASE_URL` environment variable will be automatically set up
5. Deploy your site

The application will automatically detect the Netlify DB connection and use it instead of the local JSON file storage.

## Development

To run the application in development mode with automatic reloading:

```
npm run dev
```

## Data Persistence

The application supports two data storage options:

### Local File Storage

By default, customer data is stored in a JSON file located at `./data/customers.json`. This file is automatically created when the application first runs.

### Netlify DB (Neon Postgres)

The application can also use Netlify DB (powered by Neon Postgres) for data storage when deployed to Netlify. This provides a more robust, scalable database solution for production use.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Data Storage**: JSON file (local) or Netlify DB/Neon Postgres (production)

## License

MIT