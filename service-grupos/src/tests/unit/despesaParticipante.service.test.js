import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import criarServiceDespesaParticipante from '../../service/despesaParticipante.service.js';

const DES_ID = '3ab18a06-d42b-4d10-ab18-1761105a51af'; // UUID vindo do service-despesas

describe('despesaParticipante.service', () => {
    let repository;
    let participanteService;
    let grupoService;
    let service;

    beforeEach(() => {
        repository = {
            listarPorDespesa: jest.fn(),
            getById: jest.fn(),
            criarVinculo: jest.fn(),
            deletarVinculo: jest.fn(),
        };
        participanteService = { getById: jest.fn() };
        grupoService = { verificarDono: jest.fn() };
        service = criarServiceDespesaParticipante(repository, participanteService, grupoService);
    });

    describe('criarVinculo', () => {
        it('descobre o grupo do participante e confirma que quem chama é o dono desse grupo', async () => {
            participanteService.getById.mockResolvedValue({ rows: [{ par_id: 5, gru_id: 42 }] });
            grupoService.verificarDono.mockResolvedValue({ gru_id: 42, usu_id_dono: 10 });
            repository.criarVinculo.mockResolvedValue({ dp_id: 1 });

            await service.criarVinculo({ des_id: DES_ID, par_id: 5, dp_exclusiva: false }, { usu_id: 10 });

            expect(grupoService.verificarDono).toHaveBeenCalledWith(42, 10);
            expect(repository.criarVinculo).toHaveBeenCalledWith({ des_id: DES_ID, par_id: 5, dp_exclusiva: false });
        });

        it('bloqueia quem não é dono do grupo do participante', async () => {
            participanteService.getById.mockResolvedValue({ rows: [{ par_id: 5, gru_id: 42 }] });
            grupoService.verificarDono.mockRejectedValue({ code: '3' });

            await expect(
                service.criarVinculo({ des_id: DES_ID, par_id: 5 }, { usu_id: 99 })
            ).rejects.toMatchObject({ code: '3' });

            expect(repository.criarVinculo).not.toHaveBeenCalled();
        });
    });

    describe('deletarVinculo', () => {
        it('lança erro quando o vínculo não existe', async () => {
            repository.getById.mockResolvedValue({ rowCount: 0, rows: [] });

            await expect(service.deletarVinculo(999)).rejects.toMatchObject({ code: 'GRU02' });
            expect(repository.deletarVinculo).not.toHaveBeenCalled();
        });

        it('remove quando o vínculo existe', async () => {
            repository.getById.mockResolvedValue({ rowCount: 1, rows: [{ dp_id: 1 }] });
            repository.deletarVinculo.mockResolvedValue({ rowCount: 1 });

            await service.deletarVinculo(1);

            expect(repository.deletarVinculo).toHaveBeenCalledWith(1);
        });
    });
});
