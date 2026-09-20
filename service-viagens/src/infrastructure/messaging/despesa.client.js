import { enviarParaFila } from './rabbitmq.js';

function criarDespesaClient() {
    async function criarDespesa(dados) {
        await enviarParaFila('service_viagem/despesa', {
            evento: 'CRIAR_DESPESA',
            data: new Date().toISOString(),
            ...dados,
        });

        return { des_id: null };
    }

    return { criarDespesa };
}

export default criarDespesaClient;