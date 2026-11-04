
import Router from 'express';
import controller from '../modules/evento.module.js';

const router = Router();

/**
 * @swagger
 * /api/v1/evento:
 *   get:
 *     summary: Lista eventos
 *     description: Retorna os eventos cadastrados. É possível filtrar os eventos por viagem.
 *     tags: [Eventos]
 *     parameters:
 *       - in: query
 *         name: via_id
 *         required: false
 *         description: Filtra os eventos de uma viagem específica.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Eventos retornados com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespostaSucesso'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Evento'
 *       400:
 *         $ref: '#/components/responses/Erro400'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.get('/', controller.listar);

/**
 * @swagger
 * /api/v1/evento/{id}:
 *   get:
 *     summary: Busca um evento pelo ID
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do evento.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Evento encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespostaSucesso'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Evento'
 *       404:
 *         $ref: '#/components/responses/Erro404Evento'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/v1/evento:
 *   post:
 *     summary: Cria um evento
 *     description: Cria um evento associado a uma viagem. O status e a ordem são definidos automaticamente. Se houver orçamento, tenta sincronizar uma despesa.
 *     tags: [Eventos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventoCriacao'
 *     responses:
 *       200:
 *         description: Evento criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespostaSucesso'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Evento'
 *       400:
 *         $ref: '#/components/responses/Erro400'
 *       404:
 *         $ref: '#/components/responses/Erro404Viagem'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.post('/', controller.criarEvento);

/**
 * @swagger
 * /api/v1/evento/{id}:
 *   put:
 *     summary: Edita um evento
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do evento na URL.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventoEdicao'
 *     responses:
 *       200:
 *         description: Evento atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespostaSucesso'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Evento'
 *       400:
 *         $ref: '#/components/responses/Erro400'
 *       404:
 *         $ref: '#/components/responses/Erro404Evento'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.put('/:id', controller.editarEvento);

/**
 * @swagger
 * /api/v1/evento/{id}:
 *   delete:
 *     summary: Deleta um evento
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do evento na URL.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventoExclusao'
 *     responses:
 *       200:
 *         description: Evento deletado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespostaSucesso'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Evento'
 *       400:
 *         $ref: '#/components/responses/Erro400'
 *       404:
 *         $ref: '#/components/responses/Erro404Evento'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.delete('/:id', controller.deletarEvento);

export default router;