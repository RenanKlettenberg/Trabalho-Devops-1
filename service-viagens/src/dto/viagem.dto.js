import z from 'zod';

const criarSchema = z.object({
    
})

function criarDto(body) {
    return criarSchema.parse(body);
}

export { criarDto };