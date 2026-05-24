import { useState } from 'react'

function Produtos({ produtos, setProdutos }) {
  const [busca, setBusca] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    codigo: '',
    categoria: '',
    estoqueAtual: '',
    estoqueMinimo: '',
    observacao: '',
  })

  const produtosFiltrados = produtos.filter((produto) => {
    const textoBusca = busca.toLowerCase()

    return (
      produto.nome.toLowerCase().includes(textoBusca) ||
      produto.codigo.toLowerCase().includes(textoBusca) ||
      produto.categoria.toLowerCase().includes(textoBusca)
    )
  })

  function atualizarCampo(campo, valor) {
    setNovoProduto({
      ...novoProduto,
      [campo]: valor,
    })
  }

  function cadastrarProduto() {
    if (!novoProduto.nome.trim()) {
      alert('Informe o nome do produto.')
      return
    }

    if (Number(novoProduto.estoqueAtual) < 0) {
      alert('O estoque inicial não pode ser negativo.')
      return
    }

    if (Number(novoProduto.estoqueMinimo) < 0) {
      alert('O estoque mínimo não pode ser negativo.')
      return
    }

    const produto = {
      id: Date.now(),
      nome: novoProduto.nome,
      codigo: novoProduto.codigo || 'Sem código',
      categoria: novoProduto.categoria || 'Sem categoria',
      estoqueAtual: Number(novoProduto.estoqueAtual || 0),
      estoqueMinimo: Number(novoProduto.estoqueMinimo || 0),
      observacao: novoProduto.observacao,
      ativo: true,
    }

    setProdutos([...produtos, produto])

    setNovoProduto({
      nome: '',
      codigo: '',
      categoria: '',
      estoqueAtual: '',
      estoqueMinimo: '',
      observacao: '',
    })

    setMostrarFormulario(false)
  }

  function inativarProduto(id) {
    const confirmar = confirm('Deseja inativar este produto?')

    if (!confirmar) return

    const produtosAtualizados = produtos.map((produto) => {
      if (produto.id === id) {
        return {
          ...produto,
          ativo: false,
        }
      }

      return produto
    })

    setProdutos(produtosAtualizados)
  }

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Produtos</h2>
          <p className="mt-2 text-slate-600">
            Cadastre, edite e acompanhe o estoque dos produtos.
          </p>
        </div>

        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          {mostrarFormulario ? 'Fechar cadastro' : 'Cadastrar produto'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-slate-900">
            Novo produto
          </h3>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Nome do produto *
              </label>
              <input
                type="text"
                value={novoProduto.nome}
                onChange={(event) => atualizarCampo('nome', event.target.value)}
                placeholder="Ex: Guia da Corrente KTM Azul"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Código/SKU
              </label>
              <input
                type="text"
                value={novoProduto.codigo}
                onChange={(event) => atualizarCampo('codigo', event.target.value)}
                placeholder="Ex: GC-KTM-AZUL"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Categoria
              </label>
              <input
                type="text"
                value={novoProduto.categoria}
                onChange={(event) => atualizarCampo('categoria', event.target.value)}
                placeholder="Ex: Guia de corrente"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Estoque inicial
              </label>
              <input
                type="number"
                value={novoProduto.estoqueAtual}
                onChange={(event) => atualizarCampo('estoqueAtual', event.target.value)}
                placeholder="Ex: 100"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Estoque mínimo
              </label>
              <input
                type="number"
                value={novoProduto.estoqueMinimo}
                onChange={(event) => atualizarCampo('estoqueMinimo', event.target.value)}
                placeholder="Ex: 20"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Observação
              </label>
              <input
                type="text"
                value={novoProduto.observacao}
                onChange={(event) => atualizarCampo('observacao', event.target.value)}
                placeholder="Ex: compatível com KTM, Sherco e MXF"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={cadastrarProduto}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Salvar produto
            </button>

            <button
              onClick={() => setMostrarFormulario(false)}
              className="rounded-xl bg-slate-100 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 bg-white rounded-2xl shadow-sm p-5">
        <input
          type="text"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar produto por nome, código ou categoria..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-4">Produto</th>
                <th className="px-5 py-4">Código</th>
                <th className="px-5 py-4">Categoria</th>
                <th className="px-5 py-4">Estoque</th>
                <th className="px-5 py-4">Mínimo</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Ações</th>
              </tr>
            </thead>

            <tbody>
              {produtosFiltrados.map((produto) => {
                const baixoEstoque = produto.estoqueAtual < produto.estoqueMinimo

                return (
                  <tr key={produto.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {produto.nome}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{produto.codigo}</td>
                    <td className="px-5 py-4 text-slate-600">{produto.categoria}</td>
                    <td className="px-5 py-4 text-slate-600">{produto.estoqueAtual}</td>
                    <td className="px-5 py-4 text-slate-600">{produto.estoqueMinimo}</td>
                    <td className="px-5 py-4">
                      {!produto.ativo ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          Inativo
                        </span>
                      ) : baixoEstoque ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          Baixo estoque
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {produto.ativo && (
                        <button
                          onClick={() => inativarProduto(produto.id)}
                          className="text-sm font-semibold text-red-600 hover:text-red-800"
                        >
                          Inativar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}

              {produtosFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default Produtos