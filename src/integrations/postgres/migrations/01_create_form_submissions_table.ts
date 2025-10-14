import { query } from '../client';

export const name = '01_create_form_submissions_table';

export async function up() {
  await query(`
    CREATE TABLE IF NOT EXISTS form_submissions (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      form_type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

export async function down() {
  await query('DROP TABLE IF EXISTS form_submissions;');
}
