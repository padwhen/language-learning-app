import { Route, Routes } from 'react-router-dom'
import { AllDecks } from './AllDecksPage'
import './App.css'
import { DeckDetailsPage } from './DeckDetailsPage'
import { IndexPage } from './IndexPage'
import axios from 'axios'
import { UserContextProvider } from './UserContext'

axios.defaults.baseURL = 'http://localhost:2323/api'
axios.defaults.withCredentials = true

function App() {
  return (
    <UserContextProvider>
      <Routes>
        <Route index element={<IndexPage />} />
        <Route path="/view-all-decks" element={<AllDecks />} />
        <Route path="/view-decks-id" element={<DeckDetailsPage />} />
      </Routes>      
    </UserContextProvider>
  )
}

export default App
