
import Router from 'express';
import controller from '../modules/session.module.js';

const router = Router();

/**
 * @swagger
 * /api/v1/session:
 *   post:
 *     summary: Realiza login do usuário
 *     description: Valida as credenciais e retorna os dados do usuário junto com um token JWT.
 *     tags: [Sessão]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/RespostaSucesso'
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: '#/components/schemas/UsuarioAutenticado'
 *
 *       400:
 *         $ref: '#/components/responses/Erro400'
 *
 *       401:
 *         $ref: '#/components/responses/Erro401'
 *
 *       500:
 *         $ref: '#/components/responses/Erro500'
 */
router.post('/', controller.login);

export default router;
