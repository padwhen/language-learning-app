import { Route, Routes } from 'react-router-dom'
import { AllDecks } from './AllDecksPage'
import './App.css'
import { DeckDetailsPage } from './DeckDetailsPage'
import { IndexPage } from './IndexPage'
import axios from 'axios'
import { UserContextProvider } from './UserContext'
import { DeckContextProvider } from './DeckContext'
import LearningPage from './components/DeckDetailsComponents/LearningPage'

axios.defaults.baseURL = 'https://padwhen-learningapp.fly.dev/api'
axios.defaults.withCredentials = true

function App() {
  return (
    <UserContextProvider>
      <DeckContextProvider>
        <Routes>
          <Route index element={<IndexPage />} />
          <Route path="/view-all-decks" element={<AllDecks />} />
          <Route path="/view-decks/:id" element={<DeckDetailsPage />} />
          <Route path="/learn-decks/:id" element={<LearningPage />} />
        </Routes>              
      </DeckContextProvider>
    </UserContextProvider>
  )
}

export default App
