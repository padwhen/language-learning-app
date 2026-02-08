import { useState, useEffect, useRef } from "react";
import { Label } from "../ui/label";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Send, AlertTriangle } from "lucide-react";
import { matchAnswer } from "@/utils/answerMatching";
import type { MatchResult } from "@/utils/answerMatching";
import { QuestionTypeHint } from "./QuestionTypeHint";

interface TypeAnswerQuestionProps {
    data: {
        userLangCard: string;
        correctAnswer: string;
        cardId: string;
        cardScore: number;
        questionType?: string;
    };
    save: (answerIndex: number, correct: boolean, cardId: string, cardScore: number, userAnswerText?: string, isPartial?: boolean) => void;
    isReviewMode: boolean;
}

export const TypeAnswerQuestion: React.FC<TypeAnswerQuestionProps> = (props) => {
    const [userInput, setUserInput] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [matchResult, setMatchResult] = useState<MatchResult>('wrong');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const submitAnswer = () => {
        if (submitted || !userInput.trim()) return;
        setSubmitted(true);
        const result = matchAnswer(userInput, props.data.correctAnswer);
        setMatchResult(result);

        const isCorrect = result === 'exact' || result === 'partial';
        const isPartial = result === 'partial';

        setTimeout(() => {
            props.save(
                isCorrect ? 0 : -1,
                isCorrect,
                props.data.cardId,
                props.data.cardScore,
                userInput.trim(),
                isPartial
            );
        }, 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            submitAnswer();
        }
    };

    const isCorrect = matchResult === 'exact' || matchResult === 'partial';

    return (
        <div className="flex flex-col space-y-6 w-full max-w-4xl mx-auto" data-testid="type-answer-box">
            {props.data.questionType && <QuestionTypeHint questionType={props.data.questionType} />}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Label className="text-3xl sm:text-4xl md:text-5xl font-bold block text-center mb-6">
                    {props.data.userLangCard}
                </Label>
            </motion.div>

            <motion.div
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <Label className="text-xl sm:text-2xl mb-4 block">
                    {props.data.questionType === 'reverse-type' ? 'Type the word in the target language' : 'Type the English translation'}
                </Label>
                <div className="max-w-2xl mx-auto space-y-4">
                    <motion.div
                        animate={submitted && matchResult === 'wrong' ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <Input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={(e) => !submitted && setUserInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={submitted}
                            placeholder="Type your answer..."
                            className={`text-lg py-6 px-6 ${
                                submitted
                                    ? matchResult === 'exact'
                                        ? "border-green-500 bg-green-50 text-green-800"
                                        : matchResult === 'partial'
                                        ? "border-yellow-500 bg-yellow-50 text-yellow-800"
                                        : "border-red-500 bg-red-50 text-red-800"
                                    : ""
                            }`}
                        />
                    </motion.div>

                    {!submitted && (
                        <Button
                            onClick={submitAnswer}
                            disabled={!userInput.trim()}
                            className="w-full py-6 text-lg flex items-center justify-center gap-2"
                        >
                            <Send className="h-5 w-5" />
                            Submit Answer
                        </Button>
                    )}

                    <AnimatePresence>
                        {submitted && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className={`flex items-center gap-3 p-4 rounded-lg ${
                                    matchResult === 'exact'
                                        ? "bg-green-100 border border-green-300"
                                        : matchResult === 'partial'
                                        ? "bg-yellow-100 border border-yellow-300"
                                        : "bg-red-100 border border-red-300"
                                }`}
                            >
                                {matchResult === 'exact' ? (
                                    <>
                                        <FaCheckCircle size={24} className="text-green-600" />
                                        <span className="text-green-800 font-medium text-lg">Correct!</span>
                                    </>
                                ) : matchResult === 'partial' ? (
                                    <>
                                        <AlertTriangle size={24} className="text-yellow-600" />
                                        <div>
                                            <span className="text-yellow-800 font-medium text-lg">Partially correct</span>
                                            <p className="text-yellow-700 text-sm mt-1">
                                                Full answer: <span className="font-semibold">{props.data.correctAnswer}</span>
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <FaTimesCircle size={24} className="text-red-600" />
                                        <div>
                                            <span className="text-red-800 font-medium text-lg">Incorrect</span>
                                            <p className="text-red-700 text-sm mt-1">
                                                Correct answer: <span className="font-semibold">{props.data.correctAnswer}</span>
                                            </p>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <AnimatePresence>
                {!submitted && (
                    <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Button
                            variant="link"
                            className="w-full text-lg hover:scale-105 transition-transform"
                            onClick={() => {
                                setUserInput("");
                                setSubmitted(true);
                                setMatchResult('wrong');
                                setTimeout(() => {
                                    props.save(-1, false, props.data.cardId, props.data.cardScore, "");
                                }, 1500);
                            }}
                        >
                            Don't know?
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {submitted && (
                    <motion.div
                        className="mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <motion.div className="text-center text-xl">
                            <motion.span
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                Moving to next question...
                            </motion.span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
