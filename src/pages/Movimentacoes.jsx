import { useState } from 'react'
import { supabase } from '../services/supabase'

function Movimentacoes({
  produtos,
  movimentacoes,
  empresaAtiva,
  usuarioLogado,
  carregandoMovimentacoes,
  carregarProdutos,
  carregarMovimentacoes,
}) {
  const [salvando, setSalvando] = useState(false)

  const [novaMovimentacao, setNovaMovimentacao] = useState({
    produtoId: '',
    tipo: 'entrada',
    data: new Date().toISOString().split('T')[0],
    quantidade: '',
    observacao: '',
  })

  const produtosAtivos = produtos.filter((produto) => produto.ativo)

  function atualizarCampo(campo, valor) {
    setNovaMovimentacao({
      ...novaMovimentacao,
      [campo]: valor,
    })
  }

  async function salvarMovimentacao() {
    if (!empresaAtiva?.id) {
      alert('Selecione uma empresa antes de registrar movimentações.')
      return
    }

    if (!novaMovimentacao.produtoId) {
      alert('Selecione um produto.')
      return
    }

    if (!novaMovimentacao.data) {
      alert('Informe a data da movimentação.')
      return
    }

    const quantidade = Number(novaMovimentacao.quantidade)

    if (!quantidade || quantidade <= 0) {
      alert('Informe uma quantidade maior que zero.')
      return
    }

    const produtoSelecionado = produtos.find(
      (produto) => produto.id === novaMovimentacao.produtoId
    )

    if (!produtoSelecionado) {
      alert('Produto não encontrado.')
      return
    }

    if (
      novaMovimentacao.tipo === 'saida' &&
      quantidade > produtoSelecionado.estoqueAtual
    ) {
      alert('Não há estoque suficiente para registrar esta saída.')
      return
    }

    setSalvando(true)

    const movimentacaoParaSalvar = {
      empresa_id: empresaAtiva.id,
      produto_id: novaMovimentacao.produtoId,
      usuario_id: usuarioLogado?.id || null,
      tipo: novaMovimentacao.tipo,
      quantidade,
      data_movimentacao: novaMovimentacao.data,
      observacao: novaMovimentacao.observacao.trim() || null,
    }

    const { error } = await supabase
      .from('movimentacoes')
      .insert(movimentacaoParaSalvar)

    if (error) {
      console.error('Erro ao salvar movimentação:', error)
      alert(error.message || 'Erro ao salvar movimentação.')
      setSalvando(false)
      return
    }

    await carregarProdutos()
    await carregarMovimentacoes()

    const novoEstoque =
      novaMovimentacao.tipo === 'entrada'
        ? produtoSelecionado.estoqueAtual + quantidade
        : produtoSelecionado.estoqueAtual - quantidade

    if (
      novaMovimentacao.tipo === 'saida' &&
      novoEstoque < produtoSelecionado.estoqueMinimo
    ) {
      alert(
        `Atenção: o produto "${produtoSelecionado.nome}" ficou abaixo do estoque mínimo. Estoque atual: ${novoEstoque}. Mínimo recomendado: ${produtoSelecionado.estoqueMinimo}.`
      )
    } else {
      alert('Movimentação registrada com sucesso.')
    }

    setNovaMovimentacao({
      produtoId: '',
      tipo: 'entrada',
      data: new Date().toISOString().split('T')[0],
      quantidade: '',
      observacao: '',
    })

    setSalvando(false)
  }

  return (
    <section>
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Movimentações</h2>
        <p className="mt-2 text-slate-600">
          Registre entradas e saídas de produtos no estoque.
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Empresa atual: {empresaAtiva?.nome}
        </p>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Produto
            </label>
            <select
              value={novaMovimentacao.produtoId}
              onChange={(event) =>
                atualizarCampo('produtoId', event.target.value)
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Selecione um produto</option>

              {produtosAtivos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome} — Estoque: {produto.estoqueAtual}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Tipo de movimentação
            </label>
            <select
              value={novaMovimentacao.tipo}
              onChange={(event) => atualizarCampo('tipo', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Data
            </label>
            <input
              type="date"
              value={novaMovimentacao.data}
              onChange={(event) => atualizarCampo('data', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Quantidade
            </label>
            <input
              type="number"
              value={novaMovimentacao.quantidade}
              onChange={(event) =>
                atualizarCampo('quantidade', event.target.value)
              }
              placeholder="Ex: 10"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Observação
            </label>
            <textarea
              value={novaMovimentacao.observacao}
              onChange={(event) =>
                atualizarCampo('observacao', event.target.value)
              }
              placeholder="Ex: venda do dia, compra de fornecedor..."
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              rows="4"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              onClick={salvarMovimentacao}
              disabled={salvando}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {salvando ? 'Salvando...' : 'Salvar movimentação'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">
            Histórico de movimentações
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-4">Produto</th>
                <th className="px-5 py-4">Tipo</th>
                <th className="px-5 py-4">Quantidade</th>
                <th className="px-5 py-4">Data</th>
                <th className="px-5 py-4">Observação</th>
              </tr>
            </thead>

            <tbody>
              {carregandoMovimentacoes && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    Carregando movimentações...
                  </td>
                </tr>
              )}

              {!carregandoMovimentacoes &&
                movimentacoes.map((movimentacao) => (
                  <tr
                    key={movimentacao.id}
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {movimentacao.produtoNome}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          movimentacao.tipo === 'entrada'
                            ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700'
                            : 'rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700'
                        }
                      >
                        {movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {movimentacao.quantidade}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {movimentacao.data}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {movimentacao.observacao || '-'}
                    </td>
                  </tr>
                ))}

              {!carregandoMovimentacoes && movimentacoes.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    Nenhuma movimentação registrada.
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

export default Movimentacoes