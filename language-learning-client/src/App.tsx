import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AllDecks } from './pages/AllDecksPage'
import './App.css'
import { DeckDetailsPage } from './pages/DeckDetailsPage'
import { IndexPage } from './pages/IndexPage'
import axios from 'axios'
import { UserContextProvider } from './contexts/UserContext'
import { DeckContextProvider } from './contexts/DeckContext'
import { TranslationContextProvider, useTranslationContext } from './contexts/TranslationContext'
import { Toaster } from "@/components/ui/toaster"
import { Header } from './components/Header'
import { LearningModeWidget } from './components/Global/LearningModeWidget'
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
import { GrammarPage } from './pages/GrammarPage'

axios.defaults.baseURL = 'http://localhost:2323/api/'
axios.defaults.withCredentials = true

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    showLearningWidget, 
    learningModeStep, 
    closeWidget, 
    isTranslationCompleted, 
    handleTranslationComplete,
    inputText,
    response 
  } = useTranslationContext();
  
  useEffect(() => {
      const userId = localStorage.getItem('userId')
      if (!userId) navigate('/')
  }, [navigate])

  const handleStartTour = () => {
  };

  return (
    <>
      {location.pathname !== '/' && <Header onStartTour={handleStartTour} />}
      <Routes>
        {/* Routes that need deck context */}
        <Route index element={
          <DeckContextProvider>
            <IndexPage />
          </DeckContextProvider>
        } />
        <Route path="/view-all-decks" element={
          <DeckContextProvider>
            <AllDecks />
          </DeckContextProvider>
        } />
        <Route path="/view-decks/:id" element={
          <DeckContextProvider>
            <DeckDetailsPage />
          </DeckContextProvider>
        } />
        <Route path="/learn-decks/:id" element={
          <DeckContextProvider>
            <LearningPage />
          </DeckContextProvider>
        } />
        <Route path="/edit-deck/:id" element={
          <DeckContextProvider>
            <EditPage />
          </DeckContextProvider>
        } />
        <Route path='/view-decks/:id/learning-report/:reportId' element={
          <DeckContextProvider>
            <QuizReport />
          </DeckContextProvider>
        } />
        <Route path='/flashcards/:id' element={
          <DeckContextProvider>
            <FlashcardPage />
          </DeckContextProvider>
        } />
        <Route path='/matchgame/:id' element={
          <DeckContextProvider>
            <MatchGame />
          </DeckContextProvider>
        } />
        <Route path='/testpage/:id' element={
          <DeckContextProvider>
            <TestPage />
          </DeckContextProvider>
        } />
        <Route path='/vocabulary' element={
          <DeckContextProvider>
            <VocabularyPage />
          </DeckContextProvider>
        } />
        <Route path='/review-page/:id' element={
          <DeckContextProvider>
            <ReviewPage />
          </DeckContextProvider>
        } />
        
        {/* Routes that DON'T need deck context */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/grammar" element={<GrammarPage />} />
      </Routes>
      
      {/* Global Learning Mode Widget - persists across all pages */}
      <LearningModeWidget
        isVisible={showLearningWidget}
        currentStep={learningModeStep}
        totalSteps={3}
        onClose={closeWidget}
        onComplete={handleTranslationComplete}
        isCompleted={isTranslationCompleted}
        completedSentence={inputText || ''}
      />
      
      <Toaster />
    </>
  );
};

function App() {
  return (
    <UserContextProvider>
      <TranslationContextProvider>
        <AppContent />
      </TranslationContextProvider>
    </UserContextProvider>
  )
}

export default App
