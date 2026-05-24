import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { supabase } from './services/supabase'

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null)
  const [empresasUsuario, setEmpresasUsuario] = useState([])
  const [empresaAtiva, setEmpresaAtiva] = useState(null)
  const [carregandoSessao, setCarregandoSessao] = useState(true)

  useEffect(() => {
    verificarSessao()
  }, [])

  async function buscarEmpresasDoUsuario(usuarioId) {
    const { data, error } = await supabase
      .from('usuario_empresas')
      .select(`
        empresa_id,
        perfil,
        empresas (
          id,
          nome
        )
      `)
      .eq('usuario_id', usuarioId)
      .eq('ativo', true)

    if (error) {
      console.error('Erro ao buscar empresas do usuário:', error)
      return []
    }

    return data.map((item) => ({
      id: item.empresas.id,
      nome: item.empresas.nome,
      perfil: item.perfil,
    }))
  }

  async function verificarSessao() {
    const { data } = await supabase.auth.getSession()

    const usuarioAuth = data.session?.user

    if (!usuarioAuth) {
      setCarregandoSessao(false)
      return
    }

    const { data: usuarioSistema, error } = await supabase
      .from('usuarios')
      .select('id, empresa_id, nome, email, perfil, ativo')
      .eq('id', usuarioAuth.id)
      .single()

    if (error || !usuarioSistema || !usuarioSistema.ativo) {
      await supabase.auth.signOut()
      setUsuarioLogado(null)
      setEmpresasUsuario([])
      setEmpresaAtiva(null)
      setCarregandoSessao(false)
      return
    }

    const empresas = await buscarEmpresasDoUsuario(usuarioSistema.id)

    if (empresas.length === 0) {
      await supabase.auth.signOut()
      setUsuarioLogado(null)
      setEmpresasUsuario([])
      setEmpresaAtiva(null)
      setCarregandoSessao(false)
      return
    }

    setUsuarioLogado(usuarioSistema)
    setEmpresasUsuario(empresas)
    setEmpresaAtiva(empresas[0])
    setCarregandoSessao(false)
  }

  function aoLogar(usuarioSistema, empresas) {
    setUsuarioLogado(usuarioSistema)
    setEmpresasUsuario(empresas)
    setEmpresaAtiva(empresas[0])
  }

  async function sair() {
    await supabase.auth.signOut()
    setUsuarioLogado(null)
    setEmpresasUsuario([])
    setEmpresaAtiva(null)
  }

  if (carregandoSessao) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-slate-600">Carregando sistema...</p>
        </div>
      </main>
    )
  }

  if (!usuarioLogado) {
    return <Login onLogin={aoLogar} />
  }

  return (
    <Dashboard
      usuarioLogado={usuarioLogado}
      empresasUsuario={empresasUsuario}
      empresaAtiva={empresaAtiva}
      setEmpresaAtiva={setEmpresaAtiva}
      onLogout={sair}
    />
  )
}

export default App