import { service as usuarioService } from "./usuario.module.js";
import criarService from "../service/session.service.js";
import criarController from "../controller/session.controller.js";

export const service = criarService(usuarioService);
export const controller = criarController(service);

export default controller;