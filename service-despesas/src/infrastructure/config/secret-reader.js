import fs from 'fs';

function getSecret(secretName) {
  try {
    return fs.readFileSync(`/run/secrets/${secretName}`, 'utf8').trim();
  } catch (err) {
    return process.env[secretName];
  }
}

export default getSecret;
