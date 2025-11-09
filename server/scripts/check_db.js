import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

function unwrapQuoted(s) {
  if (!s) return s;
  return s.trim().replace(/^"(.*)"$/, '$1');
}

const rawUrl = unwrapQuoted(process.env.DATABASE_URL);
if (!rawUrl) {
  console.error('DATABASE_URL is not set in server/.env');
  process.exit(1);
}

let url;
try {
  url = new URL(rawUrl);
} catch (err) {
  console.error('DATABASE_URL is not a valid URL:', err.message);
  process.exit(1);
}

const config = {
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  host: url.hostname,
  port: url.port ? Number(url.port) : 5432,
  database: url.pathname ? url.pathname.replace(/^\//, '') : '',
};

async function testDatabase() {
  const targetDb = config.database || 'postgres';

  console.log(`Testing connection to postgres://${config.user}@${config.host}:${config.port}/${targetDb}`);

  const client = new Client({ ...config, database: targetDb });
  try {
    await client.connect();
    console.log(`Connected successfully to database '${targetDb}'.`);
    // If targetDb is not the intended DB (i.e., config.database differs), check existence
    if (config.database && config.database !== targetDb) {
      const res = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [config.database]);
      if (res.rowCount > 0) {
        console.log(`Database '${config.database}' already exists.`);
      } else {
        console.log(`Database '${config.database}' does not exist.`);
        // try to create it
        try {
          await client.query(`CREATE DATABASE "${config.database}"`);
          console.log(`Database '${config.database}' created successfully.`);
        } catch (err) {
          console.error(`Failed to create database '${config.database}':`, err.message);
        }
      }
    }
  } catch (err) {
    // Common errors: authentication (28P01), could not connect, etc.
    console.error('Connection test failed:', err.message);
    if (err.code === '28P01') {
      console.error('Authentication failed. Check username/password in server/.env');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Connection refused. Is Postgres running on the configured host/port?');
    }
    process.exitCode = 1;
  } finally {
    try {
      await client.end();
    } catch (e) {}
  }
}

testDatabase().then(() => process.exit()).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
