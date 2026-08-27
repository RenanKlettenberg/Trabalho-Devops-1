import dotenv from 'dotenv/config';
import path from 'path';

import app from './app.js';

const PORT = process.env.PORT_BACK || 3000;

app.listen(PORT, () => {
    console.log("Servidor iniciado na porta " + PORT);
})