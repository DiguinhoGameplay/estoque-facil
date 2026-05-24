import { useState } from 'react'

function Relatorios({ produtos, movimentacoes }) {
  const dataAtual = new Date()

  const [mesSelecionado, setMesSelecionado] = useState(
    String(dataAtual.getMonth() + 1).padStart(2, '0')
  )

  const [anoSelecionado, setAnoSelecionado] = useState(
    String(dataAtual.getFullYear())
  )

  const [buscaProduto, setBuscaProduto] = useState('')

  const nomesMeses = [
    { valor: '01', nome: 'Janeiro' },
    { valor: '02', nome: 'Fevereiro' },
    { valor: '03', nome: 'Março' },
    { valor: '04', nome: 'Abril' },
    { valor: '05', nome: 'Maio' },
    { valor: '06', nome: 'Junho' },
    { valor: '07', nome: 'Julho' },
    { valor: '08', nome: 'Agosto' },
    { valor: '09', nome: 'Setembro' },
    { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' },
    { valor: '12', nome: 'Dezembro' },
  ]

  const movimentacoesDoMes = movimentacoes.filter((movimentacao) => {
    const [ano, mes] = movimentacao.data.split('-')

    return ano === anoSelecionado && mes === mesSelecionado
  })

  const relatorioPorProduto = produtos
    .filter((produto) =>
      produto.nome.toLowerCase().includes(buscaProduto.toLowerCase())
    )
    .map((produto) => {
      const movimentacoesProduto = movimentacoesDoMes.filter(
        (movimentacao) => movimentacao.produtoId === produto.id
      )

      const entradas = movimentacoesProduto
        .filter((movimentacao) => movimentacao.tipo === 'entrada')
        .reduce((total, movimentacao) => total + movimentacao.quantidade, 0)

      const saidas = movimentacoesProduto
        .filter((movimentacao) => movimentacao.tipo === 'saida')
        .reduce((total, movimentacao) => total + movimentacao.quantidade, 0)

      return {
        produto: produto.nome,
        categoria: produto.categoria,
        entradas,
        saidas,
        estoqueAtual: produto.estoqueAtual,
        estoqueMinimo: produto.estoqueMinimo,
      }
    })

  const totalEntradas = relatorioPorProduto.reduce(
    (total, item) => total + item.entradas,
    0
  )

  const totalSaidas = relatorioPorProduto.reduce(
    (total, item) => total + item.saidas,
    0
  )

  const produtosComEstoqueBaixo = relatorioPorProduto.filter(
    (item) => item.estoqueAtual < item.estoqueMinimo
  )

  const produtoMaisVendido = [...relatorioPorProduto].sort(
    (a, b) => b.saidas - a.saidas
  )[0]

  return (
    <section>
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Relatórios</h2>
        <p className="mt-2 text-slate-600">
          Visualize entradas, saídas e estoque atual por período.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm text-slate-500">Entradas no período</p>
          <strong className="mt-2 block text-3xl text-slate-900">
            {totalEntradas}
          </strong>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm text-slate-500">Saídas no período</p>
          <strong className="mt-2 block text-3xl text-slate-900">
            {totalSaidas}
          </strong>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm text-slate-500">Estoque baixo</p>
          <strong className="mt-2 block text-3xl text-red-600">
            {produtosComEstoqueBaixo.length}
          </strong>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-sm text-slate-500">Produto mais vendido</p>
          <strong className="mt-2 block text-lg text-slate-900">
            {produtoMaisVendido && produtoMaisVendido.saidas > 0
              ? produtoMaisVendido.produto
              : 'Sem vendas'}
          </strong>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          value={mesSelecionado}
          onChange={(event) => setMesSelecionado(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {nomesMeses.map((mes) => (
            <option key={mes.valor} value={mes.valor}>
              {mes.nome}
            </option>
          ))}
        </select>

        <select
          value={anoSelecionado}
          onChange={(event) => setAnoSelecionado(event.target.value)}
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>

        <input
          type="text"
          value={buscaProduto}
          onChange={(event) => setBuscaProduto(event.target.value)}
          placeholder="Filtrar por produto"
          className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <button
          type="button"
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Relatório atualizado
        </button>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="text-left">
                <th className="px-5 py-4">Produto</th>
                <th className="px-5 py-4">Categoria</th>
                <th className="px-5 py-4">Entradas</th>
                <th className="px-5 py-4">Saídas</th>
                <th className="px-5 py-4">Estoque atual</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {relatorioPorProduto.map((item) => {
                const baixoEstoque = item.estoqueAtual < item.estoqueMinimo

                return (
                  <tr key={item.produto} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {item.produto}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.categoria}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.entradas}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.saidas}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.estoqueAtual}
                    </td>

                    <td className="px-5 py-4">
                      {baixoEstoque ? (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          Baixo estoque
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}

              {relatorioPorProduto.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-8 text-center text-slate-500"
                  >
                    Nenhum produto encontrado no relatório.
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

export default Relatorios