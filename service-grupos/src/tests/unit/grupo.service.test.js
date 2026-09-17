import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import criarServiceGrupo from '../../service/grupo.service.js';

function criarRepositoryFake() {
    return {
        listarPorUsuario: jest.fn(),
        getById: jest.fn(),
        criarGrupo: jest.fn(),
        editarGrupo: jest.fn(),
        deletarGrupo: jest.fn(),
    };
}

describe('grupo.service', () => {
    let repository;
    let service;

    beforeEach(() => {
        repository = criarRepositoryFake();
        service = criarServiceGrupo(repository);
    });

    describe('getById', () => {
        it('lança GRUPO_NAO_ENCONTRADO quando o grupo não existe', async () => {
            repository.getById.mockResolvedValue({ rowCount: 0, rows: [] });

            await expect(service.getById(999)).rejects.toMatchObject({ code: 'GRU03' });
        });

        it('retorna o grupo quando encontrado', async () => {
            const grupo = { gru_id: 1, gru_nome: 'Praia', usu_id_dono: 10 };
            repository.getById.mockResolvedValue({ rowCount: 1, rows: [grupo] });

            const resultado = await service.getById(1);

            expect(resultado).toEqual(grupo);
        });
    });

    describe('criarGrupo', () => {
        it('usa o usu_id do usuário logado como dono, ignorando qualquer usu_id_dono do body', async () => {
            repository.criarGrupo.mockResolvedValue({ gru_id: 1 });

            await service.criarGrupo({ gru_nome: 'Praia', usu_id_dono: 999 }, { usu_id: 10 });

            expect(repository.criarGrupo).toHaveBeenCalledWith({ gru_nome: 'Praia', usu_id_dono: 10 });
        });
    });

    describe('verificarDono', () => {
        it('lança SEM_PERMISSAO quando quem chama não é o dono', async () => {
            repository.getById.mockResolvedValue({ rowCount: 1, rows: [{ gru_id: 1, usu_id_dono: 10 }] });

            await expect(service.verificarDono(1, 99)).rejects.toMatchObject({ code: '3' });
        });

        it('não lança erro e retorna o grupo quando quem chama é o dono', async () => {
            const grupo = { gru_id: 1, usu_id_dono: 10 };
            repository.getById.mockResolvedValue({ rowCount: 1, rows: [grupo] });

            await expect(service.verificarDono(1, 10)).resolves.toEqual(grupo);
        });
    });

    describe('editarGrupo', () => {
        it('bloqueia edição de quem não é dono, sem chegar a chamar o repository', async () => {
            repository.getById.mockResolvedValue({ rowCount: 1, rows: [{ gru_id: 1, usu_id_dono: 10 }] });

            await expect(
                service.editarGrupo({ gru_id: 1, gru_nome: 'Novo nome' }, { usu_id: 99 })
            ).rejects.toMatchObject({ code: '3' });

            expect(repository.editarGrupo).not.toHaveBeenCalled();
        });
    });

    describe('deletarGrupo', () => {
        it('bloqueia exclusão de quem não é dono, sem chegar a chamar o repository', async () => {
            repository.getById.mockResolvedValue({ rowCount: 1, rows: [{ gru_id: 1, usu_id_dono: 10 }] });

            await expect(service.deletarGrupo(1, { usu_id: 99 })).rejects.toMatchObject({ code: '3' });
            expect(repository.deletarGrupo).not.toHaveBeenCalled();
        });
    });
});
