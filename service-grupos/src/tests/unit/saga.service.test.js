import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import criarServiceSaga from '../../service/saga.service.js';

const DES_ID = '3ab18a06-d42b-4d10-ab18-1761105a51af'; // UUID vindo do service-despesas

function criarDependenciasFake() {
    return {
        grupoService: {
            getById: jest.fn().mockResolvedValue({ gru_id: 1, usu_id_dono: 10 }),
        },
        participanteRepository: {
            listarPorGrupo: jest.fn(),
        },
        despesaParticipanteRepository: {
            criarVinculosEmLote: jest.fn().mockResolvedValue({ rowCount: 0, rows: [] }),
            deletarPorDespesa: jest.fn().mockResolvedValue({ rowCount: 0, rows: [] }),
        },
        divisaoService: {
            calcularDivisaoDespesa: jest.fn().mockResolvedValue([]),
        },
    };
}

const PARTICIPANTES = [
    { par_id: 1, gru_id: 1, par_nome: 'Ana', par_isento: false },
    { par_id: 2, gru_id: 1, par_nome: 'Bruno', par_isento: false },
    { par_id: 3, gru_id: 1, par_nome: 'Carla', par_isento: true },
];

describe('saga.service', () => {
    let deps;
    let service;

    beforeEach(() => {
        deps = criarDependenciasFake();
        service = criarServiceSaga(deps);
        deps.participanteRepository.listarPorGrupo.mockResolvedValue({
            rowCount: PARTICIPANTES.length,
            rows: PARTICIPANTES,
        });
    });

    describe('validarGrupo', () => {
        it('confirma o grupo quando ele existe e tem participante elegível', async () => {
            await expect(service.validarGrupo({ gru_id: 1 })).resolves.toEqual({
                gru_id: 1,
                participantes: 2, // Ana e Bruno; Carla é isenta
            });
        });

        it('não grava nada no banco (é só leitura)', async () => {
            await service.validarGrupo({ gru_id: 1 });

            expect(deps.despesaParticipanteRepository.criarVinculosEmLote).not.toHaveBeenCalled();
        });

        it('propaga GRUPO_NAO_ENCONTRADO quando o grupo não existe', async () => {
            deps.grupoService.getById.mockRejectedValue(
                Object.assign(new Error('Grupo não encontrado.'), { code: 'GRU03' })
            );

            await expect(service.validarGrupo({ gru_id: 999 })).rejects.toMatchObject({ code: 'GRU03' });
        });

        it('falha quando todos os participantes do grupo são isentos', async () => {
            deps.participanteRepository.listarPorGrupo.mockResolvedValue({
                rowCount: 1,
                rows: [{ par_id: 3, gru_id: 1, par_nome: 'Carla', par_isento: true }],
            });

            await expect(service.validarGrupo({ gru_id: 1 })).rejects.toMatchObject({ code: 'GRU04' });
        });

        it('rejeita comando sem gru_id', async () => {
            await expect(service.validarGrupo({})).rejects.toMatchObject({ code: '2' });
        });
    });

    describe('vincularDespesa', () => {
        it('vincula todos os participantes não isentos quando o comando não informa a lista', async () => {
            await service.vincularDespesa({ gru_id: 1, des_id: DES_ID, valor: 300 });

            expect(deps.despesaParticipanteRepository.criarVinculosEmLote).toHaveBeenCalledWith(DES_ID, [
                { par_id: 1, dp_exclusiva: false, dp_peso: 1 },
                { par_id: 2, dp_exclusiva: false, dp_peso: 1 },
            ]);
        });

        it('respeita a lista de participantes enviada pelo orquestrador, com peso e exclusividade', async () => {
            await service.vincularDespesa({
                gru_id: 1,
                des_id: DES_ID,
                valor: 300,
                participantes: [{ par_id: 2, dp_exclusiva: true, dp_peso: 3 }],
            });

            expect(deps.despesaParticipanteRepository.criarVinculosEmLote).toHaveBeenCalledWith(DES_ID, [
                { par_id: 2, dp_exclusiva: true, dp_peso: 3 },
            ]);
        });

        it('recusa participante que não pertence ao grupo, sem gravar nada', async () => {
            await expect(
                service.vincularDespesa({
                    gru_id: 1,
                    des_id: DES_ID,
                    valor: 300,
                    participantes: [{ par_id: 999 }],
                })
            ).rejects.toMatchObject({ code: 'GRU05' });

            expect(deps.despesaParticipanteRepository.criarVinculosEmLote).not.toHaveBeenCalled();
        });

        it('propaga GRUPO_NAO_ENCONTRADO quando o grupo não existe', async () => {
            deps.grupoService.getById.mockRejectedValue(
                Object.assign(new Error('Grupo não encontrado.'), { code: 'GRU03' })
            );

            await expect(
                service.vincularDespesa({ gru_id: 999, des_id: DES_ID, valor: 300 })
            ).rejects.toMatchObject({ code: 'GRU03' });
        });

        it('falha quando o grupo não tem participantes', async () => {
            deps.participanteRepository.listarPorGrupo.mockResolvedValue({ rowCount: 0, rows: [] });

            await expect(
                service.vincularDespesa({ gru_id: 1, des_id: DES_ID, valor: 300 })
            ).rejects.toMatchObject({ code: 'GRU04' });
        });

        it('falha quando todos os participantes do grupo são isentos', async () => {
            deps.participanteRepository.listarPorGrupo.mockResolvedValue({
                rowCount: 1,
                rows: [{ par_id: 3, gru_id: 1, par_nome: 'Carla', par_isento: true }],
            });

            await expect(
                service.vincularDespesa({ gru_id: 1, des_id: DES_ID, valor: 300 })
            ).rejects.toMatchObject({ code: 'GRU04' });
        });

        it.each([
            ['sem gru_id', { des_id: DES_ID, valor: 300 }],
            ['sem des_id', { gru_id: 1, valor: 300 }],
            ['sem valor', { gru_id: 1, des_id: DES_ID }],
            ['com valor zero', { gru_id: 1, des_id: DES_ID, valor: 0 }],
            ['com valor negativo', { gru_id: 1, des_id: DES_ID, valor: -5 }],
        ])('rejeita comando %s', async (_titulo, comando) => {
            await expect(service.vincularDespesa(comando)).rejects.toMatchObject({ code: '2' });
        });

        it('devolve a divisão calculada junto com a contagem de vínculos', async () => {
            const divisao = [
                { par_id: 1, par_nome: 'Ana', peso: 1, valor_devido: 150 },
                { par_id: 2, par_nome: 'Bruno', peso: 1, valor_devido: 150 },
            ];
            deps.divisaoService.calcularDivisaoDespesa.mockResolvedValue(divisao);

            const resultado = await service.vincularDespesa({ gru_id: 1, des_id: DES_ID, valor: 300 });

            expect(resultado).toEqual({ gru_id: 1, des_id: DES_ID, valor: 300, vinculos: 2, divisao });
        });
    });

    describe('desvincularDespesa', () => {
        it('remove todos os vínculos da despesa e informa quantos foram', async () => {
            deps.despesaParticipanteRepository.deletarPorDespesa.mockResolvedValue({ rowCount: 2, rows: [] });

            const resultado = await service.desvincularDespesa({ des_id: DES_ID });

            expect(deps.despesaParticipanteRepository.deletarPorDespesa).toHaveBeenCalledWith(DES_ID);
            expect(resultado).toEqual({ des_id: DES_ID, vinculosRemovidos: 2 });
        });

        it('não falha ao compensar uma despesa que já não tinha vínculos (idempotência)', async () => {
            deps.despesaParticipanteRepository.deletarPorDespesa.mockResolvedValue({ rowCount: 0, rows: [] });

            await expect(service.desvincularDespesa({ des_id: DES_ID })).resolves.toEqual({
                des_id: DES_ID,
                vinculosRemovidos: 0,
            });
        });

        it('rejeita compensação sem des_id', async () => {
            await expect(service.desvincularDespesa({})).rejects.toMatchObject({ code: '2' });
        });
    });
});
