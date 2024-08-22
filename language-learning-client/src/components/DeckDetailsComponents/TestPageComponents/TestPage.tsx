import { useMemo, useState } from 'react'
import { PassageSection } from './PassageSection'
import { Button } from '@/components/ui/button'
import { SynonymMatchingSections } from './SynonymMatchingSection'
import { WordScramble } from './WordScrambleSection'
import Countdown from 'react-countdown'
import { QuestionNav } from './QuestionNav'
import { SubmitButton } from './SubmitButton'
import { GradeStatistics } from './GradeStatistics'
import { Statistics } from '@/types'
import { useTestSubmit } from '@/state/hooks/useTestSubmit'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ResponsiveBar } from '@nivo/bar'
import { generateTest } from './createTest'
import { WordSelectionDialog } from './WordSectionDialog'
import { LoadingSection } from './LoadingSection'


export const TestPage =  () => {
    const [test, setTest] = useState<any | null>(null)
    const [isWordSelectionOpen, setIsWordSelectionOpen] = useState(true)
    const [currentSection, setCurrentSection] = useState<'passage' | 'synonym' | 'scramble'>('passage')
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [grade, setGrade] = useState<string | null>(null)
    const [statistics, setStatistics] = useState<Statistics | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    const { handleSubmit } = useTestSubmit(answers, setGrade, setStatistics, test)

    const endTime = useMemo(() => Date.now() + 20 * 60 * 1000, [])

    const handleWordSelectionClose = async (cards: any[] | null) => {
        setIsWordSelectionOpen(false)
        if (cards) {
            setIsLoading(true)
            try {
                const generatedTest = await generateTest(cards)
                setTest(generatedTest)                
            } finally {
                setIsLoading(false)
            }
        }
    }

    const handleAnswer = (questionId: string, answer: string) => {
        if (!isSubmitted) {
            setAnswers(prevAnswers => ({...prevAnswers, [questionId]: answer}))
        }
    }

    const renderer = ({ minutes, seconds, completed }: { minutes: number, seconds: number, completed: boolean}) => {
        if (completed || isSubmitted) {
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

    const onSubmit = () => {
        setIsSubmitted(true)
        handleSubmit()
    }

    const fractionToNumber = (fraction: string): number => {
        const [numerator, denominator] = fraction.split('/').map(Number)
        return numerator / denominator
    }

    const chartData = statistics ? [
        { section: 'Passage', score: fractionToNumber(statistics.passageScore) }, 
        { section: 'Synonym', score: fractionToNumber(statistics.synonymScore) },
        { section: 'Scramble', score: fractionToNumber(statistics.scrambleScore) }
    ] : []

    const getStatisticScore = (stats: Statistics | null, indexValue: string | number): string => {
        if (!stats) return 'N/A';
        const key = `${String(indexValue).toLowerCase()}Score` as keyof Statistics;
        return key in stats ? stats[key] as string : 'N/A';
    };

    return (
        <div className='flex h-screen p-4'>
            <WordSelectionDialog
                isOpen={isWordSelectionOpen}
                onClose={handleWordSelectionClose}
            />
            {isLoading ? (
                <LoadingSection />
            ) : !test ? (
                <div className="flex items-center justify-center w-full h-full">
                    <p className="text-lg">Please select words to start the test by refresh the page.</p>
                </div>
            ): (
                <>
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
                    mockData={test}    
                />
                <div className={isSubmitted ? 'hidden' : ''}><SubmitButton onSubmit={onSubmit} /></div>
                {grade && statistics && (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="link" className="mt-4 w-full">Click here to see the result</Button>
                        </DialogTrigger>
                        <DialogContent className='sm:max-w-[425px]'>
                            <GradeStatistics grade={grade} statistics={statistics} />
                            <div style={{ height: 300}}>
                                <ResponsiveBar 
                                    data={chartData} 
                                    keys={['score']} 
                                    indexBy="section"
                                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                                    padding={0.3}
                                    colors={{ scheme: 'nivo' }}
                                    axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Section', legendPosition: 'middle', legendOffset: 32 }}
                                    axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Score', legendPosition: 'middle', legendOffset: -40, format: (value) => `${(value * 100).toFixed(0)}%` }}
                                    label={(datum) => getStatisticScore(statistics, datum.indexValue)}
                                    labelSkipWidth={12}
                                    labelSkipHeight={12}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
            <div className='w-3/4 overflow-y-auto'>
                {currentSection === 'passage' && <PassageSection passage={test.passage} handleAnswer={handleAnswer} isSubmitted={isSubmitted} answers={answers} />}
                {currentSection === 'synonym' && <SynonymMatchingSections questions={test.questions.synonym_matching} handleAnswer={handleAnswer} isSubmitted={isSubmitted} answers={answers} />}
                {currentSection === 'scramble' && <WordScramble questions={test.questions.word_scramble} handleAnswer={handleAnswer} isSubmitted={isSubmitted} answers={answers} />}
            </div>                
        </>)}
        </div>
    )
}