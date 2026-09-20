// dto/usuario.dto.js
import z from 'zod';
import PLANO_USUARIO from '../shared/constants/usuario.constants.js';

const criarSchema = z.object({
    usu_nome: z.string({ error: "Inclua pelo menos uma letra no seu nome." }).trim()
        .max(255, "O nome deve ter menos de 255 caractéres."),
    usu_email: z.email("E-mail inválido.").trim(),
    usu_password: z.string({ required_error: "A senha é obrigatória." })
        .trim()
        .min(8, "A senha deve conter no mínimo 8 dígitos.")
        .regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra.")
        .regex(/\d/, "A senha deve conter pelo menos um número.")
        .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial."),
    usu_plano: z.string().trim()
        .refine((val) => Object.values(PLANO_USUARIO).includes(val), {
            message: "Plano inválido. Valores aceitos: 'free' ou 'premium'.",
        })
        .default(PLANO_USUARIO.FREE),
})

const editarSchema = z.object({
    usu_id: z.number({ required_error: "ID do usuário é obrigatório." }).int(),

    usu_nome: z.string().trim()
        .max(255, "O nome deve ter menos de 255 caractéres.")
        .optional(),

    usu_email: z.email("E-mail inválido.").trim().optional(),

    usu_plano: z.string().trim()
        .refine((val) => Object.values(PLANO_USUARIO).includes(val), {
            message: "Plano inválido. Valores aceitos: 'free' ou 'premium'.",
        })
        .optional(),
})

const deletarSchema = z.object({
    usu_id: z.number({ required_error: "ID do usuário é obrigatório." }).int(),
})

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