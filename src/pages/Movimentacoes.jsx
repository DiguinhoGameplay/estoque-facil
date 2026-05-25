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

  const produtoSelecionado = produtos.find(
    (produto) => produto.id === novaMovimentacao.produtoId
  )

  const quantidadeInformada = Number(novaMovimentacao.quantidade || 0)

  const estoqueAposMovimentacao = produtoSelecionado
    ? novaMovimentacao.tipo === 'entrada'
      ? produtoSelecionado.estoqueAtual + quantidadeInformada
      : produtoSelecionado.estoqueAtual - quantidadeInformada
    : null

  const saidaMaiorQueEstoque =
    produtoSelecionado &&
    novaMovimentacao.tipo === 'saida' &&
    quantidadeInformada > produtoSelecionado.estoqueAtual

  const ficaraAbaixoDoMinimo =
    produtoSelecionado &&
    novaMovimentacao.tipo === 'saida' &&
    quantidadeInformada > 0 &&
    estoqueAposMovimentacao < produtoSelecionado.estoqueMinimo

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

    if (!produtoSelecionado) {
      alert('Produto não encontrado.')
      return
    }

    if (novaMovimentacao.tipo === 'saida' && quantidade > produtoSelecionado.estoqueAtual) {
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

    if (novaMovimentacao.tipo === 'saida' && ficaraAbaixoDoMinimo) {
      alert(
        `Atenção: o produto "${produtoSelecionado.nome}" ficou abaixo do estoque mínimo. Estoque atual: ${estoqueAposMovimentacao}. Mínimo recomendado: ${produtoSelecionado.estoqueMinimo}.`
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

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Nova movimentação
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Preencha os dados para atualizar o estoque.
              </p>
            </div>
          </div>

          <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Produto
              </label>
              <select
                value={novaMovimentacao.produtoId}
                onChange={(event) =>
                  atualizarCampo('produtoId', event.target.value)
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                Tipo
              </label>
              <select
                value={novaMovimentacao.tipo}
                onChange={(event) => atualizarCampo('tipo', event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Quantidade
              </label>
              <input
                type="number"
                min="1"
                value={novaMovimentacao.quantidade}
                onChange={(event) =>
                  atualizarCampo('quantidade', event.target.value)
                }
                placeholder="Ex: 10"
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                rows="3"
              />
            </div>

            {saidaMaiorQueEstoque && (
              <div className="md:col-span-2 rounded-xl bg-red-50 border border-red-100 p-4">
                <p className="text-sm font-medium text-red-700">
                  A quantidade informada é maior que o estoque disponível.
                </p>
              </div>
            )}

            {ficaraAbaixoDoMinimo && !saidaMaiorQueEstoque && (
              <div className="md:col-span-2 rounded-xl bg-yellow-50 border border-yellow-100 p-4">
                <p className="text-sm font-medium text-yellow-800">
                  Atenção: essa saída deixará o produto abaixo do estoque mínimo.
                </p>
              </div>
            )}

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={salvarMovimentacao}
                disabled={salvando || saidaMaiorQueEstoque}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {salvando ? 'Salvando...' : 'Salvar movimentação'}
              </button>
            </div>
          </form>
        </div>

        <aside className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-slate-900">
            Produto selecionado
          </h3>

          {produtoSelecionado ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-slate-500">Produto</p>
                <p className="font-semibold text-slate-900">
                  {produtoSelecionado.nome}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Estoque atual</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {produtoSelecionado.estoqueAtual}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Estoque mínimo</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {produtoSelecionado.estoqueMinimo}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                <p className="text-xs text-blue-700">
                  Estoque após movimentação
                </p>
                <p className="mt-1 text-2xl font-bold text-blue-900">
                  {quantidadeInformada > 0 ? estoqueAposMovimentacao : produtoSelecionado.estoqueAtual}
                </p>
              </div>

              {produtoSelecionado.observacao && (
                <div>
                  <p className="text-sm text-slate-500">Observação</p>
                  <p className="text-sm text-slate-700">
                    {produtoSelecionado.observacao}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 p-4">
              <p className="text-sm text-slate-500">
                Selecione um produto para visualizar estoque atual, mínimo e previsão após a movimentação.
              </p>
            </div>
          )}
        </aside>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">
            Histórico de movimentações
          </h3>
        </div>

        <div className="hidden md:block overflow-x-auto">
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

        <div className="md:hidden p-4 space-y-3">
          {carregandoMovimentacoes && (
            <p className="text-center text-sm text-slate-500">
              Carregando movimentações...
            </p>
          )}

          {!carregandoMovimentacoes &&
            movimentacoes.map((movimentacao) => (
              <div
                key={movimentacao.id}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {movimentacao.produtoNome}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {movimentacao.data}
                    </p>
                  </div>

                  <span
                    className={
                      movimentacao.tipo === 'entrada'
                        ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700'
                        : 'rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700'
                    }
                  >
                    {movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Quantidade</p>
                    <p className="text-lg font-bold text-slate-900">
                      {movimentacao.quantidade}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Observação</p>
                    <p className="text-sm text-slate-700">
                      {movimentacao.observacao || '-'}
                    </p>
                  </div>
                </div>
              </div>
            ))}

          {!carregandoMovimentacoes && movimentacoes.length === 0 && (
            <p className="text-center text-sm text-slate-500">
              Nenhuma movimentação registrada.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default Movimentacoes