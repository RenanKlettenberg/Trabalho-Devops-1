
const ARQUIVO_SEGREDO = '/run/secrets/SECRET_JWT';


const ROTAS_PUBLICAS = [
    { metodo: 'POST', caminho: '/api/v1/session' },  // login
    { metodo: 'POST', caminho: '/api/v1/usuario' },  // cadastro
    { metodo: 'GET', caminho: '/api/v1/health' },    // monitoramento
];

function ehPublica(metodo, caminho) {
    const semQuery = caminho.split('?')[0];

    for (let i = 0; i < ROTAS_PUBLICAS.length; i++) {
        const rota = ROTAS_PUBLICAS[i];
        if (rota.metodo === metodo && rota.caminho === semQuery) {
            return true;
        }
    }
    return false;
}

let segredoEmCache = null;

function segredo() {
    if (segredoEmCache === null) {
        segredoEmCache = require('fs')
            .readFileSync(ARQUIVO_SEGREDO)
            .toString()
            .trim();
    }
    return segredoEmCache;
}

function recusar(r, motivo) {
    r.headersOut['Content-Type'] = 'application/json';
    r.return(401, JSON.stringify({
        code: 'SES03',
        message: 'Token inválido.',
        origem: 'api-gateway',
        detalhe: motivo,
    }));
}

function verificar(r) {

    const metodo = r.variables.metodo_cliente;
    const caminho = r.variables.uri_cliente;

    if (ehPublica(metodo, caminho)) {
        r.return(204);
        return;
    }

    const cabecalho = r.headersIn.Authorization;

    if (!cabecalho) {
        return recusar(r, 'header Authorization ausente');
    }

    const partes = cabecalho.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return recusar(r, 'formato esperado: Bearer <token>');
    }

    const pedacos = partes[1].split('.');
    if (pedacos.length !== 3) {
        return recusar(r, 'token nao tem as 3 partes de um JWT');
    }

    const assinado = pedacos[0] + '.' + pedacos[1];
    const assinaturaRecebida = pedacos[2];

    let assinaturaEsperada;
    try {
        assinaturaEsperada = require('crypto')
            .createHmac('sha256', segredo())
            .update(assinado)
            .digest('base64url');
    } catch (erro) {
        // Falta do secret é problema de configuração, não do cliente.
        r.error('[gateway/auth] falha ao assinar: ' + erro.message);
        r.return(500);
        return;
    }

    if (assinaturaEsperada !== assinaturaRecebida) {
        return recusar(r, 'assinatura invalida');
    }


    let corpo;
    try {
        corpo = JSON.parse(Buffer.from(pedacos[1], 'base64url').toString());
    } catch (erro) {
        return recusar(r, 'corpo do token nao e JSON');
    }

    if (corpo.exp && corpo.exp < Math.floor(Date.now() / 1000)) {
        return recusar(r, 'token expirado');
    }


    r.return(204);
}

export default { verificar };
