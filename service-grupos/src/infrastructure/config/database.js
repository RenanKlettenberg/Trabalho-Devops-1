import getSecret from './secret-reader.js';

const databaseConfig = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: getSecret('DB_PASSWORD')
};

export default databaseConfig;
