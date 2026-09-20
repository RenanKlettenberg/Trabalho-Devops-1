import app from './app.js';
import { iniciarSaga } from './modules/saga.module.js';

const PORT = process.env.PORT_BACK || 3002;

app.listen(PORT, () => {
    console.log("Servidor iniciado na porta " + PORT);
});

// Liga o consumer da saga em paralelo ao servidor HTTP.
iniciarSaga();
