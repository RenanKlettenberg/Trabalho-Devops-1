/**
 * Repositório em memória usado nos testes unitários/HTTP, no lugar do
 * PostgresDespesaRepository real (que precisa de um Postgres de verdade).
 */
function criarFakeDespesaRepository() {
  const despesas = new Map();

  return {
    despesas,
    salvar: async (despesa) => {
      despesas.set(despesa.id, despesa);
      return despesa;
    },
    buscarPorId: async (id) => despesas.get(id) ?? null,
    buscarPorViagemId: async (viagemId) =>
      [...despesas.values()].filter((d) => d.viagemId === viagemId),
    buscarPorEventoId: async (eventoId) =>
      [...despesas.values()].filter((d) => d.eventoId === eventoId),
  };
}

export { criarFakeDespesaRepository };
export default criarFakeDespesaRepository;
