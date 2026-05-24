import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { supabase } from './services/supabase'

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(false)

  useEffect(() => {
    console.log('Supabase conectado:', supabase)
  }, [])

  if (!usuarioLogado) {
    return <Login onLogin={() => setUsuarioLogado(true)} />
  }

  return <Dashboard />
}

export default App