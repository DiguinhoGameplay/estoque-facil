import { useState } from 'react'
import { supabase } from '../services/supabase'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

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

  async function entrar() {
    setErro('')

    if (!email.trim()) {
      setErro('Informe seu e-mail.')
      return
    }

    if (!senha.trim()) {
      setErro('Informe sua senha.')
      return
    }

    setCarregando(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('E-mail ou senha inválidos.')
      setCarregando(false)
      return
    }

    const usuarioAuth = data.user

    const { data: usuarioSistema, error: erroUsuario } = await supabase
      .from('usuarios')
      .select('id, empresa_id, nome, email, perfil, ativo')
      .eq('id', usuarioAuth.id)
      .single()

    if (erroUsuario || !usuarioSistema) {
      setErro('Usuário não encontrado no sistema.')
      await supabase.auth.signOut()
      setCarregando(false)
      return
    }

    if (!usuarioSistema.ativo) {
      setErro('Este usuário está inativo.')
      await supabase.auth.signOut()
      setCarregando(false)
      return
    }

    const empresas = await buscarEmpresasDoUsuario(usuarioSistema.id)

    if (empresas.length === 0) {
      setErro('Nenhuma empresa vinculada a este usuário.')
      await supabase.auth.signOut()
      setCarregando(false)
      return
    }

    onLogin(usuarioSistema, empresas)
    setCarregando(false)
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <section className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Sistema de estoque
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Estoque Fácil
          </h1>

          <p className="mt-3 text-slate-600">
            Controle produtos, entradas, saídas, estoque mínimo e relatórios mensais em um só lugar.
          </p>
        </div>

        <form className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Digite seu e-mail"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Digite sua senha"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {erro && (
            <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                {erro}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={entrar}
            disabled={carregando}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          MVP inicial em desenvolvimento
        </p>
      </section>
    </main>
  )
}

export default Login