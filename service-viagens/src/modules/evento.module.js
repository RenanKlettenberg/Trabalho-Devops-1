import database from "../infrastructure/database/database.js";
import criarRepository from "../repository/evento.repository.js";
import criarService from "../service/evento.service.js";
import criarController from "../controller/evento.controller.js";

export const repository = criarRepository(database);
export const service = criarService(repository);
export const controller = criarController(service);

export default controller;