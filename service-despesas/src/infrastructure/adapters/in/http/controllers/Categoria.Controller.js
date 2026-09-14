
class CategoriaController {
  constructor(listarCategoriasQuery) {
    this.listarCategoriasQuery = listarCategoriasQuery;
  }

  async listar(req, res, next) {
    try {
      const categorias = await this.listarCategoriasQuery.execute();
      return res.status(200).json(categorias);
    } catch (error) {
      next(error);
    }
  }
}
export { CategoriaController };
export default CategoriaController;