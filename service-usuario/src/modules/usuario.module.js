import database from "../infrastructure/database/database.js";
import criarRepository from "../repository/usuario.repository.js";
import criarService from "../service/usuario.service.js";
import criarController from "../controller/usuario.controller.js";

export const repository = criarRepository(database);
export const service = criarService(repository);
const controller = criarController(service);

export default controller;