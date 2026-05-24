import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import Produtos from './Produtos'
import Movimentacoes from './Movimentacoes'
import Relatorios from './Relatorios'

function Dashboard({
  usuarioLogado,
  empresasUsuario,
  empresaAtiva,
  setEmpresaAtiva,
  onLogout,
}) {
  const [telaAtual, setTelaAtual] = useState('dashboard')

  const [produtos, setProdutos] = useState([])
  const [carregandoProdutos, setCarregandoProdutos] = useState(false)

  const [movimentacoes, setMovimentacoes] = useState([])
  const [carregandoMovimentacoes, setCarregandoMovimentacoes] = useState(false)

  useEffect(() => {
    if (empresaAtiva?.id) {
      carregarProdutos()
      carregarMovimentacoes()
    }
  }, [empresaAtiva])

  async function carregarProdutos() {
    setCarregandoProdutos(true)

    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('empresa_id', empresaAtiva.id)
      .order('criado_em', { ascending: false })

    if (error) {
      console.error('Erro ao carregar produtos:', error)
      alert('Erro ao carregar produtos.')
      setCarregandoProdutos(false)
      return
    }

    const produtosFormatados = data.map((produto) => ({
      id: produto.id,
      empresaId: produto.empresa_id,
      nome: produto.nome,
      codigo: produto.codigo || 'Sem código',
      categoria: produto.categoria || 'Sem categoria',
      estoqueAtual: produto.estoque_atual,
      estoqueMinimo: produto.estoque_minimo,
      observacao: produto.observacao || '',
      ativo: produto.ativo,
    }))

    setProdutos(produtosFormatados)
    setCarregandoProdutos(false)
  }

  async function carregarMovimentacoes() {
    setCarregandoMovimentacoes(true)

    const { data, error } = await supabase
      .from('movimentacoes')
      .select(`
        *,
        produtos (
          nome
        )
      `)
      .eq('empresa_id', empresaAtiva.id)
      .order('data_movimentacao', { ascending: false })
      .order('criada_em', { ascending: false })

    if (error) {
      console.error('Erro ao carregar movimentações:', error)
      alert('Erro ao carregar movimentações.')
      setCarregandoMovimentacoes(false)
      return
    }

    const movimentacoesFormatadas = data.map((movimentacao) => ({
      id: movimentacao.id,
      empresaId: movimentacao.empresa_id,
      produtoId: movimentacao.produto_id,
      produtoNome: movimentacao.produtos?.nome || 'Produto não encontrado',
      usuarioId: movimentacao.usuario_id,
      tipo: movimentacao.tipo,
      quantidade: movimentacao.quantidade,
      data: movimentacao.data_movimentacao,
      observacao: movimentacao.observacao || '',
      criadaEm: movimentacao.criada_em,
    }))

    setMovimentacoes(movimentacoesFormatadas)
    setCarregandoMovimentacoes(false)
  }

  const produtosAtivos = produtos.filter((produto) => produto.ativo)

  const produtosBaixoEstoque = produtosAtivos.filter(
    (produto) => produto.estoqueAtual < produto.estoqueMinimo
  )

  const dataAtual = new Date()
  const mesAtual = String(dataAtual.getMonth() + 1).padStart(2, '0')
  const anoAtual = String(dataAtual.getFullYear())

  const movimentacoesDoMes = movimentacoes.filter((movimentacao) => {
    const [ano, mes] = movimentacao.data.split('-')

    return ano === anoAtual && mes === mesAtual
  })

  const saidasNoMes = movimentacoesDoMes
    .filter((movimentacao) => movimentacao.tipo === 'saida')
    .reduce((total, movimentacao) => total + movimentacao.quantidade, 0)

  const produtoMaisVendido = movimentacoesDoMes
    .filter((movimentacao) => movimentacao.tipo === 'saida')
    .reduce((ranking, movimentacao) => {
      const produtoExistente = ranking.find(
        (item) => item.produtoId === movimentacao.produtoId
      )

      if (produtoExistente) {
        produtoExistente.quantidade += movimentacao.quantidade
      } else {
        ranking.push({
          produtoId: movimentacao.produtoId,
          produtoNome: movimentacao.produtoNome,
          quantidade: movimentacao.quantidade,
        })
      }

      return ranking
    }, [])
    .sort((a, b) => b.quantidade - a.quantidade)[0]

  const ultimasMovimentacoes = [...movimentacoes].slice(0, 5)

  function renderizarConteudo() {
    if (telaAtual === 'produtos') {
      return (
        <Produtos
          produtos={produtos}
          setProdutos={setProdutos}
          empresaAtiva={empresaAtiva}
          carregandoProdutos={carregandoProdutos}
        />
      )
    }

    if (telaAtual === 'movimentacoes') {
      return (
        <Movimentacoes
          produtos={produtos}
          movimentacoes={movimentacoes}
          empresaAtiva={empresaAtiva}
          usuarioLogado={usuarioLogado}
          carregandoMovimentacoes={carregandoMovimentacoes}
          carregarProdutos={carregarProdutos}
          carregarMovimentacoes={carregarMovimentacoes}
        />
      )
    }

    if (telaAtual === 'relatorios') {
      return <Relatorios produtos={produtos} movimentacoes={movimentacoes} />
    }

    return (
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Painel Administrativo
          </h2>
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
              {produtoMaisVendido ? produtoMaisVendido.produtoNome : 'Sem vendas'}
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

            <p className="text-sm text-slate-500">
              Usuário: {usuarioLogado?.nome}
            </p>
          </div>

          <nav className="flex flex-wrap gap-2">
            {empresasUsuario.length > 1 && (
              <select
                value={empresaAtiva?.id || ''}
                onChange={(event) => {
                  const empresaSelecionada = empresasUsuario.find(
                    (empresa) => empresa.id === event.target.value
                  )

                  setEmpresaAtiva(empresaSelecionada)
                }}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {empresasUsuario.map((empresa) => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setTelaAtual('dashboard')}
              className={estiloBotaoMenu('dashboard')}
            >
              Painel Administrativo
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

            <button
              onClick={onLogout}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
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