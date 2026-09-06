import criarService from "../service/divisao.service.js";
import criarController from "../controller/divisao.controller.js";
import { repository as participanteRepository } from "./participante.module.js";
import { repository as despesaParticipanteRepository } from "./despesaParticipante.module.js";
import { service as grupoService } from "./grupo.module.js";

export const service = criarService(participanteRepository, despesaParticipanteRepository, grupoService);
export const controller = criarController(service);

export default controller;
