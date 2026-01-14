require('dotenv').config();

// Parse connection string
const parseConnectionString = (connectionString) => {
  try {
    const url = new URL(connectionString.replace('postgresql://', 'http://'));
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      username: url.username,
      password: url.password,
    };
  } catch (error) {
    throw new Error(`Invalid connection string: ${error.message}`);
  }
};

const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[testing] WARNING: DATABASE_URL or DATABASE_PUBLIC_URL environment variable is required');
  console.error('[testing] Please create a .env file in the project root with:');
  console.error('[testing] DATABASE_PUBLIC_URL=postgresql://user:password@host:port/database');
  console.error('[testing] OR');
  console.error('[testing] DATABASE_URL=postgresql://user:password@host:port/database');
  throw new Error('DATABASE_URL or DATABASE_PUBLIC_URL environment variable is required. Please create a .env file in the project root.');
}

const config = parseConnectionString(connectionString);

module.exports = {
  development: {
    username: config.username,
    password: config.password,
    database: config.database,
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
  production: {
    username: config.username,
    password: config.password,
    database: config.database,
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
};
