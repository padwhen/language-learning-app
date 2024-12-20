import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AllDecks } from './AllDecksPage'
import './App.css'
import { DeckDetailsPage } from './DeckDetailsPage'
import { IndexPage } from './IndexPage'
import axios from 'axios'
import { UserContextProvider } from './UserContext'
import { DeckContextProvider } from './DeckContext'
import { Toaster } from "@/components/ui/toaster"
import { Header } from './components/Header'
import { EditPage } from './components/edit-deck/edit-deck'
import { SettingPage } from './components/settings/settings'
import { QuizReport } from './components/LearningReport'
import { FlashcardPage } from './components/DeckDetailsComponents/FlashCardPage'
import { MatchGame } from './components/DeckDetailsComponents/MatchGame'
import { TestPage } from './components/DeckDetailsComponents/TestPageComponents/TestPage'
import { VocabularyPage } from './components/vocabulary-page'
import { useEffect } from 'react'
import { LearningPage } from './components/LearningPage/LearningPage'
import { ReviewPage } from './components/ReviewPage/ReviewPage'

axios.defaults.baseURL = 'http://localhost:2323/api/'
axios.defaults.withCredentials = true

function App() {
  const location = useLocation();
  const navigate = useNavigate()
  useEffect(() => {
      const userId = localStorage.getItem('userId')
      if (!userId) navigate('/')
  }, [navigate])

  return (
    <UserContextProvider>
      <DeckContextProvider>
        {location.pathname.startsWith('/') && <Header />}
        <Routes>
          <Route index element={<IndexPage />} />
          <Route path="/view-all-decks" element={<AllDecks />} />
          <Route path="/view-decks/:id" element={<DeckDetailsPage />} />
          <Route path="/learn-decks/:id" element={<LearningPage />} />
          <Route path="/edit-deck/:id" element={<EditPage />} />
          <Route path="/settings" element={<SettingPage />} />
          <Route path='/view-decks/:id/learning-report/:reportId' element={<QuizReport />} />
          <Route path='/flashcards/:id' element={<FlashcardPage />} />
          <Route path='/matchgame/:id' element={<MatchGame />} />
          <Route path='/testpage/:id' element={<TestPage />} />
          <Route path='/vocabulary' element={<VocabularyPage />} />
          <Route path='/review-page/:id' element={<ReviewPage />} />
        </Routes>              
        <Toaster />
      </DeckContextProvider>
    </UserContextProvider>
  )
}

export default App
