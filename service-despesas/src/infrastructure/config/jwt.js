import getSecret from './secret-reader.js';

const jwtConfig = {
  secret: getSecret('SECRET_JWT'),
  options: {
    expiresIn: '24h',
  },
};

export default jwtConfig;
