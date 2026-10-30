import { CATEGORIAS_VALIDAS } from '../../domain/entities/Categoria.js';

// Especificação OpenAPI do service-despesas, servida pelo Swagger UI em
// GET /api-docs (e o JSON cru em GET /api-docs.json).
const erro = (descricao, exemplo) => ({
  description: descricao,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Erro' },
      example: { status: 'error', ...exemplo },
    },
  },
});

const naoAutenticado = erro('Token ausente, inválido ou expirado', { message: 'Usuário não autenticado.' });
const naoEncontrada = erro('Despesa não encontrada', {
  codigo: 'DESPESA_NAO_ENCONTRADA',
  message: 'Despesa não encontrada: "3f1c...".',
});

const parametroId = (nome, descricao) => ({
  name: nome,
  in: 'path',
  required: true,
  description: descricao,
  schema: { type: 'string' },
});

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'service-despesas',
    version: '1.1.0',
    description:
      'Registro, consulta e estorno das despesas de uma viagem, e o dashboard financeiro ' +
      'com os valores convertidos para a moeda principal. Todas as rotas exigem o JWT ' +
      'emitido pelo service-usuario (botão **Authorize**).',
  },
  servers: [{ url: '/', description: 'Este serviço' }],
  tags: [
    { name: 'Despesas', description: 'Registro, consulta e estorno' },
    { name: 'Dashboard', description: 'Totais da viagem convertidos para a moeda principal' },
  ],
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/despesas': {
      post: {
        tags: ['Despesas'],
        summary: 'Registra uma despesa',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/NovaDespesa' },
            },
          },
        },
        responses: {
          201: {
            description: 'Despesa registrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Despesa' } } },
          },
          400: erro('Valor, moeda, categoria ou viagemId inválidos', {
            codigo: 'VALOR_INVALIDO',
            message: 'Valor da despesa inválido: "0". Deve ser um número maior que zero.',
          }),
          401: naoAutenticado,
        },
      },
    },
    '/api/despesas/categorias': {
      get: {
        tags: ['Despesas'],
        summary: 'Lista as categorias aceitas',
        responses: {
          200: {
            description: 'Categorias válidas',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Categoria' } },
                example: CATEGORIAS_VALIDAS,
              },
            },
          },
          401: naoAutenticado,
        },
      },
    },
    '/api/despesas/viagem/{viagemId}': {
      get: {
        tags: ['Despesas'],
        summary: 'Lista as despesas de uma viagem',
        parameters: [parametroId('viagemId', 'Id da viagem')],
        responses: {
          200: {
            description: 'Despesas da viagem, ativas e estornadas',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Despesa' } },
              },
            },
          },
          401: naoAutenticado,
        },
      },
    },
    '/api/despesas/{id}': {
      get: {
        tags: ['Despesas'],
        summary: 'Busca uma despesa pelo id',
        parameters: [parametroId('id', 'Id da despesa')],
        responses: {
          200: {
            description: 'Despesa encontrada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Despesa' } } },
          },
          401: naoAutenticado,
          404: naoEncontrada,
        },
      },
      delete: {
        tags: ['Despesas'],
        summary: 'Estorna uma despesa',
        description: 'A despesa não é apagada: passa para o status ESTORNADA e sai dos totais do dashboard.',
        parameters: [parametroId('id', 'Id da despesa')],
        responses: {
          200: {
            description: 'Despesa estornada',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Despesa' } } },
          },
          401: naoAutenticado,
          404: naoEncontrada,
          409: erro('A despesa já estava estornada', {
            codigo: 'DESPESA_JA_ESTORNADA',
            message: 'Despesa "3f1c..." já está estornada.',
          }),
        },
      },
    },
    '/api/dashboard/{viagemId}': {
      get: {
        tags: ['Dashboard'],
        summary: 'Dashboard financeiro da viagem',
        description: 'Soma as despesas ativas convertidas para a moeda principal, no total e por categoria.',
        parameters: [
          parametroId('viagemId', 'Id da viagem'),
          {
            name: 'moedaPrincipal',
            in: 'query',
            required: false,
            description: 'Código ISO 4217 da moeda de destino',
            schema: { $ref: '#/components/schemas/Moeda', default: 'BRL' },
          },
        ],
        responses: {
          200: {
            description: 'Totais consolidados',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Dashboard' } } },
          },
          400: erro('Moeda principal inválida', {
            codigo: 'MOEDA_INVALIDA',
            message: 'Moeda inválida: "REAL". Use o código ISO-4217 de 3 letras (ex: BRL, USD).',
          }),
          401: naoAutenticado,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Categoria: { type: 'string', enum: CATEGORIAS_VALIDAS, example: 'ALIMENTACAO' },
      Moeda: { type: 'string', pattern: '^[A-Z]{3}$', example: 'BRL' },
      NovaDespesa: {
        type: 'object',
        required: ['valor', 'moeda', 'categoria', 'viagemId'],
        properties: {
          descricao: { type: 'string', example: 'Jantar no centro' },
          valor: { type: 'number', minimum: 0, exclusiveMinimum: true, example: 120.5 },
          moeda: { $ref: '#/components/schemas/Moeda' },
          categoria: { $ref: '#/components/schemas/Categoria' },
          viagemId: { type: 'string', example: '1' },
          eventoId: { type: 'string', nullable: true, example: null },
        },
      },
      Despesa: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          descricao: { type: 'string', example: 'Jantar no centro' },
          valor: { type: 'number', example: 120.5 },
          moeda: { $ref: '#/components/schemas/Moeda' },
          categoria: { $ref: '#/components/schemas/Categoria' },
          viagemId: { type: 'string', example: '1' },
          eventoId: { type: 'string', nullable: true, example: null },
          status: { type: 'string', enum: ['ATIVA', 'ESTORNADA'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Dashboard: {
        type: 'object',
        properties: {
          viagemId: { type: 'string', example: '1' },
          moedaPrincipal: { $ref: '#/components/schemas/Moeda' },
          totalGeral: { type: 'number', example: 500 },
          totalPorCategoria: {
            type: 'object',
            additionalProperties: { type: 'number' },
            example: { HOSPEDAGEM: 500 },
          },
          quantidadeDespesas: { type: 'integer', example: 1 },
          quantidadeEstornadas: { type: 'integer', example: 0 },
          despesas: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                descricao: { type: 'string' },
                categoria: { $ref: '#/components/schemas/Categoria' },
                valorOriginal: { type: 'number', example: 100 },
                moedaOriginal: { type: 'string', example: 'USD' },
                taxa: { type: 'number', example: 5 },
                valorConvertido: { type: 'number', example: 500 },
              },
            },
          },
        },
      },
      Erro: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          codigo: { type: 'string', description: 'Presente nos erros de domínio' },
          message: { type: 'string' },
        },
      },
    },
  },
};

export { openapi };
export default openapi;
