import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"

export const Question = (props: any) => {
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
            props.save(selectedAnswer === props.data.answer);
        }, 1000); // Delay to show the correct/incorrect answer before moving to next question
    }

    const checkAnswer = (val: any) => {
        if (val === answer && val === props.data.answer) {
            return true;
        }
        if (val === answer && val !== props.data.answer) {
            return false;
        }
        if (val !== answer && val === props.data.answer) {
            return true;
        }
    }

    return (
        <div className="flex flex-col">
            <Label className="text-3xl mb-4">{props.data.text}</Label>
            {props.data.options.map((x: any, i: any) => {
                return (
                <div key={i} 
                     className={`${answer === x ? 'border-[#aaa]' : ''} border px-2 py-2 mt-1 mb-1 rounded flex justify-between items-center cursor-pointer`}
                     onClick={() => submitted ? '' : submitAnswer(x)}>
                    <span>{i + 1}. {x}</span>
                    {submitted && checkAnswer(x) === true && <FaCheckCircle size={20} color="#0cde0c"></FaCheckCircle>}
                    {submitted && checkAnswer(x) === false && <FaTimesCircle size={20} color="#de3c3c"></FaTimesCircle>}
                </div>)
            })}
            <Separator className="my-2" />
            {submitted && <div className="mt-1">Moving to next question...</div>}
        </div>
    )
}