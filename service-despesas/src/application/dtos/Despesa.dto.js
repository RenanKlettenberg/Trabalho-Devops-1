function paraResposta(despesa) {
  return {
    id: despesa.id,
    descricao: despesa.descricao,
    valor: despesa.valor,
    moeda: despesa.moeda.codigo,
    categoria: despesa.categoria.valor,
    viagemId: despesa.viagemId,
    eventoId: despesa.eventoId,
    status: despesa.status,
    createdAt: despesa.createdAt,
    updatedAt: despesa.updatedAt,
  };
}

function paraRespostaComConversao(despesa, { valorConvertido, moedaDestino, taxa }) {
  return {
    ...paraResposta(despesa),
    conversao: {
      valorConvertido: Number(valorConvertido.toFixed(2)),
      moedaDestino,
      taxa,
    },
  };
}

export { paraResposta, paraRespostaComConversao };
