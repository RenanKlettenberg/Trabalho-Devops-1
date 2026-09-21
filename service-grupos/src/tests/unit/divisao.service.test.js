import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import criarServiceDivisao from '../../service/divisao.service.js';

const DES_ID = '3ab18a06-d42b-4d10-ab18-1761105a51af'; // UUID vindo do service-despesas

function participantes(...lista) {
    return { rows: lista };
}

function vinculos(...lista) {
    return { rows: lista };
}

describe('divisao.service - calcularDivisaoDespesa', () => {
    let participanteRepository;
    let despesaParticipanteRepository;
    let grupoService;
    let service;

    beforeEach(() => {
        participanteRepository = { listarPorGrupo: jest.fn() };
        despesaParticipanteRepository = { listarPorDespesa: jest.fn() };
        grupoService = { getById: jest.fn().mockResolvedValue({ gru_id: 1 }) };
        service = criarServiceDivisao(participanteRepository, despesaParticipanteRepository, grupoService);
    });

    it('propaga o erro quando o grupo não existe', async () => {
        grupoService.getById.mockRejectedValue({ code: 'GRU03' });

        await expect(
            service.calcularDivisaoDespesa({ gru_id: 999, des_id: DES_ID, valor: 100 })
        ).rejects.toMatchObject({ code: 'GRU03' });
    });

    it('divide igualmente entre participantes não isentos quando não há vínculo nenhum', async () => {
        participanteRepository.listarPorGrupo.mockResolvedValue(
            participantes(
                { par_id: 1, par_nome: 'Ana', par_isento: false },
                { par_id: 2, par_nome: 'Bruno', par_isento: false }
            )
        );
        despesaParticipanteRepository.listarPorDespesa.mockResolvedValue(vinculos());

        const resultado = await service.calcularDivisaoDespesa({ gru_id: 1, des_id: DES_ID, valor: 200 });

        expect(resultado).toEqual([
            { par_id: 1, par_nome: 'Ana', peso: 1, valor_devido: 100 },
            { par_id: 2, par_nome: 'Bruno', peso: 1, valor_devido: 100 },
        ]);
    });

    it('exclui participantes isentos da divisão', async () => {
        participanteRepository.listarPorGrupo.mockResolvedValue(
            participantes(
                { par_id: 1, par_nome: 'Ana', par_isento: false },
                { par_id: 2, par_nome: 'Bruno', par_isento: true }
            )
        );
        despesaParticipanteRepository.listarPorDespesa.mockResolvedValue(vinculos());

        const resultado = await service.calcularDivisaoDespesa({ gru_id: 1, des_id: DES_ID, valor: 200 });

        expect(resultado).toEqual([{ par_id: 1, par_nome: 'Ana', peso: 1, valor_devido: 200 }]);
    });

    it('quando a despesa é exclusiva, só quem está marcado participa - mesmo quem não é isento fica de fora', async () => {
        participanteRepository.listarPorGrupo.mockResolvedValue(
            participantes(
                { par_id: 1, par_nome: 'Ana', par_isento: false },
                { par_id: 2, par_nome: 'Bruno', par_isento: false }
            )
        );
        despesaParticipanteRepository.listarPorDespesa.mockResolvedValue(
            vinculos({ par_id: 2, dp_exclusiva: true, dp_peso: null })
        );

        const resultado = await service.calcularDivisaoDespesa({ gru_id: 1, des_id: DES_ID, valor: 300 });

        expect(resultado).toEqual([{ par_id: 2, par_nome: 'Bruno', peso: 1, valor_devido: 300 }]);
    });

    /*
      A mesma despesa pode estar vinculada a participantes de outros grupos, e o
      repositório devolve todos eles. Antes esse caso quebrava com TypeError
      (virava 500 na API), porque o participante de outro grupo não é encontrado
      na lista deste grupo.
    */
    it('ignora vínculo exclusivo cujo participante é de outro grupo', async () => {
        participanteRepository.listarPorGrupo.mockResolvedValue(
            participantes({ par_id: 1, par_nome: 'Ana', par_isento: false })
        );
        despesaParticipanteRepository.listarPorDespesa.mockResolvedValue(
            vinculos(
                { par_id: 1, dp_exclusiva: true, dp_peso: null },
                { par_id: 99, dp_exclusiva: true, dp_peso: null } // de outro grupo
            )
        );

        const resultado = await service.calcularDivisaoDespesa({ gru_id: 1, des_id: DES_ID, valor: 300 });

        expect(resultado).toEqual([{ par_id: 1, par_nome: 'Ana', peso: 1, valor_devido: 300 }]);
    });

    it('falha de forma tratada quando todos os vínculos exclusivos são de outros grupos', async () => {
        participanteRepository.listarPorGrupo.mockResolvedValue(
            participantes({ par_id: 1, par_nome: 'Ana', par_isento: false })
        );
        despesaParticipanteRepository.listarPorDespesa.mockResolvedValue(
            vinculos({ par_id: 99, dp_exclusiva: true, dp_peso: null })
        );

        await expect(
            service.calcularDivisaoDespesa({ gru_id: 1, des_id: DES_ID, valor: 300 })
        ).rejects.toMatchObject({ code: '2' });
    });

    it('aplica peso do vínculo, proporcional ao total de pesos elegíveis', async () => {
        participanteRepository.listarPorGrupo.mockResolvedValue(
            participantes(
                { par_id: 1, par_nome: 'Ana', par_isento: false },
                { par_id: 2, par_nome: 'Bruno', par_isento: false }
            )
        );
        // Ana com peso 3, Bruno sem vínculo (peso padrão 1) -> soma de pesos = 4
        despesaParticipanteRepository.listarPorDespesa.mockResolvedValue(
            vinculos({ par_id: 1, dp_exclusiva: false, dp_peso: 3 })
        );

        const resultado = await service.calcularDivisaoDespesa({ gru_id: 1, des_id: DES_ID, valor: 400 });

        expect(resultado).toEqual([
            { par_id: 1, par_nome: 'Ana', peso: 3, valor_devido: 300 },
            { par_id: 2, par_nome: 'Bruno', peso: 1, valor_devido: 100 },
        ]);
    });

    it('lança DADO_INVALIDO quando não sobra ninguém elegível (todos isentos)', async () => {
        participanteRepository.listarPorGrupo.mockResolvedValue(
            participantes({ par_id: 1, par_nome: 'Ana', par_isento: true })
        );
        despesaParticipanteRepository.listarPorDespesa.mockResolvedValue(vinculos());

        await expect(
            service.calcularDivisaoDespesa({ gru_id: 1, des_id: DES_ID, valor: 200 })
        ).rejects.toMatchObject({ code: '2' });
    });
});
