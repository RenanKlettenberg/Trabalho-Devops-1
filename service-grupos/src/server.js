import app from './app.js';
import { iniciarSaga } from './modules/saga.module.js';

const PORT = process.env.PORT_BACK || 3002;

app.listen(PORT, () => {
    console.log("Servidor iniciado na porta " + PORT);
});

iniciarSaga();
