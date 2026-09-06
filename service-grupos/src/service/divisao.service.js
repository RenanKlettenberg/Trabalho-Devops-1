import AppError from '../infrastructure/errors/app.error.js';
import RESPONSE from '../shared/constants/response.js';

function criarServiceDivisao(participanteRepository, despesaParticipanteRepository, grupoService) {
    async function calcularDivisaoDespesa({ gru_id, des_id, valor }) {
        await grupoService.getById(gru_id); 

        const participantes = (await participanteRepository.listarPorGrupo(gru_id)).rows;
        const vinculos = (await despesaParticipanteRepository.listarPorDespesa(des_id)).rows;

        const vinculoPorParticipante = new Map(vinculos.map(v => [v.par_id, v]));
        const exclusivos = vinculos.filter(v => v.dp_exclusiva);


        const elegiveis = exclusivos.length > 0
            ? exclusivos.map(v => ({
                participante: participantes.find(p => p.par_id === v.par_id),
                peso: Number(v.dp_peso ?? 1),
            }))
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
