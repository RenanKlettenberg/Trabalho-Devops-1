import database from "../infrastructure/database/database.js";
import criarRepository from "../repository/participante.repository.js";
import criarService from "../service/participante.service.js";
import criarController from "../controller/participante.controller.js";
import { service as grupoService } from "./grupo.module.js";

export const repository = criarRepository(database);
export const service = criarService(repository, grupoService);
export const controller = criarController(service);

export default controller;
