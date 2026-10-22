import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Navbar from './components/Navbar'

import Home from './pages/Home'

export default function SiteBase() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Header />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}