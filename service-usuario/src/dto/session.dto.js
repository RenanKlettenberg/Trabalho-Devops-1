import z from 'zod';

const loginSchema = z.object({
    usu_email: z.email("Informe um e-mail válido.").trim(),
    usu_password: z.string("Informe uma senha.").trim()    
})

const logoffSchema = z.object({
    usu_id: z.string('Usuário não informado'),
})

function loginDto(body) {
    return loginSchema.parse(body);
}

function logoffDto(body) {
    return logoffSchema.parse(body);
}

export { loginDto, logoffDto };