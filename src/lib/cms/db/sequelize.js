import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Get connection string from environment
const getConnectionString = () => {
  return process.env.DATABASE_URL;
};

// Parse connection string to extract components
const parseConnectionString = (connectionString) => {
  try {
    const url = new URL(connectionString.replace('postgresql://', 'http://'));
    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // Remove leading slash
      username: url.username,
      password: url.password,
    };
  } catch (error) {
    console.error('[testing] Error parsing connection string:', error);
    throw error;
  }
};

// Create Sequelize instance
const createSequelizeInstance = () => {
  const connectionString = getConnectionString();
  
  if (!connectionString) {
    console.error('[testing] WARNING: DATABASE_URL environment variable is required');
    console.error('[testing] Please create a .env file in the project root with:');
    console.error('[testing] DATABASE_URL=postgresql://user:password@host:port/database');
    throw new Error('DATABASE_URL environment variable is required. Please create a .env file in the project root.');
  }

  const config = parseConnectionString(connectionString);

  // Determine if we should use SSL
  // Use SSL for remote/cloud connections; optional for localhost
  const isLocalhost = config.host === 'localhost' || 
                     config.host === '127.0.0.1' || 
                     config.host === '::1' ||
                     connectionString.includes('localhost') ||
                     connectionString.includes('127.0.0.1');
  const useSSL = !isLocalhost || process.env.DATABASE_SSL === 'true';

  const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    dialectOptions: useSSL ? {
      ssl: {
        rejectUnauthorized: false, // For cloud providers with self-signed certs
      },
    } : {},
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });

  return sequelize;
};

// Export singleton instance
let sequelizeInstance = null;

export const getSequelize = () => {
  if (!sequelizeInstance) {
    sequelizeInstance = createSequelizeInstance();
  }
  return sequelizeInstance;
};

// Test connection
export const testConnection = async () => {
  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log('[testing] Sequelize connection established successfully');
    return true;
  } catch (error) {
    console.error('[testing] Unable to connect to database:', error);
    throw error;
  }
};

export default getSequelize();

