// Limites de participantes por viagem, de acordo com o plano do usuário dono da viagem.
const LIMITE_PARTICIPANTES_POR_PLANO = Object.freeze({
    free: 5,
    premium: 15,
});

const PLANO_PADRAO = 'free';

export { LIMITE_PARTICIPANTES_POR_PLANO, PLANO_PADRAO };
