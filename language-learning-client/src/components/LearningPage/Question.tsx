import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"
import { Button } from "../ui/button";

interface QuestionProps {
    data: {
        userLangCard: string;
        options: string[];
        correctAnswer: string;
        cardId: string;
        cardScore: number;
    };
    save: (answer: string, correct: boolean, cardId: string, cardScore: number) => void;
}

export const Question: React.FC<QuestionProps> = (props) => {
    const [answer, setAnswer] = useState('')
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!submitted && ['1', '2', '3', '4'].includes(event.key)) {
                const index = parseInt(event.key) - 1;
                if (index < props.data.options.length) {
                    setAnswer(props.data.options[index]);
                    submitAnswer(props.data.options[index]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [submitted, props.data.options]);

    const submitAnswer = (selectedAnswer: string) => {
        setAnswer(selectedAnswer);
        setSubmitted(true);
        setTimeout(() => {
            const isCorrect = selectedAnswer === props.data.correctAnswer
            props.save(selectedAnswer, isCorrect, props.data.cardId, props.data.cardScore);
        }, 1000); 
    }

    const checkAnswer = (val: any) => {
        if (val === answer && val === props.data.correctAnswer) {
            return true;
        }
        if (val === answer && val !== props.data.correctAnswer) {
            return false;
        }
        if (val !== answer && val === props.data.correctAnswer) {
            return true;
        }
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
                            variant={answer === option ? "default" : "outline"}
                            className="justify-between text-lg sm:text-xl py-6 px-6"
                            onClick={() => !submitted && submitAnswer(option)}
                            disabled={submitted}
                            data-testid="answer-test"
                        >
                            <span>{index + 1}. {option}</span>
                            {submitted && checkAnswer(option) === true && <FaCheckCircle size={24} color="#0cde0c" />}
                            {submitted && checkAnswer(option) === false && <FaTimesCircle size={24} color="#de3c3c" />}
                        </Button>
                    ))}
                </div>
            </div>
            {!submitted && (
                <Button variant="link" className="w-full text-lg" onClick={() => submitAnswer('')}>
                    Don't know?
                </Button>
            )}
            {submitted && <div className="mt-4 text-center text-xl">Moving to next question...</div>}
        </div>
    )
}