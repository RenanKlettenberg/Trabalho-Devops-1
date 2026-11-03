
import Router from 'express';
import controller from '../modules/usuario.module.js';

const router = Router();

/**
 * @swagger
 * /api/v1/usuario:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.get('/', controller.listar);

/**
 * @swagger
 * /api/v1/usuario/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Usuário encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespostaSucesso'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/Usuario'
 *       404:
 *         $ref: '#/components/responses/Erro404'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/v1/usuario:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioCriacao'
 *     responses:
 *       200:
 *         description: Usuário criado com sucesso. Retorna os dados do usuário e seu token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespostaSucesso'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/UsuarioCriado'
 *       400:
 *         $ref: '#/components/responses/Erro400'
 *       409:
 *         $ref: '#/components/responses/Erro409'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.post('/', controller.criarUsuario);

/**
 * @swagger
 * /api/v1/usuario/{id}:
 *   put:
 *     summary: Edita um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário na URL.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioEdicao'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       400:
 *         $ref: '#/components/responses/Erro400'
 *       404:
 *         $ref: '#/components/responses/Erro404'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.put('/:id', controller.editarUsuario);

/**
 * @swagger
 * /api/v1/usuario/{id}:
 *   delete:
 *     summary: Deleta um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário na URL.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioExclusao'
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSucesso'
 *       400:
 *         $ref: '#/components/responses/Erro400'
 *       404:
 *         $ref: '#/components/responses/Erro404'
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.delete('/:id', controller.deletarUsuario);

export default router;
