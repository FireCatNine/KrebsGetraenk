import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'

import Home from './pages/Home'
import Archive from './pages/Archive'
import Poetry from './pages/Peotry'
import Upload from './pages/Upload'
import MonsterBlast from './pages/MonsterBlast'
import Karl from './pages/HolyKarlAISlop'

export default function SiteBase() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive/" element={<Archive />} />
          <Route path="/poetry/" element={<Poetry />} />
          <Route path="/upload/" element={<Upload />} />
          <Route path="/monsterblast/" element={<MonsterBlast />} />
          <Route path="/karl/" element={<Karl />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}