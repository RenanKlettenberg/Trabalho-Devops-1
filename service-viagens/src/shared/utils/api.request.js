async function request(porta, rota, method = 'GET', body = null, token = null) {
    const BASE_URL = `http://localhost:${porta}/api/v1/`;

    const headers = {};
    if (body) { headers['Content-Type'] = 'application/json'; }
    if (token) { headers['Authorization'] = `Bearer ${token}`; }

    const config = {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(`${BASE_URL}${rota}`, config);

    // Tenta extrair o JSON se a resposta tiver conteúdo
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    }

    // Retorna tanto o status HTTP quanto os dados para facilidade nas asserções do teste
    return {
        status: response.status,
        body: data
    };
}

export default {
    get: (porta, rota, token) => request(porta, rota, 'GET', null, token),
    post: (porta, rota, body, token) => request(porta, rota, 'POST', body, token),
    put: (porta, rota, body, token) => request(porta, rota, 'PUT', body, token),
    patch: (porta, rota, body, token) => request(porta, rota, 'PATCH', body, token),
    delete: (porta, rota, body, token) => request(porta, rota, 'DELETE', body, token),
};