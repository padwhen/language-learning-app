import { Button } from "@/components/ui/button";

interface QuestionNavProps {
    answeredQuestions: Record<string, string>
    currentSection: string;
    onQuestionClick: (questionNumber: number) => void;
    mockData: any
}

export const QuestionNav: React.FC<QuestionNavProps> = ({
    mockData, answeredQuestions, currentSection, onQuestionClick
}) => {
    const getTotalQuestions = () => {
        switch(currentSection) {
            case 'passage':
                return Object.keys(mockData.passage.blanks).length;
            case 'synonym':
                return mockData.questions.synonym_matching.length;
            case 'scramble':
                return mockData.questions.word_scramble.length;
            default:
                return 0;
        }
    }
    const totalQuestions = getTotalQuestions();
    return (
        <div>
            <h1 className="text-xl font-bold capitalize">{currentSection} Questions</h1>
            <div className="grid grid-cols-5 gap-2 mt-4">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num, index) => (
                    <Button key={num} 
                        onClick={() => onQuestionClick(num)}
                        className={`
                            ${answeredQuestions[`${currentSection}_${num - 1}`] ? 'bg-green-500 opacity-50' : 'bg-blue-500'}
                            hover:opacity-100 transition-opacity
                        `}
                        id={`question_${index + 1}`}
                    >
                        {num}. {answeredQuestions[`${currentSection}_${num - 1}`] && '✓'}
                    </Button>
                ))}
            </div>
        </div>
    )
}