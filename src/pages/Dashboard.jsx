import { useState } from 'react'
import Produtos from './Produtos'
import Movimentacoes from './Movimentacoes'
import Relatorios from './Relatorios'

function Dashboard() {
  const [telaAtual, setTelaAtual] = useState('dashboard')

  const [produtos, setProdutos] = useState([
    {
      id: 1,
      nome: 'Guia da Corrente KTM Azul',
      codigo: 'GC-KTM-AZUL',
      categoria: 'Guia de corrente',
      estoqueAtual: 15,
      estoqueMinimo: 20,
      observacao: '',
      ativo: true,
    },
    {
      id: 2,
      nome: 'Guia da Corrente KTM Laranja',
      codigo: 'GC-KTM-LARANJA',
      categoria: 'Guia de corrente',
      estoqueAtual: 5000,
      estoqueMinimo: 100,
      observacao: '',
      ativo: true,
    },
  ])

  const [movimentacoes, setMovimentacoes] = useState([
    {
      id: 1,
      produtoId: 1,
      produtoNome: 'Guia da Corrente KTM Azul',
      tipo: 'saida',
      quantidade: 10,
      data: '2026-05-24',
      observacao: 'Venda do dia',
    },
    {
      id: 2,
      produtoId: 2,
      produtoNome: 'Guia da Corrente KTM Laranja',
      tipo: 'entrada',
      quantidade: 500,
      data: '2026-05-24',
      observacao: 'Compra de fornecedor',
    },
  ])

  const produtosAtivos = produtos.filter((produto) => produto.ativo)

  const produtosBaixoEstoque = produtosAtivos.filter(
    (produto) => produto.estoqueAtual < produto.estoqueMinimo
  )

  const saidasNoMes = movimentacoes
    .filter((movimentacao) => movimentacao.tipo === 'saida')
    .reduce((total, movimentacao) => total + movimentacao.quantidade, 0)

  const ultimasMovimentacoes = [...movimentacoes].slice(-5).reverse()

  function renderizarConteudo() {
    if (telaAtual === 'produtos') {
      return <Produtos produtos={produtos} setProdutos={setProdutos} />
    }

    if (telaAtual === 'movimentacoes') {
      return (
        <Movimentacoes
          produtos={produtos}
          setProdutos={setProdutos}
          movimentacoes={movimentacoes}
          setMovimentacoes={setMovimentacoes}
        />
      )
    }

    if (telaAtual === 'relatorios') {
      return <Relatorios produtos={produtos} movimentacoes={movimentacoes} />
    }

    return (
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
          <p className="mt-2 text-slate-600">
            Resumo geral do estoque da empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Produtos cadastrados</p>
            <strong className="mt-2 block text-3xl text-slate-900">
              {produtosAtivos.length}
            </strong>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Saídas no mês</p>
            <strong className="mt-2 block text-3xl text-slate-900">
              {saidasNoMes}
            </strong>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Estoque baixo</p>
            <strong className="mt-2 block text-3xl text-red-600">
              {produtosBaixoEstoque.length}
            </strong>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-sm text-slate-500">Mais vendido</p>
            <strong className="mt-2 block text-lg text-slate-900">
              Em breve
            </strong>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-slate-900">
              Produtos com estoque baixo
            </h3>

            <div className="mt-4 space-y-3">
              {produtosBaixoEstoque.length > 0 ? (
                produtosBaixoEstoque.map((produto) => (
                  <div
                    key={produto.id}
                    className="rounded-xl border border-red-100 bg-red-50 p-4"
                  >
                    <p className="font-semibold text-slate-900">
                      {produto.nome}
                    </p>

                    <p className="mt-1 text-sm text-red-700">
                      Estoque atual: {produto.estoqueAtual} | Mínimo:{' '}
                      {produto.estoqueMinimo}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  Nenhum produto abaixo do estoque mínimo.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-slate-900">
              Últimas movimentações
            </h3>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-3">Produto</th>
                    <th className="py-3">Tipo</th>
                    <th className="py-3">Qtd.</th>
                    <th className="py-3">Data</th>
                  </tr>
                </thead>

                <tbody>
                  {ultimasMovimentacoes.map((movimentacao) => (
                    <tr key={movimentacao.id} className="border-b last:border-0">
                      <td className="py-3 text-slate-700">
                        {movimentacao.produtoNome}
                      </td>
                      <td className="py-3 text-slate-700">
                        {movimentacao.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </td>
                      <td className="py-3 text-slate-700">
                        {movimentacao.quantidade}
                      </td>
                      <td className="py-3 text-slate-700">
                        {movimentacao.data}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {ultimasMovimentacoes.length === 0 && (
                <p className="mt-4 text-sm text-slate-500">
                  Nenhuma movimentação registrada.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  function estiloBotaoMenu(tela) {
    return telaAtual === tela
      ? 'rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white'
      : 'rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100'
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-blue-600 font-semibold uppercase">
              Sistema de estoque
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Estoque Fácil
            </h1>
          </div>

          <nav className="flex flex-wrap gap-2">
            <button
              onClick={() => setTelaAtual('dashboard')}
              className={estiloBotaoMenu('dashboard')}
            >
              Dashboard
            </button>

            <button
              onClick={() => setTelaAtual('produtos')}
              className={estiloBotaoMenu('produtos')}
            >
              Produtos
            </button>

            <button
              onClick={() => setTelaAtual('movimentacoes')}
              className={estiloBotaoMenu('movimentacoes')}
            >
              Movimentações
            </button>

            <button
              onClick={() => setTelaAtual('relatorios')}
              className={estiloBotaoMenu('relatorios')}
            >
              Relatórios
            </button>

            <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
              Sair
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderizarConteudo()}
      </div>
    </main>
  )
}

export default Dashboard