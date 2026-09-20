import database from "../infrastructure/database/database.js";
import criarClientDespesa from "../infrastructure/messaging/despesa.client.js";
import criarRepository from "../repository/evento.repository.js";
import criarService from "../service/evento.service.js";
import criarController from "../controller/evento.controller.js";

export const repository = criarRepository(database);
export const service = criarService(repository, criarClientDespesa());
export const controller = criarController(service);

export default controller;