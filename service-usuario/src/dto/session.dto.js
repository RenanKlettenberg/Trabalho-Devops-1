import z from 'zod';

const loginSchema = z.object({
    usu_email: z.email("Informe um e-mail válido.").trim(),
    usu_password: z.string("Informe uma senha.").trim()    
})

function loginDto(body) {
    return loginSchema.parse(body);
}

export { loginDto };