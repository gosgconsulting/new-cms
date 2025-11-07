# Local Development Guide

## PostgreSQL Setup

To set up PostgreSQL for local development:

1. Install PostgreSQL on your local machine
2. Create a new database called `gosgwebsite`
3. Create a `.env.local` file in the root directory with the following variables:

```
# PostgreSQL Database Configuration for Local Development
VITE_DATABASE_PUBLIC_URL=postgresql://gosg:gosg@localhost:5432/gosg
VITE_POSTGRES_DB=gosg
VITE_POSTGRES_USER=gosg
VITE_POSTGRES_PASSWORD=gosg
```

Replace `password` with your actual PostgreSQL password.

## Running the Application

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npm run dev
```

3. The application will automatically connect to your local PostgreSQL database and run any necessary migrations.

## Troubleshooting

If you encounter any issues with the database connection:

1. Check that PostgreSQL is running on your machine
2. Verify that the database `gosgwebsite` exists
3. Ensure your PostgreSQL username and password are correct in the `.env.local` file
4. Check the console for any error messages
