import { useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(false)

  if (!usuarioLogado) {
    return <Login onLogin={() => setUsuarioLogado(true)} />
  }

  return <Dashboard />
}

export default App