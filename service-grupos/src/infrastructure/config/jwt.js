import getSecret from './secret-reader.js';

const jwtConfig = {
    secret: getSecret('SECRET_JWT')
};

export default jwtConfig;
