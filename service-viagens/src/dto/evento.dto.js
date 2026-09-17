// dto/evento.dto.js
import z from 'zod';
import { CATEGORIA_EVENTO, STATUS_EVENTO } from '../shared/constants/evento.constants.js';

const baseSchema = z.object({
    eve_nome: z.string({ error: "Inclua um nome para o evento." }).trim()
        .max(255, "O nome deve ter menos de 255 caractéres."),

    eve_descricao: z.string().trim()
        .max(2000, "A descrição deve ter menos de 2000 caractéres.")
        .optional(),

    eve_categoria: z.number({ required_error: "Categoria é obrigatória." }).int()
        .refine((val) => Object.values(CATEGORIA_EVENTO).includes(val), {
            message: "Categoria inválida.",
        }),

    eve_status: z.number().int()
        .refine((val) => Object.values(STATUS_EVENTO).includes(val), {
            message: "Status inválido.",
        })
        .default(1),

    eve_data_estimatida: z.boolean().default(true),

    eve_data_ini: z.coerce.date({ error: "Data de início inválida." }).optional(),
    eve_data_fim: z.coerce.date({ error: "Data de fim inválida." }).optional(),

    eve_orcamento: z.number()
        .nonnegative("Orçamento não pode ser negativo.")
        .default(0),

    eve_ordem: z.number().int().nonnegative().optional(),

    via_id: z.number({ required_error: "Viagem é obrigatória." }).int(),
    usu_id: z.number({ required_error: "Usuário é obrigatório." }).int(),
})
.refine((data) => data.eve_data_estimatida === true || (!!data.eve_data_ini && !!data.eve_data_fim), {
    message: "Eventos com horário fixo exigem data de início e fim.",
    path: ["eve_data_ini"],
})
.refine((data) => !data.eve_data_ini || !data.eve_data_fim || data.eve_data_fim >= data.eve_data_ini, {
    message: "A data de fim não pode ser anterior à data de início.",
    path: ["eve_data_fim"],
});

const deletarSchema = z.object({
    eve_id: z.number({ required_error: "ID do evento é obrigatório." }).int(),
});

function deletarDto(body) {
    return deletarSchema.parse(body);
}

const criarSchema = baseSchema;

const editarSchema = z.object({
    eve_id: z.number({ required_error: "ID do evento é obrigatório." }).int(),

    eve_nome: z.string().trim()
        .max(255, "O nome deve ter menos de 255 caractéres.")
        .optional(),

    eve_descricao: z.string().trim()
        .max(2000, "A descrição deve ter menos de 2000 caractéres.")
        .optional(),

    eve_categoria: z.number().int()
        .refine((val) => Object.values(CATEGORIA_EVENTO).includes(val), {
            message: "Categoria inválida.",
        })
        .optional(),

    eve_status: z.number().int()
        .refine((val) => Object.values(STATUS_EVENTO).includes(val), {
            message: "Status inválido.",
        })
        .optional(),

    eve_data_estimatida: z.boolean().optional(),
    eve_data_ini: z.coerce.date({ error: "Data de início inválida." }).optional(),
    eve_data_fim: z.coerce.date({ error: "Data de fim inválida." }).optional(),

    eve_orcamento: z.number()
        .nonnegative("Orçamento não pode ser negativo.")
        .optional(),

    eve_ordem: z.number().int().nonnegative().optional(),
})
.refine((data) => !data.eve_data_ini || !data.eve_data_fim || data.eve_data_fim >= data.eve_data_ini, {
    message: "A data de fim não pode ser anterior à data de início.",
    path: ["eve_data_fim"],
});

function criarDto(body) {
    return criarSchema.parse(body);
}

function editarDto(body) {
    return editarSchema.parse(body);
}

export { criarDto, editarDto, deletarDto };