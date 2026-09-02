import z from 'zod';

const criarSchema = z.object({
    usu_nome: z.string({ error: "Inclua pelo menos uma letra no seu nome." }).trim()
        .max(255, "O nome deve ter menos de 255 caractéres."),
    usu_email: z.email("E-mail inválido.").trim(),
    usu_password: z.string({ required_error: "A senha é obrigatória." })
        .trim()
        .min(8, "A senha deve conter no mínimo 8 dígitos.")
        .regex(/[A-Za-z]/, "A senha deve conter pelo menos uma letra.")
        .regex(/\d/, "A senha deve conter pelo menos um número.")
        .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial.")      
})

function criarDto(body) {
    return criarSchema.parse(body);
}

export { criarDto };