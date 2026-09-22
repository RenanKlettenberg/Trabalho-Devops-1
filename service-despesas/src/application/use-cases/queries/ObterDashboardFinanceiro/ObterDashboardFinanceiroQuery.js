import Moeda from '../../../../domain/entities/Moeda.js';
import { ViagemObrigatoriaException } from '../../../../domain/exceptions/DomainExceptions.js';

const MOEDA_PADRAO = 'BRL';

/**
 * Requisito 2: converte todas as despesas ATIVAS de uma viagem para a
 * moeda principal/local da viagem e consolida os totais para o dashboard.
 *
 * O serviço de viagens ainda não expõe uma "moeda principal" por viagem,
 * então o chamador informa `moedaPrincipal` (ex: veio de service-viagens
 * futuramente, ou preferência do usuário); na ausência, usa MOEDA_PADRAO.
 */
class ObterDashboardFinanceiroQuery {
  constructor(despesaRepository, exchangeRateProvider) {
    this.despesaRepository = despesaRepository;
    this.exchangeRateProvider = exchangeRateProvider;
  }

  async executar({ viagemId, moedaPrincipal = MOEDA_PADRAO }) {
    if (!viagemId) {
      throw new ViagemObrigatoriaException();
    }

    const moedaDestino = new Moeda(moedaPrincipal);
    const todasDespesas = await this.despesaRepository.buscarPorViagemId(viagemId);
    const despesasAtivas = todasDespesas.filter((despesa) => despesa.estaAtiva());

    const despesasConvertidas = await Promise.all(
      despesasAtivas.map(async (despesa) => {
        const taxa = await this.exchangeRateProvider.obterTaxa(despesa.moeda.codigo, moedaDestino.codigo);
        const valorConvertido = Number((despesa.valor * taxa).toFixed(2));
        return { despesa, taxa, valorConvertido };
      })
    );

    const totalGeral = despesasConvertidas.reduce((soma, item) => soma + item.valorConvertido, 0);

    const totalPorCategoria = despesasConvertidas.reduce((acumulado, item) => {
      const categoria = item.despesa.categoria.valor;
      acumulado[categoria] = Number(((acumulado[categoria] ?? 0) + item.valorConvertido).toFixed(2));
      return acumulado;
    }, {});

    return {
      viagemId,
      moedaPrincipal: moedaDestino.codigo,
      totalGeral: Number(totalGeral.toFixed(2)),
      totalPorCategoria,
      quantidadeDespesas: despesasAtivas.length,
      quantidadeEstornadas: todasDespesas.length - despesasAtivas.length,
      despesas: despesasConvertidas.map(({ despesa, taxa, valorConvertido }) => ({
        id: despesa.id,
        descricao: despesa.descricao,
        categoria: despesa.categoria.valor,
        valorOriginal: despesa.valor,
        moedaOriginal: despesa.moeda.codigo,
        taxa,
        valorConvertido,
      })),
    };
  }
}

export { ObterDashboardFinanceiroQuery, MOEDA_PADRAO };
export default ObterDashboardFinanceiroQuery;
