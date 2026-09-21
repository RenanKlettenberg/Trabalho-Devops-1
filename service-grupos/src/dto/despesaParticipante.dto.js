import z from 'zod';

const criarSchema = z.object({
    // O des_id é o UUID gerado pelo service-despesas. Não é um número nosso:
    // é a referência externa para um dado que pertence a outro serviço.
    des_id: z.uuid(),
    par_id: z.number().int().positive(),
    dp_exclusiva: z.boolean().optional().default(false),
    dp_peso: z.number().positive().optional(),
});

const deletarSchema = z.object({
    dp_id: z.number().int().positive(),
});

const calcularDivisaoSchema = z.object({
    valor: z.number().positive(),
});

function criarDto(body) {
    return criarSchema.parse(body);
}

function deletarDto(body) {
    return deletarSchema.parse(body);
}

function calcularDivisaoDto(body) {
    return calcularDivisaoSchema.parse(body);
}

export { criarDto, deletarDto, calcularDivisaoDto };
