import database from "../infrastructure/database/database.js";
import criarRepository from "../repository/viagem.repository.js";
import criarService from "../service/viagem.service.js";
import criarController from "../controller/viagem.controller.js";

export const repository = criarRepository(database);
export const service = criarService(repository);
export const controller = criarController(service);

export default controller;