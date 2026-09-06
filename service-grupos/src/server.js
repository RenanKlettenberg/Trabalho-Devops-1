import app from './app.js';

const PORT = process.env.PORT_BACK || 3002;

app.listen(PORT, () => {
    console.log("Servidor iniciado na porta " + PORT);
})
