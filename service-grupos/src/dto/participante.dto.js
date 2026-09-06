import z from 'zod';

const criarSchema = z.object({
    gru_id: z.number().int().positive(),
    usu_id: z.number().int().positive().optional(),
    par_nome: z.string().min(1).max(256),
    par_isento: z.boolean().optional().default(false),
});

const editarSchema = z.object({
    par_id: z.number().int().positive(),
    par_nome: z.string().min(1).max(256).optional(),
    par_isento: z.boolean().optional(),
});

const deletarSchema = z.object({
    par_id: z.number().int().positive(),
});

function criarDto(body) {
    return criarSchema.parse(body);
}

function editarDto(body) {
    return editarSchema.parse(body);
}

function deletarDto(body) {
    return deletarSchema.parse(body);
}

export { criarDto, editarDto, deletarDto };
