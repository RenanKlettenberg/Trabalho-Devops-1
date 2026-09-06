import database from "../infrastructure/database/database.js";
import criarRepository from "../repository/grupo.repository.js";
import criarService from "../service/grupo.service.js";
import criarController from "../controller/grupo.controller.js";

export const repository = criarRepository(database);
export const service = criarService(repository);
export const controller = criarController(service);

export default controller;
