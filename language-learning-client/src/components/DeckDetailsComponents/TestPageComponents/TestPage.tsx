import { useMemo, useState } from 'react'
import mockData from './mockdata.json'  
import { PassageSection } from './PassageSection'
import { Button } from '@/components/ui/button'
import { SynonymMatchingSections } from './SynonymMatchingSection'
import { WordScramble } from './WordScrambleSection'
import { useParams } from 'react-router-dom'
import Countdown from 'react-countdown'
import useFetchDeck from '@/state/hooks/useFetchDeck'
import { QuestionNav } from './QuestionNav'


export const TestPage =  () => {
    const { id } = useParams()
    const { cards } = useFetchDeck(id)
    console.log(cards)
    const [currentSection, setCurrentSection] = useState<'passage' | 'synonym' | 'scramble'>('passage')
    const [answers, setAnswers] = useState<Record<string, string>>({})

    const endTime = useMemo(() => Date.now() + 20 * 60 * 1000, [])

    const handleAnswer = (questionId: string, answer: string) => {
        setAnswers({ ...answers, [questionId]: answer })
    }

    const renderer = ({ minutes, seconds, completed }: { minutes: number, seconds: number, completed: boolean}) => {
        if (completed) {
            return <span>Time's up!</span>
        } else {
            return <span>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>;
        }
    }

    const handleQuestionClick = (questionNumber: number) => {
        const element = document.getElementById(`question_${questionNumber}`)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <div className='flex h-screen p-4'>
            <div className='w-1/4 pr-4'>
                <h2 className='text-2xl font-bold mb-4'>Sections</h2>
                <Button 
                    onClick={() => setCurrentSection("passage")}
                    className='mb-2 w-full justify-start'
                    variant={currentSection === 'passage' ? 'default' : 'outline'}
                >
                    Passage
                </Button>
                <Button 
                    onClick={() => setCurrentSection("synonym")}
                    className='mb-2 w-full justify-start'
                    variant={currentSection === 'synonym' ? 'default' : 'outline'}
                >
                    Synonym Matching
                </Button>
                <Button
                    onClick={() => setCurrentSection('scramble')}
                    className='mb-2 w-full justify-start'
                    variant={currentSection === 'scramble' ? 'default' : 'outline'}
                >
                    Word Scramble    
                </Button> 
                <div className='mt-4'>
                    <p>Time left: <Countdown date={endTime} renderer={renderer} /></p>
                </div>
                <QuestionNav
                    answeredQuestions={answers}
                    currentSection={currentSection}
                    onQuestionClick={handleQuestionClick} 
                    mockData={mockData}    
                />
            </div>
            <div className='w-3/4 overflow-y-auto'>
                {currentSection === 'passage' && <PassageSection passage={mockData.passage} handleAnswer={handleAnswer} />}
                {currentSection === 'synonym' && <SynonymMatchingSections questions={mockData.questions.synonym_matching} handleAnswer={handleAnswer} />}
                {currentSection === 'scramble' && <WordScramble questions={mockData.questions.word_scramble} handleAnswer={handleAnswer} />}
            </div>
        </div>
    )
}