import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Navbar from './components/Navbar'

import Home from './pages/Home'
import Archive from './pages/Archive'

export default function SiteBase() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Header />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}