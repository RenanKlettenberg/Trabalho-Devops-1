import pg from 'pg';

const { Pool } = pg;

const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'despesas_db',
  password: process.env.DB_PASSWORD || '123456',
  port: process.env.DB_PORT || 5432,
};

const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('Erro inesperado no banco de dados', err);
  process.exit(-1);
});

const database = {
  query: (text, params) => pool.query(text, params),
  pool,
};

export { database, pool };
export default database;