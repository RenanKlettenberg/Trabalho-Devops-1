import AppError from '../infrastructure/errors/app.error.js';
import RESPONSE from '../shared/constants/response.js';

function criarServiceDivisao(participanteRepository, despesaParticipanteRepository, grupoService) {
    async function calcularDivisaoDespesa({ gru_id, des_id, valor }) {
        await grupoService.getById(gru_id); 

        const participantes = (await participanteRepository.listarPorGrupo(gru_id)).rows;
        const vinculos = (await despesaParticipanteRepository.listarPorDespesa(des_id)).rows;

        const vinculoPorParticipante = new Map(vinculos.map(v => [v.par_id, v]));
        const exclusivos = vinculos.filter(v => v.dp_exclusiva);


        /*
          O `listarPorDespesa` traz os vínculos daquela despesa em QUALQUER
          grupo — a mesma despesa pode estar vinculada a participantes de
          grupos diferentes. Aqui só nos interessam os deste grupo, então
          descartamos os que não têm participante correspondente. Sem esse
          filtro, o `find` devolve undefined e a leitura de `.par_id` logo
          abaixo quebra com TypeError (virava 500 na API).
        */
        const elegiveis = exclusivos.length > 0
            ? exclusivos
                .map(v => ({
                    participante: participantes.find(p => p.par_id === v.par_id),
                    peso: Number(v.dp_peso ?? 1),
                }))
                .filter(e => e.participante)
            : participantes
                .filter(p => !p.par_isento)
                .map(p => ({
                    participante: p,
                    peso: Number(vinculoPorParticipante.get(p.par_id)?.dp_peso ?? 1),
                }));

        const somaPesos = elegiveis.reduce((acc, e) => acc + e.peso, 0);

        if (somaPesos <= 0) {
            throw new AppError({
                ...RESPONSE.DADO_INVALIDO,
                message: "Nenhum participante elegível para dividir essa despesa (todos isentos ou sem peso válido).",
            });
        }

        return elegiveis.map(e => ({
            par_id: e.participante.par_id,
            par_nome: e.participante.par_nome,
            peso: e.peso,
            valor_devido: Number((valor * (e.peso / somaPesos)).toFixed(2)),
        }));
    }

    return { calcularDivisaoDespesa };
}

export default criarServiceDivisao;
