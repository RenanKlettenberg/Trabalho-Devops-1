
import Router from 'express';
import controller from '../modules/viagem.module.js';

const router = Router();

/**
 * @swagger
 * /api/v1/viagem:
 *   get:
 *     summary: Lista viagens
 *     description: Retorna as viagens cadastradas. É possível filtrar pelo usuário.
 *     tags: [Viagens]
 *     parameters:
 *       - in: query
 *         name: usu_id
 *         required: false
 *         description: Filtra as viagens de um usuário específico.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Viagens retornadas com sucesso.
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
 *                         $ref: '#/components/schemas/Viagem'
 *       400:
 *         $ref: '#/components/responses/Erro400'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.get('/', controller.listar);

/**
 * @swagger
 * /api/v1/viagem/{id}:
 *   get:
 *     summary: Busca uma viagem pelo ID
 *     tags: [Viagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da viagem.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Viagem encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespostaSucesso'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Viagem'
 *       404:
 *         $ref: '#/components/responses/Erro404Viagem'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/v1/viagem:
 *   post:
 *     summary: Cria uma viagem
 *     description: Cria uma viagem com status inicial ativo. O limite de viagens ativas depende do plano do usuário.
 *     tags: [Viagens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ViagemCriacao'
 *     responses:
 *       200:
 *         description: Viagem criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespostaSucesso'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Viagem'
 *       400:
 *         $ref: '#/components/responses/Erro400'
 *       409:
 *         $ref: '#/components/responses/Erro409'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.post('/', controller.criarViagem);

/**
 * @swagger
 * /api/v1/viagem/{id}:
 *   put:
 *     summary: Edita uma viagem
 *     tags: [Viagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da viagem na URL.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ViagemEdicao'
 *     responses:
 *       200:
 *         description: Viagem atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespostaSucesso'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Viagem'
 *       400:
 *         $ref: '#/components/responses/Erro400'
 *       404:
 *         $ref: '#/components/responses/Erro404Viagem'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.put('/:id', controller.editarViagem);

/**
 * @swagger
 * /api/v1/viagem/{id}:
 *   delete:
 *     summary: Deleta uma viagem
 *     tags: [Viagens]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da viagem na URL.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ViagemExclusao'
 *     responses:
 *       200:
 *         description: Viagem deletada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespostaSucesso'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Viagem'
 *       400:
 *         $ref: '#/components/responses/Erro400'
 *       404:
 *         $ref: '#/components/responses/Erro404Viagem'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.delete('/:id', controller.deletarViagem);

export default router;
