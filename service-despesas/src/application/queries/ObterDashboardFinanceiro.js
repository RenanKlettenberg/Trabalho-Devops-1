class ObterDashboardFinanceiro {
  /**
   * O repositório é injetado no construtor para que o caso de uso não 
   * fique acoplado a uma implementação específica (como Postgres ou MySQL).
   */
  constructor(despesaRepository) {
    this.despesaRepository = despesaRepository;
  }

  /**
   * Executa a consulta.
   * 
   * @param {Object} input
   * @param {string} input.participanteId - ID do usuário.
   * @param {string} input.dataInicio - Data inicial do filtro (YYYY-MM-DD).
   * @param {string} input.dataFim - Data final do filtro (YYYY-MM-DD).
   */
  async execute({ participanteId, dataInicio, dataFim }) {
    // 1. Validação simples de entrada (DTO pode ser usado antes disso no Controller)
    if (!participanteId) {
      // Aqui usamos um erro padrão ou você pode usar o AppError
      throw new Error("O ID do participante é obrigatório para gerar o dashboard.");
    }
    if (!dataInicio || !dataFim) {
        throw new Error("As datas de início e fim são obrigatórias.");
    }

    // 2. Chamada ao repositório para obter os dados agregados
    // Note que chamamos um método específico otimizado para leitura
    const resumo = await this.despesaRepository.obterResumoDashboard({
      participanteId,
      dataInicio,
      dataFim
    });

    // 3. Formatação e montagem do DTO de saída (o que o frontend vai receber)
    // Garantimos que nunca retornaremos 'undefined' ou nulo para os valores monetários.
    return {
      periodo: { 
        inicio: dataInicio, 
        fim: dataFim 
      },
      resumo: {
        totalGasto: resumo.totalGasto || 0,
        totalPendente: resumo.totalPendente || 0,
        totalPago: resumo.totalPago || 0
      },
      // Aqui você poderia mapear categorias ou histórico recente, caso 
      // o repositório comece a retornar esses dados no futuro.
      gastosPorCategoria: resumo.gastosPorCategoria || []
    };
  }
}

module.exports = ObterDashboardFinanceiro;