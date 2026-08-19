import { useState } from 'react'
import { HANBIN_DATA } from './data/hanbinData'
import { Header } from './components/Header'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="app-container">
      {/* Header com a nova lógica de abas */}
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="content-body">
        {/* Aqui vamos construindo o conteúdo de cada aba aos poucos */}
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h2 style={{ textTransform: 'uppercase', letterSpacing: '2px' }}>
            Visualizando: {currentView}
          </h2>
          <p style={{ color: '#666' }}>Abaixo desta barra vamos construir o conteúdo...</p>
        </div>
      </main>
    </div>
  )
}

export default App;