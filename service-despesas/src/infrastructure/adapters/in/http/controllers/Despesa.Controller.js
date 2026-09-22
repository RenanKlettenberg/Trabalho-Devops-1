import * as despesaDto from '../../../../../application/dtos/Despesa.dto.js';

class DespesaController {
  constructor({ registrarDespesaCommand, obterDespesaQuery, estornarDespesaCommand, despesaRepository }) {
    this.registrarDespesaCommand = registrarDespesaCommand;
    this.obterDespesaQuery = obterDespesaQuery;
    this.estornarDespesaCommand = estornarDespesaCommand;
    this.despesaRepository = despesaRepository;
  }

  registrar = async (req, res, next) => {
    try {
      const { descricao, valor, moeda, categoria, viagemId, eventoId } = req.body;

      const despesa = await this.registrarDespesaCommand.executar({
        descricao,
        valor,
        moeda,
        categoria,
        viagemId,
        eventoId,
      });

      return res.status(201).json(despesaDto.paraResposta(despesa));
    } catch (error) {
      return next(error);
    }
  };

  obterPorId = async (req, res, next) => {
    try {
      const despesa = await this.obterDespesaQuery.executar(req.params.id);
      return res.status(200).json(despesaDto.paraResposta(despesa));
    } catch (error) {
      return next(error);
    }
  };

  listarPorViagem = async (req, res, next) => {
    try {
      const despesas = await this.despesaRepository.buscarPorViagemId(req.params.viagemId);
      return res.status(200).json(despesas.map(despesaDto.paraResposta));
    } catch (error) {
      return next(error);
    }
  };

  estornar = async (req, res, next) => {
    try {
      const despesa = await this.estornarDespesaCommand.executar(req.params.id);
      return res.status(200).json(despesaDto.paraResposta(despesa));
    } catch (error) {
      return next(error);
    }
  };
}

export { DespesaController };
export default DespesaController;
