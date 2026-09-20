const express = require('express');
const { configurarFilas, sagaStateDb } = require('./Orquestrador');
const { criarSaga } = require('./SagaDespesaCompartilhada');

const PORT = process.env.PORT_BACK || 3003;

const app = express();
app.use(express.json());

const saga = criarSaga({ sagaStateDb });

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'service-orquestrador' });
});

/*
  Dispara a saga.

  Responde 202 (Accepted), e não 201, porque neste ponto nada foi concluído
  ainda: a saga só começou. O cliente recebe o sagaId e acompanha o resultado
  em GET /saga/:sagaId. Saga é assíncrona por natureza — fingir que é síncrona
  aqui só esconderia o comportamento real do sistema.
*/
app.post('/saga/despesa-compartilhada', async (req, res) => {
    const { gru_id, valor, descricao, moeda, categoria, viagemId, eventoId, participantes } = req.body ?? {};

    if (!gru_id || !valor) {
        return res.status(400).json({ erro: 'gru_id e valor são obrigatórios.' });
    }

    const estado = await saga.iniciar({
        gru_id,
        valor,
        descricao,
        moeda,
        categoria,
        viagemId,
        eventoId,
        participantes,
    });

    res.status(202).json({
        sagaId: estado.sagaId,
        etapa: estado.etapa,
        acompanhe: `/saga/${estado.sagaId}`,
    });
});

app.get('/saga/:sagaId', (req, res) => {
    const estado = saga.consultar(req.params.sagaId);

    if (!estado) {
        return res.status(404).json({ erro: 'Saga não encontrada.' });
    }

    res.json(estado);
});

app.get('/saga', (_req, res) => {
    res.json(saga.listar());
});

async function iniciar() {
    await configurarFilas();
    await saga.iniciarConsumers();

    if (process.env.SIMULAR_DESPESAS === 'true') {
        const { iniciarStubDespesas } = require('./stubs/despesasStub');
        await iniciarStubDespesas();
    }

    app.listen(PORT, () => {
        console.log(`[orquestrador] HTTP na porta ${PORT}`);
    });
}

iniciar().catch((erro) => {
    console.error('[orquestrador] Falha ao iniciar:', erro);
    process.exit(1);
});

module.exports = app;
