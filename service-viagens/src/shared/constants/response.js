const RESPONSE = Object.freeze({
    ERRO_DESCONHECIDO: {
        code: "0",
        message: "Um erro inesperado ocorreu! Lamentamos o incoveniente, tente novamente mais tarde!",
        status: 500
    },
    SUCESSO: {
        code: "1",
        message: "Operação realizada com sucesso!",
    },
    DADO_INVALIDO: {
        code: "2",
        message: "O conjunto de dados passados contém dados inválidos!",
        status: 400
    },
    SEM_PERMISSAO: {
        code: "3",
        message: "Você não tem permissão para acessar esse recurso!",
        status: 403
    },
    USUARIO_JA_CADASTRADO: {
        code: "USU01",
        message: "Já existe um usuário cadastrado com esse e-mail!",
        status: 409
    },
    CREDENCIAIS_INVALIDAS: {
        code: "SES01",
        message: "Login ou senha inválidos.",
        status: 401
    },
    USUARIO_NAO_LOGADO: {
        code: "SES02",
        message: "Faça login para poder continuar.",
        status: 401
    },
    TOKEN_INVALIDO: {
        code: "SES03",
        message: "Token inválido.",
        status: 401
    },
});

export default RESPONSE;