import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import criarServiceParticipante from '../../service/participante.service.js';

function criarRepositoryFake() {
    return {
        listarPorGrupo: jest.fn(),
        getById: jest.fn(),
        contarPorGrupo: jest.fn(),
        criarParticipante: jest.fn(),
        editarParticipante: jest.fn(),
        deletarParticipante: jest.fn(),
    };
}

function criarGrupoServiceFake() {
    return {
        verificarDono: jest.fn().mockResolvedValue({ gru_id: 1, usu_id_dono: 10 }),
    };
}

describe('participante.service', () => {
    let repository;
    let grupoService;
    let service;

    beforeEach(() => {
        repository = criarRepositoryFake();
        grupoService = criarGrupoServiceFake();
        service = criarServiceParticipante(repository, grupoService);
    });

    describe('criarParticipante - limite por plano', () => {
        it('permite criar quando o total atual está abaixo do limite do plano free (5)', async () => {
            repository.contarPorGrupo.mockResolvedValue(4);
            repository.criarParticipante.mockResolvedValue({ par_id: 1 });

            await service.criarParticipante(
                { gru_id: 1, par_nome: 'Ana' },
                { usu_id: 10, usu_plano: 'free' }
            );

            expect(repository.criarParticipante).toHaveBeenCalledWith({ gru_id: 1, par_nome: 'Ana' });
        });

        it('bloqueia a criação quando o total já bateu o limite do plano free (5)', async () => {
            repository.contarPorGrupo.mockResolvedValue(5);

            await expect(
                service.criarParticipante({ gru_id: 1, par_nome: 'Fabio' }, { usu_id: 10, usu_plano: 'free' })
            ).rejects.toMatchObject({ code: 'GRU01' });

            expect(repository.criarParticipante).not.toHaveBeenCalled();
        });

        it('usa o limite do plano premium (15) quando o usuário é premium', async () => {
            repository.contarPorGrupo.mockResolvedValue(10);
            repository.criarParticipante.mockResolvedValue({ par_id: 1 });

            await service.criarParticipante(
                { gru_id: 1, par_nome: 'Ana' },
                { usu_id: 10, usu_plano: 'premium' }
            );

            expect(repository.criarParticipante).toHaveBeenCalled();
        });

        it('assume o plano free como padrão quando o token não traz usu_plano', async () => {
            repository.contarPorGrupo.mockResolvedValue(5);

            await expect(
                service.criarParticipante({ gru_id: 1, par_nome: 'Fabio' }, { usu_id: 10 })
            ).rejects.toMatchObject({ code: 'GRU01' });
        });

        it('bloqueia quem não é dono do grupo antes mesmo de checar o limite', async () => {
            grupoService.verificarDono.mockRejectedValue({ code: '3' });

            await expect(
                service.criarParticipante({ gru_id: 1, par_nome: 'Invasor' }, { usu_id: 99, usu_plano: 'free' })
            ).rejects.toMatchObject({ code: '3' });

            expect(repository.contarPorGrupo).not.toHaveBeenCalled();
            expect(repository.criarParticipante).not.toHaveBeenCalled();
        });
    });

    describe('getById', () => {
        it('lança PARTICIPANTE_NAO_ENCONTRADO quando não existe', async () => {
            repository.getById.mockResolvedValue({ rowCount: 0, rows: [] });

            await expect(service.getById(999)).rejects.toMatchObject({ code: 'GRU02' });
        });
    });

    describe('editarParticipante / deletarParticipante', () => {
        it('editar verifica existência antes de chamar o repository', async () => {
            repository.getById.mockResolvedValue({ rowCount: 0, rows: [] });

            await expect(service.editarParticipante({ par_id: 999, par_nome: 'X' })).rejects.toMatchObject({ code: 'GRU02' });
            expect(repository.editarParticipante).not.toHaveBeenCalled();
        });

        it('deletar verifica existência antes de chamar o repository', async () => {
            repository.getById.mockResolvedValue({ rowCount: 0, rows: [] });

            await expect(service.deletarParticipante(999)).rejects.toMatchObject({ code: 'GRU02' });
            expect(repository.deletarParticipante).not.toHaveBeenCalled();
        });
    });
});
