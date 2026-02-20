
import 'dotenv/config';
import { testConnection } from '../sparti-cms/db/connection.js';

console.log('🔍 Pre-deploy: Testing database connection...');

// timeout protection
const timeout = setTimeout(() => {
    console.error('❌ Database connection check timed out after 30s');
    process.exit(1);
}, 30000);

testConnection()
    .then((result) => {
        clearTimeout(timeout);
        if (result.success) {
            console.log('✅ Database connection successful!');
            console.log(`   Host: ${result.connectionInfo.host}`);
            console.log(`   Database: ${result.connectionInfo.database}`);
            console.log(`   Postgres Version: ${result.postgresVersion}`);
            process.exit(0);
        } else {
            console.error('❌ Database connection failed.');
            console.error('   Error Code:', result.error?.code);
            console.error('   Message:', result.error?.message);

            if (process.env.DATABASE_URL) {
                // Log masked URL for debugging logic without revealing password
                try {
                    const url = new URL(process.env.DATABASE_URL.replace('postgresql://', 'http://'));
                    console.error(`   Target: ${url.hostname}:${url.port || 5432} / ${url.pathname.slice(1)}`);
                } catch (e) {
                    console.error('   (Could not parse DATABASE_URL for logging)');
                }
            } else {
                console.error('   DATABASE_URL is not set in environment.');
            }

            process.exit(1);
        }
    })
    .catch((err) => {
        clearTimeout(timeout);
        console.error('❌ Unexpected error during connection test:', err);
        process.exit(1);
    });
