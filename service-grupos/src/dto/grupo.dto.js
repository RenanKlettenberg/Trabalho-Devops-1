import z from 'zod';

const criarSchema = z.object({
    gru_nome: z.string().min(1).max(256),
});

const editarSchema = z.object({
    gru_id: z.number().int().positive(),
    gru_nome: z.string().min(1).max(256),
});

function criarDto(body) {
    return criarSchema.parse(body);
}

function editarDto(body) {
    return editarSchema.parse(body);
}

export { criarDto, editarDto };
