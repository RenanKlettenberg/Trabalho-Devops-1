import AppError from '../../infrastructure/exceptions/AppError.js';

/**
 * DTO para a criação de uma nova despesa.
 * Ele recebe o payload da requisição e garante que os campos essenciais existam.
 */
class RegistrarDespesaDTO {
  constructor(payload) {
    this.titulo = payload.titulo;
    this.valor = parseFloat(payload.valor);
    this.data = payload.data;
    this.categoriaId = payload.categoriaId;
    this.participanteId = payload.participanteId;
    this.grupoId = payload.grupoId || null;
    this.moeda = payload.moeda || 'BRL';

    this.validar();
  }

  validar() {
    const erros = [];

    if (!this.titulo || typeof this.titulo !== 'string') {
      erros.push("O campo 'titulo' é obrigatório e deve ser um texto.");
    }
    
    if (isNaN(this.valor) || this.valor <= 0) {
      erros.push("O campo 'valor' é obrigatório e deve ser um número positivo.");
    }

    if (!this.data || isNaN(new Date(this.data).getTime())) {
      erros.push("O campo 'data' é obrigatório e deve ser uma data válida.");
    }

    if (!this.categoriaId) {
      erros.push("O campo 'categoriaId' é obrigatório.");
    }

    if (!this.participanteId) {
      erros.push("O campo 'participanteId' é obrigatório.");
    }

    // Se houver erros de estrutura, estoura um erro 400 (Bad Request)
    // Isso impede que o RegistrarDespesaCommand seja chamado com lixo
    if (erros.length > 0) {
      throw new AppError(`Validação de entrada falhou: ${erros.join(' ')}`, 400);
    }
  }
}

/**
 * DTO para a consulta do Dashboard Financeiro.
 * Garante que os filtros de data e usuário sejam enviados corretamente na URL (Query Params).
 */
class ObterDashboardDTO {
  constructor(queryData) {
    this.participanteId = queryData.participanteId;
    this.dataInicio = queryData.dataInicio;
    this.dataFim = queryData.dataFim;

    this.validar();
  }

  validar() {
    const erros = [];

    if (!this.participanteId) {
      erros.push("O parâmetro 'participanteId' é obrigatório na busca.");
    }

    if (!this.dataInicio || isNaN(new Date(this.dataInicio).getTime())) {
      erros.push("O parâmetro 'dataInicio' é obrigatório e deve ser uma data válida (ex: YYYY-MM-DD).");
    }

    if (!this.dataFim || isNaN(new Date(this.dataFim).getTime())) {
      erros.push("O parâmetro 'dataFim' é obrigatório e deve ser uma data válida (ex: YYYY-MM-DD).");
    }

    if (new Date(this.dataInicio) > new Date(this.dataFim)) {
      erros.push("A 'dataInicio' não pode ser maior que a 'dataFim'.");
    }

    if (erros.length > 0) {
      throw new AppError(`Validação de busca falhou: ${erros.join(' ')}`, 400);
    }
  }
}

export {
  RegistrarDespesaDTO,
  ObterDashboardDTO
};

export default { RegistrarDespesaDTO, ObterDashboardDTO };