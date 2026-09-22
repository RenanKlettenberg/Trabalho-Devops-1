import Categoria from '../../../../../domain/entities/Categoria.js';

class CategoriaController {
  listar = (req, res) => {
    return res.status(200).json(Categoria.listar());
  };
}

export { CategoriaController };
export default CategoriaController;
