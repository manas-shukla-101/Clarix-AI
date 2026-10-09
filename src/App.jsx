import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Inspect from './pages/Inspect'
import Transform from './pages/Transform'
import Load from './pages/Load'
import SharedView from './pages/SharedView'

function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-sans transition-colors">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/inspect" element={<Inspect />} />
        <Route path="/transform" element={<Transform />} />
        <Route path="/load" element={<Load />} />
        <Route path="/d/:slug" element={<SharedView />} />
      </Routes>
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App