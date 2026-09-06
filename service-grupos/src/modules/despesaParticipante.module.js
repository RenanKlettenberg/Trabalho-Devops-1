import database from "../infrastructure/database/database.js";
import criarRepository from "../repository/despesaParticipante.repository.js";
import criarService from "../service/despesaParticipante.service.js";
import criarController from "../controller/despesaParticipante.controller.js";
import { service as participanteService } from "./participante.module.js";
import { service as grupoService } from "./grupo.module.js";

export const repository = criarRepository(database);
export const service = criarService(repository, participanteService, grupoService);
export const controller = criarController(service);

export default controller;
