
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',

        info: {
            title: 'API de Usuários',
            version: '1.0.0',
            description: 'Documentação da API de gerenciamento de usuários.'
        },

        servers: [
            {
                url: '/',
                description: 'Servidor da API'
            }
        ],

        components: {
            schemas: {
                Usuario: {
                    type: 'object',
                    properties: {
                        usu_id: {
                            type: 'integer',
                            example: 1
                        },
                        usu_nome: {
                            type: 'string',
                            example: 'João da Silva'
                        },
                        usu_email: {
                            type: 'string',
                            format: 'email',
                            example: 'joao@email.com'
                        },
                        usu_plano: {
                            type: 'string',
                            enum: ['free', 'premium'],
                            example: 'free'
                        }
                    }
                },

                UsuarioCriacao: {
                    type: 'object',
                    required: ['usu_nome', 'usu_email', 'usu_password'],
                    properties: {
                        usu_nome: {
                            type: 'string',
                            maxLength: 255,
                            example: 'João da Silva'
                        },
                        usu_email: {
                            type: 'string',
                            format: 'email',
                            example: 'joao@email.com'
                        },
                        usu_password: {
                            type: 'string',
                            minLength: 8,
                            description: 'Deve conter pelo menos uma letra, um número e um caractere especial.',
                            example: 'Senha@123'
                        },
                        usu_plano: {
                            type: 'string',
                            enum: ['free', 'premium'],
                            default: 'free',
                            example: 'free'
                        }
                    }
                },

                UsuarioEdicao: {
                    type: 'object',
                    required: ['usu_id'],
                    properties: {
                        usu_id: {
                            type: 'integer',
                            example: 1
                        },
                        usu_nome: {
                            type: 'string',
                            maxLength: 255,
                            example: 'João da Silva'
                        },
                        usu_email: {
                            type: 'string',
                            format: 'email',
                            example: 'joao@email.com'
                        },
                        usu_plano: {
                            type: 'string',
                            enum: ['free', 'premium'],
                            example: 'premium'
                        }
                    }
                },

                UsuarioExclusao: {
                    type: 'object',
                    required: ['usu_id'],
                    properties: {
                        usu_id: {
                            type: 'integer',
                            example: 1
                        }
                    }
                },

                UsuarioCriado: {
                    allOf: [
                        { $ref: '#/components/schemas/Usuario' },
                        {
                            type: 'object',
                            properties: {
                                jwt: {
                                    type: 'string',
                                    description: 'Token JWT gerado para o usuário.'
                                }
                            }
                        }
                    ]
                },

                Login: {
                    type: 'object',
                    required: ['usu_email', 'usu_password'],
                    properties: {
                        usu_email: {
                            type: 'string',
                            format: 'email',
                            example: 'joao@email.com'
                        },
                        usu_password: {
                            type: 'string',
                            example: 'Senha@123'
                        }
                    }
                },

                UsuarioAutenticado: {
                    allOf: [
                        { $ref: '#/components/schemas/Usuario' },
                        {
                            type: 'object',
                            properties: {
                                jwt: {
                                    type: 'string',
                                    description: 'Token JWT de autenticação.'
                                }
                            }
                        }
                    ]
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
                            type: 'object',
                            description: 'Dados retornados pela operação.'
                        }
                    }
                },

                Erro: {
                    type: 'object',
                    properties: {
                        code: {
                            type: 'string',
                            example: 'USU02'
                        },
                        message: {
                            type: 'string',
                            example: 'Usuário não encontrado.'
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

                Erro401: {
                    description: 'Credenciais inválidas, usuário não autenticado ou token inválido.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Erro' },
                            examples: {
                                credenciaisInvalidas: {
                                    summary: 'Credenciais inválidas',
                                    value: {
                                        code: 'SES01',
                                        message: 'Login ou senha inválidos.'
                                    }
                                },
                                usuarioNaoLogado: {
                                    summary: 'Usuário não autenticado',
                                    value: {
                                        code: 'SES02',
                                        message: 'Faça login para poder continuar.'
                                    }
                                },
                                tokenInvalido: {
                                    summary: 'Token inválido',
                                    value: {
                                        code: 'SES03',
                                        message: 'Token inválido.'
                                    }
                                }
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

                Erro404: {
                    description: 'Usuário não encontrado.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Erro' },
                            example: {
                                code: 'USU02',
                                message: 'Usuário não encontrado.'
                            }
                        }
                    }
                },

                Erro409: {
                    description: 'Já existe um usuário cadastrado com esse e-mail.',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Erro' },
                            example: {
                                code: 'USU01',
                                message: 'Já existe um usuário cadastrado com esse e-mail!'
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
                                message: 'Um erro inesperado ocorreu!'
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
