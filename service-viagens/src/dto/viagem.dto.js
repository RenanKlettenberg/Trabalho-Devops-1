import z from 'zod';
import STATUS_VIAGEM from '../shared/constants/viagem.constants.js';

const criarSchema = z.object({
    via_nome: z.string({ error: "Inclua um nome para a viagem." }).trim()
        .max(255, "O nome deve ter menos de 255 caractéres."),

    via_data_ini: z.coerce.date({ error: "Data de início inválida." }).optional(),
    via_data_fim: z.coerce.date({ error: "Data de fim inválida." }).optional(),

    gru_id: z.number().int().optional(),
    usu_id: z.number({ required_error: "Usuário é obrigatório." }).int(),
})
.refine((data) => (!!data.via_data_ini) === (!!data.via_data_fim), {
    message: "Informe data de início e fim juntas, ou nenhuma das duas (viagem por período).",
    path: ["via_data_fim"],
})
.refine((data) => !data.via_data_ini || !data.via_data_fim || data.via_data_fim >= data.via_data_ini, {
    message: "A data de fim não pode ser anterior à data de início.",
    path: ["via_data_fim"],
});

const editarSchema = z.object({
    via_id: z.number({ required_error: "ID da viagem é obrigatório." }).int(),

    via_nome: z.string().trim()
        .max(255, "O nome deve ter menos de 255 caractéres.")
        .optional(),

    via_status: z.number().int()
        .refine((val) => Object.values(STATUS_VIAGEM).includes(val), {
            message: "Status de viagem inválido.",
        })
        .optional(),

    via_data_ini: z.coerce.date({ error: "Data de início inválida." }).optional(),
    via_data_fim: z.coerce.date({ error: "Data de fim inválida." }).optional(),

    gru_id: z.number().int().optional(),
})
.refine((data) => !data.via_data_ini || !data.via_data_fim || data.via_data_fim >= data.via_data_ini, {
    message: "A data de fim não pode ser anterior à data de início.",
    path: ["via_data_fim"],
});

const deletarSchema = z.object({
    via_id: z.number({ required_error: "ID da viagem é obrigatório." }).int(),
});

function deletarDto(body) {
    return deletarSchema.parse(body);
}

function criarDto(body) {
    return criarSchema.parse(body);
}

function editarDto(body) {
    return editarSchema.parse(body);
}

export { criarDto, editarDto };