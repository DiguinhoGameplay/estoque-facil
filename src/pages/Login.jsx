function Login({ onLogin }) {
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
              placeholder="Digite sua senha"
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={onLogin}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 transition"
            >
            Entrar
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