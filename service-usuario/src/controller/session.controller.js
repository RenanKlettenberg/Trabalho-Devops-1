import RESPONSE from '../shared/constants/response.js';
import * as dto from '../dto/session.dto.js';

function criarSessionController(service) {
    async function login(req, res) {
        const body = dto.loginDto(req.body);
        const data = (await service.login(body));
        
        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }
    
    async function logoff(req, res) {
        const body = dto.logoffDto(req.body);
        const data = (await service.logoff(body));
        
        res.json({ ...RESPONSE.SUCESSO, payload: data })
    }

    return { login, logoff }
}

export default criarSessionController;