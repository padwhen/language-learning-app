import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AllDecks } from './pages/AllDecksPage'
import './App.css'
import { DeckDetailsPage } from './pages/DeckDetailsPage'
import { IndexPage } from './pages/IndexPage'
import axios from 'axios'
import { UserContextProvider } from './contexts/UserContext'
import { DeckContextProvider } from './contexts/DeckContext'
import { SidebarProvider, useSidebar } from './contexts/SidebarContext'
import { Toaster } from "@/components/ui/toaster"
import { Header } from './components/Header'
import { EditPage } from './components/edit-deck/edit-deck'
import { QuizReport } from './components/LearningReport'
import { FlashcardPage } from './components/DeckDetailsComponents/FlashCardPage'
import { MatchGame } from './components/DeckDetailsComponents/MatchGame'
import { TestPage } from './components/DeckDetailsComponents/TestPageComponents/TestPage'
import { VocabularyPage } from './components/vocabulary-page'
import { useEffect } from 'react'
import { LearningPage } from './components/LearningPage/LearningPage'
import { ReviewPage } from './components/ReviewPage/ReviewPage'
import { SettingsPage } from './components/SettingsPage'
import { Sidebar } from './components/Sidebar'
import { SavedSentencesPage } from './components/SavedSentencesPage'

axios.defaults.baseURL = 'http://localhost:2323/api/'
axios.defaults.withCredentials = true

function App() {
  const location = useLocation();
  const navigate = useNavigate()
  
  useEffect(() => {
      const userId = localStorage.getItem('userId')
      if (!userId) navigate('/')
  }, [navigate])

  const handleStartTour = () => {
  };

  return (
    <UserContextProvider>
      <DeckContextProvider>
        <SidebarProvider>
          <AppContent 
            location={location} 
            handleStartTour={handleStartTour} 
          />
        </SidebarProvider>
      </DeckContextProvider>
    </UserContextProvider>
  )
}

const AppContent = ({ location, handleStartTour }: { location: any, handleStartTour: () => void }) => {
  const { sidebarWidth } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <Sidebar onStartTour={handleStartTour} />
      <div 
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {/* Show Header on mobile */}
        {location.pathname !== '/' && (
          <div className="md:hidden">
            <Header onStartTour={handleStartTour} />
          </div>
        )}
        <Routes>
          {/* Routes that need deck context */}
          <Route index element={<IndexPage />} />
          <Route path="/view-all-decks" element={<AllDecks />} />
          <Route path="/view-decks/:id" element={<DeckDetailsPage />} />
          <Route path="/learn-decks/:id" element={<LearningPage />} />
          <Route path="/edit-deck/:id" element={<EditPage />} />
          <Route path='/view-decks/:id/learning-report/:reportId' element={<QuizReport />} />
          <Route path='/flashcards/:id' element={<FlashcardPage />} />
          <Route path='/matchgame/:id' element={<MatchGame />} />
          <Route path='/testpage/:id' element={<TestPage />} />
          <Route path='/vocabulary' element={<VocabularyPage />} />
          <Route path='/review-page/:id' element={<ReviewPage />} />
          <Route path='/saved-sentences' element={<SavedSentencesPage />} />
          
          {/* Routes that DON'T need deck context */}
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  )
}

export default App
