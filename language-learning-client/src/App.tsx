import { Route, Routes, useLocation } from 'react-router-dom'
import { AllDecks } from './AllDecksPage'
import './App.css'
import { DeckDetailsPage } from './DeckDetailsPage'
import { IndexPage } from './IndexPage'
import axios from 'axios'
import { UserContextProvider } from './UserContext'
import { DeckContextProvider } from './DeckContext'
import LearningPage from './components/DeckDetailsComponents/LearningPage'
import { Toaster } from "@/components/ui/toaster"
import { Header } from './components/Header'


axios.defaults.baseURL = 'http://localhost:2323/api/'
axios.defaults.withCredentials = true

function App() {
  const location = useLocation();
  return (
    <UserContextProvider>
      <DeckContextProvider>
        {location.pathname !== '/' && <Header />}
        <Routes>
          <Route index element={<IndexPage />} />
          <Route path="/view-all-decks" element={<AllDecks />} />
          <Route path="/view-decks/:id" element={<DeckDetailsPage />} />
          <Route path="/learn-decks/:id" element={<LearningPage />} />
          <Route path="/view-decks/:id" element={<DeckDetailsPage />} />
        </Routes>              
        <Toaster />
      </DeckContextProvider>
    </UserContextProvider>
  )
}

export default App
