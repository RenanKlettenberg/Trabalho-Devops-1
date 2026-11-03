import { createRequire } from 'module';

// Especificação OpenAPI (Swagger) do service-grupos.
// Só é servida quando SWAGGER_ENABLED=true (DEV); em HOMOL fica desligada.

const { version } = createRequire(import.meta.url)('../../package.json');

const ref = (nome) => ({ $ref: `#/components/schemas/${nome}` });
const lista = (nome) => ({ type: 'array', items: ref(nome) });

const corpo = (nome) => ({
    required: true,
    content: { 'application/json': { schema: ref(nome) } },
});

const resposta = (descricao, payload = {}) => ({
    description: descricao,
    content: {
        'application/json': {
            schema: {
                type: 'object',
                properties: {
                    code: { type: 'string' },
                    message: { type: 'string' },
                    payload,
                },
            },
        },
    },
});

const idInteiro = (nome, descricao) => ({
    name: nome, in: 'path', required: true, description: descricao, schema: { type: 'integer' },
});

const idUuid = (nome, descricao) => ({
    name: nome, in: 'path', required: true, description: descricao, schema: { type: 'string', format: 'uuid' },
});

const erros = {
    400: { description: 'Dados inválidos' },
    401: { description: 'Token ausente ou inválido' },
};

const openapi = {
    openapi: '3.0.3',
    info: {
        title: 'service-grupos',
        version,
        description: 'Grupos de viagem, participantes e divisão de custos — TripManager',
    },
    servers: [{ url: '/api/v1' }],
    security: [{ bearerAuth: [] }],
    tags: [
        { name: 'Grupos' },
        { name: 'Participantes' },
        { name: 'Despesas x Participantes' },
        { name: 'Divisão' },
        { name: 'Health' },
    ],
    paths: {
        '/health': {
            get: {
                tags: ['Health'],
                summary: 'Verifica se o serviço está no ar',
                security: [],
                responses: { 200: { description: 'Serviço no ar' } },
            },
        },
        '/grupo': {
            get: {
                tags: ['Grupos'],
                summary: 'Lista os grupos do usuário logado',
                responses: { 200: resposta('Lista de grupos', lista('Grupo')), ...erros },
            },
            post: {
                tags: ['Grupos'],
                summary: 'Cria um grupo (o dono é o usuário do token)',
                requestBody: corpo('GrupoEntrada'),
                responses: { 200: resposta('Grupo criado', ref('Grupo')), ...erros },
            },
        },
        '/grupo/{id}': {
            parameters: [idInteiro('id', 'ID do grupo')],
            get: {
                tags: ['Grupos'],
                summary: 'Busca um grupo pelo ID',
                responses: { 200: resposta('Grupo encontrado', ref('Grupo')), ...erros },
            },
            put: {
                tags: ['Grupos'],
                summary: 'Edita o nome do grupo (só o dono)',
                requestBody: corpo('GrupoEntrada'),
                responses: { 200: resposta('Grupo editado', ref('Grupo')), ...erros },
            },
            delete: {
                tags: ['Grupos'],
                summary: 'Exclui o grupo (só o dono)',
                responses: { 200: resposta('Grupo excluído'), ...erros },
            },
        },
        '/participante': {
            post: {
                tags: ['Participantes'],
                summary: 'Adiciona um participante a um grupo',
                requestBody: corpo('ParticipanteEntrada'),
                responses: { 200: resposta('Participante criado', ref('Participante')), ...erros },
            },
        },
        '/participante/grupo/{gruId}': {
            get: {
                tags: ['Participantes'],
                summary: 'Lista os participantes de um grupo',
                parameters: [idInteiro('gruId', 'ID do grupo')],
                responses: { 200: resposta('Lista de participantes', lista('Participante')), ...erros },
            },
        },
        '/participante/{id}': {
            parameters: [idInteiro('id', 'ID do participante')],
            get: {
                tags: ['Participantes'],
                summary: 'Busca um participante pelo ID',
                responses: { 200: resposta('Participante encontrado', lista('Participante')), ...erros },
            },
            put: {
                tags: ['Participantes'],
                summary: 'Edita nome e/ou isenção do participante',
                requestBody: corpo('ParticipanteEdicao'),
                responses: { 200: resposta('Participante editado', ref('Participante')), ...erros },
            },
            delete: {
                tags: ['Participantes'],
                summary: 'Remove o participante',
                responses: { 200: resposta('Participante removido'), ...erros },
            },
        },
        '/despesa-participante': {
            post: {
                tags: ['Despesas x Participantes'],
                summary: 'Vincula um participante a uma despesa',
                requestBody: corpo('VinculoEntrada'),
                responses: { 200: resposta('Vínculo criado', ref('Vinculo')), ...erros },
            },
        },
        '/despesa-participante/despesa/{desId}': {
            get: {
                tags: ['Despesas x Participantes'],
                summary: 'Lista os participantes vinculados a uma despesa',
                parameters: [idUuid('desId', 'UUID da despesa (gerado pelo service-despesas)')],
                responses: { 200: resposta('Lista de vínculos', lista('Vinculo')), ...erros },
            },
        },
        '/despesa-participante/{id}': {
            delete: {
                tags: ['Despesas x Participantes'],
                summary: 'Remove um vínculo',
                parameters: [idInteiro('id', 'ID do vínculo')],
                responses: { 200: resposta('Vínculo removido'), ...erros },
            },
        },
        '/grupo/{gruId}/despesa/{desId}/divisao': {
            post: {
                tags: ['Divisão'],
                summary: 'Calcula quanto cada participante deve pagar de uma despesa',
                parameters: [
                    idInteiro('gruId', 'ID do grupo'),
                    idUuid('desId', 'UUID da despesa'),
                ],
                requestBody: corpo('DivisaoEntrada'),
                responses: { 200: resposta('Divisão calculada'), ...erros },
            },
        },
    },
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
        schemas: {
            Grupo: {
                type: 'object',
                properties: {
                    gru_id: { type: 'integer' },
                    gru_nome: { type: 'string' },
                    usu_id_dono: { type: 'integer' },
                    gru_created_at: { type: 'string', format: 'date-time' },
                },
            },
            GrupoEntrada: {
                type: 'object',
                required: ['gru_nome'],
                properties: { gru_nome: { type: 'string', maxLength: 256, example: 'Viagem Floripa' } },
            },
            Participante: {
                type: 'object',
                properties: {
                    par_id: { type: 'integer' },
                    gru_id: { type: 'integer' },
                    usu_id: { type: 'integer', nullable: true },
                    par_nome: { type: 'string' },
                    par_isento: { type: 'boolean' },
                    par_created_at: { type: 'string', format: 'date-time' },
                },
            },
            ParticipanteEntrada: {
                type: 'object',
                required: ['gru_id', 'par_nome'],
                properties: {
                    gru_id: { type: 'integer', example: 1 },
                    usu_id: { type: 'integer', description: 'Opcional: se o participante tem conta' },
                    par_nome: { type: 'string', maxLength: 256, example: 'Maria' },
                    par_isento: { type: 'boolean', default: false },
                },
            },
            ParticipanteEdicao: {
                type: 'object',
                properties: {
                    par_nome: { type: 'string', maxLength: 256 },
                    par_isento: { type: 'boolean' },
                },
            },
            Vinculo: {
                type: 'object',
                properties: {
                    dp_id: { type: 'integer' },
                    des_id: { type: 'string', format: 'uuid' },
                    par_id: { type: 'integer' },
                    dp_exclusiva: { type: 'boolean' },
                    dp_peso: { type: 'number' },
                },
            },
            VinculoEntrada: {
                type: 'object',
                required: ['des_id', 'par_id'],
                properties: {
                    des_id: { type: 'string', format: 'uuid' },
                    par_id: { type: 'integer', example: 1 },
                    dp_exclusiva: { type: 'boolean', default: false },
                    dp_peso: { type: 'number', example: 1 },
                },
            },
            DivisaoEntrada: {
                type: 'object',
                required: ['valor'],
                properties: { valor: { type: 'number', example: 150.5 } },
            },
        },
    },
};

export default openapi;
