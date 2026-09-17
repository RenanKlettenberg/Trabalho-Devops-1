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
    VIAGENS_LIMITE_EXCEDIDO: {
        code: "VIA01",
        message: "Você atingiu o limite de viagens ativas do seu plano.",
        status: 409
    },
    VIAGEM_NAO_ENCONTRADA: {
        code: "VIA02",
        message: "Viagem não encontrada.",
        status: 404
    },
});

export default RESPONSE;