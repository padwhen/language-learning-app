import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"
import { Button } from "../ui/button";

interface QuestionProps {
    data: {
        userLangCard: string;
        options: string[];
        correctAnswer: string;
        correctIndex: number;
        cardId: string;
        cardScore: number;
    };
    save: (answerIndex: number, correct: boolean, cardId: string, cardScore: number) => void;
    isReviewMode: boolean
}

export const Question: React.FC<QuestionProps> = (props) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!submitted && ['1', '2', '3', '4'].includes(event.key)) {
                const index = parseInt(event.key) - 1;
                if (index < props.data.options.length) {
                    setSelectedIndex(index);
                    submitAnswer(index);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [submitted, props.data.options]);

    const submitAnswer = (index: number) => {
        setSelectedIndex(index);
        setSubmitted(true);
        setTimeout(() => {
            const isCorrect = index === props.data.correctIndex
            props.save(index, isCorrect, props.data.cardId, props.data.cardScore);
        }, 1000); 
    }

    const checkAnswer = (index: number) => {
        if (index === selectedIndex && index === props.data.correctIndex) {
            return true;
        }
        if (index === selectedIndex && index !== props.data.correctIndex) {
            return false;
        }
        if (index !== selectedIndex && index === props.data.correctIndex) {
            return true;
        }
        return undefined
    }

    return (
        <div className="flex flex-col space-y-6 w-full max-w-3xl mx-auto" data-testid="question-box">
            <div>
                <Label className="text-3xl sm:text-4xl md:text-5xl font-bold block text-center mb-6">
                    {props.data.userLangCard}
                </Label>
            </div>
            <div className="w-full">
                <Label className="text-xl sm:text-2xl mb-4 block">Choose matching term</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {props.data.options.map((option: string, index: number) => (
                        <Button 
                            key={index} 
                            variant={selectedIndex === index ? "default" : "outline"}
                            className="justify-between text-lg sm:text-xl py-6 px-6"
                            onClick={() => !submitted && submitAnswer(index)}
                            disabled={submitted}
                            data-testid="answer-test"
                        >
                            <span>{index + 1}. {option}</span>
                            {submitted && checkAnswer(index) === true && <FaCheckCircle size={24} color="#0cde0c" />}
                            {submitted && checkAnswer(index) === false && <FaTimesCircle size={24} color="#de3c3c" />}
                        </Button>
                    ))}
                </div>
            </div>
            {!submitted && (
                <Button variant="link" className="w-full text-lg" onClick={() => submitAnswer(-1)}>
                    Don't know?
                </Button>
            )}
            {submitted && <div className="mt-4 text-center text-xl">Moving to next question...</div>}
        </div>
    )
}