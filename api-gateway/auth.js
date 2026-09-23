/*
  Validação de JWT no API Gateway, em njs (o JavaScript embutido do Nginx).

  Responde UMA pergunta: "esse token é válido?". Nada além disso.

  Quem responde "esse recurso é seu?" continua sendo cada microsserviço — o
  gateway não conhece o banco deles nem sabe qual campo representa o dono.
  As duas checagens convivem de propósito: esta pega quem vem de fora, a do
  serviço pega quem já está dentro da rede do Docker e poderia chamar o
  container diretamente, sem passar por aqui.

  Usado pela diretiva `auth_request` do nginx.conf: o Nginx faz uma
  subrequisição interna para /_auth antes de encaminhar. Se aqui responder
  204, ele segue; se responder 401, ele devolve 401 ao cliente e o
  microsserviço nunca é chamado.

  njs NÃO é Node: não tem `require` de pacote, nem Buffer, nem process.
  Só os módulos embutidos `crypto` e `fs`.
*/

const ARQUIVO_SEGREDO = '/run/secrets/SECRET_JWT';

/*
  Rotas que NÃO exigem token.

  Ficam aqui, e não no nginx.conf, por um motivo prático: `POST /api/v1/usuario`
  (cadastro, público) e `GET /api/v1/usuario` (listar todos, que deve exigir
  token) são o MESMO caminho. Separar por método em Nginx puro exigiria
  construções confusas; em JavaScript é uma lista legível.
*/
const ROTAS_PUBLICAS = [
    { metodo: 'POST', caminho: '/api/v1/session' },  // login
    { metodo: 'POST', caminho: '/api/v1/usuario' },  // cadastro
    { metodo: 'GET', caminho: '/api/v1/health' },    // monitoramento
];

function ehPublica(metodo, caminho) {
    // Descarta a query string: /api/v1/usuario?x=1 é a mesma rota.
    const semQuery = caminho.split('?')[0];

    for (let i = 0; i < ROTAS_PUBLICAS.length; i++) {
        const rota = ROTAS_PUBLICAS[i];
        if (rota.metodo === metodo && rota.caminho === semQuery) {
            return true;
        }
    }
    return false;
}

// Lido uma vez e guardado: o arquivo não muda enquanto o container vive.
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

/*
  Confere a assinatura HS256 e a expiração.

  Um JWT são três partes separadas por ponto: cabeçalho, corpo e assinatura,
  todas em base64url. A assinatura é o HMAC-SHA256 de "cabeçalho.corpo" com o
  segredo — então recalculamos e comparamos. Se bater, o token não foi
  adulterado; ele não é criptografado, apenas assinado.
*/
function verificar(r) {
    /*
      Esta função roda numa SUBREQUISIÇÃO interna, disparada por
      `auth_request`, que é sempre um GET para /_auth. O método e o caminho
      que o cliente realmente pediu chegam por variáveis do Nginx, definidas
      no bloco `server` do nginx.conf — njs não expõe a requisição pai aqui.
    */
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

    // Corpo do token: base64url -> JSON. Só chegamos aqui com assinatura ok,
    // então dá para confiar no conteúdo.
    let corpo;
    try {
        corpo = JSON.parse(Buffer.from(pedacos[1], 'base64url').toString());
    } catch (erro) {
        return recusar(r, 'corpo do token nao e JSON');
    }

    if (corpo.exp && corpo.exp < Math.floor(Date.now() / 1000)) {
        return recusar(r, 'token expirado');
    }

    // 204: autorizado, sem corpo. O Nginx então encaminha a requisição
    // original, com o header Authorization intacto — o microsserviço
    // continua recebendo o token e fazendo a própria checagem.
    r.return(204);
}

export default { verificar };
