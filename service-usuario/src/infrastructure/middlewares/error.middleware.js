import RESPONSE from "../../shared/constants/response.js";
import AppError from "../errors/app.error.js";

function errorMiddleware(error, req, res, next) {
    if (error instanceof AppError) {
        console.log(error.code + " - " + error.message)
        return res.status(error.status).json({
            code: error.code,
            message: error.message,
            payload: error.payload ?? ""
        });
    }
    if (error.name == "ZodError") {
        const RESPOSTA_ERRO = RESPONSE.DADO_INVALIDO;
        const payload = JSON.parse(error.message);
        return res.status(RESPOSTA_ERRO.status).json({
            code: RESPOSTA_ERRO.code,
            message: RESPOSTA_ERRO.message,
            payload: payload
        });
    }

    console.error(error);
    return res.status(500).json({ ...RESPONSE.ERRO_DESCONHECIDO, payload: { name: error.name, msg: error.message } });
}

export default errorMiddleware;