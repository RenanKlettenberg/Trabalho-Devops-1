import getSecret from './secret-reader.js';

const pepperConfig = {
    secret: getSecret('PEPPER'),
}

export default pepperConfig;