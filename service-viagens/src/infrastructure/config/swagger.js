
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',

        info: {
            title: 'API de Viagens',
            version: '1.0.0',
            description: 'Documentação da API de gerenciamento de viagens e eventos.'
        },

        servers: [
            {
                url: '/',
                description: 'Servidor da API'
            }
        ],

        components: {
            schemas: {
                Viagem: {
                    type: 'object',
                    properties: {
                        via_id: {
                            type: 'integer',
                            example: 1
                        },
                        via_nome: {
                            type: 'string',
                            example: 'Viagem para Florianópolis'
                        },
                        via_data_ini: {
                            type: 'string',
                            format: 'date',
                            nullable: true,
                            example: '2026-12-10'
                        },
                        via_data_fim: {
                            type: 'string',
                            format: 'date',
                            nullable: true,
                            example: '2026-12-15'
                        },
                        via_status: {
                            type: 'integer',
                            description: 'Status da viagem.',
                            example: 1
                        },
                        gru_id: {
                            type: 'integer',
                            nullable: true,
                            example: 2
                        },
                        usu_id: {
                            type: 'integer',
                            example: 1
                        }
                    }
                },

                ViagemCriacao: {
                    type: 'object',
                    required: ['via_nome', 'usu_id'],
                    properties: {
                        via_nome: {
                            type: 'string',
                            maxLength: 255,
                            example: 'Viagem para Florianópolis'
                        },
                        via_data_ini: {
                            type: 'string',
                            format: 'date',
                            example: '2026-12-10'
                        },
                        via_data_fim: {
                            type: 'string',
                            format: 'date',
                            example: '2026-12-15'
                        },
                        gru_id: {
                            type: 'integer',
                            example: 2
                        },
                        usu_id: {
                            type: 'integer',
                            example: 1
                        }
                    }
                },

                ViagemEdicao: {
                    type: 'object',
                    required: ['via_id', 'usu_id'],
                    properties: {
                        via_id: {
                            type: 'integer',
                            example: 1
                        },
                        usu_id: {
                            type: 'integer',
                            example: 1
                        },
                        via_nome: {
                            type: 'string',
                            maxLength: 255,
                            example: 'Viagem atualizada'
                        },
                        via_status: {
                            type: 'integer',
                            description: 'Status da viagem.',
                            example: 1
                        },
                        via_data_ini: {
                            type: 'string',
                            format: 'date',
                            example: '2026-12-10'
                        },
                        via_data_fim: {
                            type: 'string',
                            format: 'date',
                            example: '2026-12-15'
                        },
                        gru_id: {
                            type: 'integer',
                            example: 2
                        }
                    }
                },

                ViagemExclusao: {
                    type: 'object',
                    required: ['via_id', 'usu_id'],
                    properties: {
                        via_id: {
                            type: 'integer',
                            example: 1
                        },
                        usu_id: {
                            type: 'integer',
                            example: 1
                        }
                    }
                },

                Evento: {
                    type: 'object',
                    properties: {
                        eve_id: {
                            type: 'integer',
                            example: 1
                        },
                        eve_nome: {
                            type: 'string',
                            example: 'Visita ao museu'
                        },
                        eve_descricao: {
                            type: 'string',
                            nullable: true,
                            example: 'Visita ao museu histórico da cidade.'
                        },
                        eve_status: {
                            type: 'integer',
                            description: 'Status do evento.',
                            example: 1
                        },
                        eve_categoria: {
                            type: 'integer',
                            description: 'Categoria numérica do evento.',
                            example: 1
                        },
                        eve_data_ini: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            example: '2026-12-11T09:00:00.000Z'
                        },
                        eve_data_fim: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            example: '2026-12-11T11:00:00.000Z'
                        },
                        eve_data_estimatida: {
                            type: 'boolean',
                            example: true
                        },
                        eve_orcamento: {
                            type: 'number',
                            minimum: 0,
                            example: 150
                        },
                        eve_ordem: {
                            type: 'integer',
                            example: 1
                        },
                        eve_sync_despesa_status: {
                            type: 'integer',
                            description: 'Status da sincronização com o serviço de despesas.',
                            example: 1
                        },
                        via_id: {
                            type: 'integer',
                            example: 1
                        },
                        usu_id: {
                            type: 'integer',
                            example: 1
                        }
                    }
                },

                EventoCriacao: {
                    type: 'object',
                    required: [
                        'eve_nome',
                        'eve_categoria',
                        'via_id',
                        'usu_id'
                    ],
                    properties: {
                        eve_nome: {
                            type: 'string',
                            maxLength: 255,
                            example: 'Visita ao museu'
                        },
                        eve_descricao: {
                            type: 'string',
                            maxLength: 2000,
                            example: 'Visita ao museu histórico da cidade.'
                        },
                        eve_categoria: {
                            type: 'integer',
                            description: 'Categoria numérica definida em CATEGORIA_EVENTO.',
                            example: 1
                        },
                        eve_status: {
                            type: 'integer',
                            description: 'Status numérico definido em STATUS_EVENTO. Padrão: 1.',
                            default: 1,
                            example: 1
                        },
                        eve_data_estimatida: {
                            type: 'boolean',
                            description: 'Indica se a data do evento é estimada.',
                            default: true,
                            example: true
                        },
                        eve_data_ini: {
                            type: 'string',
                            format: 'date-time',
                            example: '2026-12-11T09:00:00.000Z'
                        },
                        eve_data_fim: {
                            type: 'string',
                            format: 'date-time',
                            example: '2026-12-11T11:00:00.000Z'
                        },
                        eve_orcamento: {
                            type: 'number',
                            minimum: 0,
                            default: 0,
                            example: 150
                        },
                        eve_ordem: {
                            type: 'integer',
                            minimum: 0,
                            description: 'Ordem do evento. Se omitida, é definida automaticamente.',
                            example: 1
                        },
                        via_id: {
                            type: 'integer',
                            example: 1
                        },
                        usu_id: {
                            type: 'integer',
                            example: 1
                        }
                    }
                },

                EventoEdicao: {
                    type: 'object',
                    required: ['eve_id', 'usu_id'],
                    properties: {
                        eve_id: {
                            type: 'integer',
                            example: 1
                        },
                        usu_id: {
                            type: 'integer',
                            example: 1
                        },
                        eve_nome: {
                            type: 'string',
                            maxLength: 255,
                            example: 'Visita ao museu atualizada'
                        },
                        eve_descricao: {
                            type: 'string',
                            maxLength: 2000,
                            example: 'Nova descrição do evento.'
                        },
                        eve_categoria: {
                            type: 'integer',
                            example: 1
                        },
                        eve_status: {
                            type: 'integer',
                            example: 1
                        },
                        eve_data_estimatida: {
                            type: 'boolean',
                            example: false
                        },
                        eve_data_ini: {
                            type: 'string',
                            format: 'date-time',
                            example: '2026-12-11T09:00:00.000Z'
                        },
                        eve_data_fim: {
                            type: 'string',
                            format: 'date-time',
                            example: '2026-12-11T11:00:00.000Z'
                        },
                        eve_orcamento: {
                            type: 'number',
                            minimum: 0,
                            example: 200
                        },
                        eve_ordem: {
                            type: 'integer',
                            minimum: 0,
                            example: 2
                        }
                    }
                },

                EventoExclusao: {
                    type: 'object',
                    required: ['eve_id', 'usu_id'],
                    properties: {
                        eve_id: {
                            type: 'integer',
                            example: 1
                        },
                        usu_id: {
                            type: 'integer',
                            example: 1
                        }
                    }
                },

                RespostaSucesso: {
                    type: 'object',
                    properties: {
                        code: {
                            type: 'string',
                            example: '1'
                        },
                        message: {
                            type: 'string',
                            example: 'Operação realizada com sucesso!'
                        },
                        payload: {
                            description: 'Dados retornados pela operação.',
                            oneOf: [
                                { type: 'object' },
                                {
                                    type: 'array',
                                    items: { type: 'object' }
                                }
                            ]
                        }
                    }
                },

                Erro: {
                    type: 'object',
                    properties: {
                        code: {
                            type: 'string',
                            example: 'VIA02'
                        },
                        message: {
                            type: 'string',
                            example: 'Viagem não encontrada.'
                        }
                    }
                }
            },

            responses: {
                Erro400: {
                    description: 'Dados inválidos.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Erro' },
                            example: {
                                code: '2',
                                message: 'O conjunto de dados passados contém dados inválidos!'
                            }
                        }
                    }
                },

                Erro403: {
                    description: 'Usuário sem permissão para acessar o recurso.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Erro' },
                            example: {
                                code: '3',
                                message: 'Você não tem permissão para acessar esse recurso!'
                            }
                        }
                    }
                },

                Erro404Viagem: {
                    description: 'Viagem não encontrada.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Erro' },
                            example: {
                                code: 'VIA02',
                                message: 'Viagem não encontrada.'
                            }
                        }
                    }
                },

                Erro404Evento: {
                    description: 'Evento não encontrado.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Erro' },
                            example: {
                                code: 'EVE01',
                                message: 'Evento não encontrado.'
                            }
                        }
                    }
                },

                Erro409: {
                    description: 'Limite de viagens ativas excedido.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Erro' },
                            example: {
                                code: 'VIA01',
                                message: 'Você atingiu o limite de viagens ativas do seu plano.'
                            }
                        }
                    }
                },

                Erro500: {
                    description: 'Erro interno inesperado.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Erro' },
                            example: {
                                code: '0',
                                message: 'Um erro inesperado ocorreu! Lamentamos o inconveniente, tente novamente mais tarde!'
                            }
                        }
                    }
                }
            }
        }
    },

    apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;