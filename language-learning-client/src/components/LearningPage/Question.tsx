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
    };
    save: (answer: string, correct: boolean, cardId: string) => void;
}

export const Question: React.FC<QuestionProps> = (props) => {
    console.log(props.data.correctAnswer)
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
            props.save(selectedAnswer, isCorrect, props.data.cardId);
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
        <div className="flex flex-col space-y-4" data-testid="question-box">
            <div>
                <Label className="text-2xl sm:text-3xl font-bold">{props.data.userLangCard}</Label>
            </div>
            <div>
                <Label>Choose matching term</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {props.data.options.map((option: string, index: number) => (
                        <Button 
                            key={index} 
                            variant={answer === option ? "default" : "outline"}
                            className="justify-between"
                            onClick={() => !submitted && submitAnswer(option)}
                            disabled={submitted}
                            data-testid="answer-test"
                        >
                            <span>{index + 1}. {option}</span>
                            {submitted && checkAnswer(option) === true && <FaCheckCircle size={20} color="#0cde0c" />}
                            {submitted && checkAnswer(option) === false && <FaTimesCircle size={20} color="#de3c3c" />}
                        </Button>
                    ))}
                </div>
            </div>
            {!submitted && (
                <Button variant="link" className="w-full" onClick={() => submitAnswer('')}>
                    Don't know?
                </Button>
            )}
            {submitted && <div className="mt-1">Moving to next question...</div>}
        </div>
    )
}